"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

async function recomputeQuoteTotal(supabase: SupabaseClient, quoteId: string) {
  const { data: items } = await supabase
    .from("quote_items")
    .select("quantity, unit_price")
    .eq("quote_id", quoteId);

  const total = (items ?? []).reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
    0
  );

  await supabase.from("quotes").update({ total }).eq("id", quoteId);
}

export async function createQuote(customerId: string, formData: FormData) {
  const supabase = await createClient();
  const quoteNumber = formData.get("quote_number") as string;
  const notes = (formData.get("notes") as string) || null;

  const { data, error } = await supabase
    .from("quotes")
    .insert({ customer_id: customerId, quote_number: quoteNumber, notes })
    .select("id")
    .single();

  if (error) {
    redirect(
      `/quotes/new?customerId=${customerId}&error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath(`/customers/${customerId}`);
  redirect(`/quotes/${data.id}`);
}

export async function addQuoteItem(quoteId: string, formData: FormData) {
  const description = formData.get("description") as string;
  const quantity = Number(formData.get("quantity"));
  const unitPrice = Number(formData.get("unit_price"));

  if (!description?.trim() || !Number.isFinite(quantity) || !Number.isFinite(unitPrice)) {
    return;
  }

  const supabase = await createClient();
  await supabase.from("quote_items").insert({
    quote_id: quoteId,
    description,
    quantity,
    unit_price: unitPrice,
  });

  await recomputeQuoteTotal(supabase, quoteId);
  revalidatePath(`/quotes/${quoteId}`);
}

export async function deleteQuoteItem(itemId: string, quoteId: string) {
  const supabase = await createClient();
  await supabase.from("quote_items").delete().eq("id", itemId);
  await recomputeQuoteTotal(supabase, quoteId);
  revalidatePath(`/quotes/${quoteId}`);
}

export async function updateQuoteStatus(quoteId: string, formData: FormData) {
  const status = formData.get("status") as string;
  const supabase = await createClient();

  const { error } = await supabase.from("quotes").update({ status }).eq("id", quoteId);

  if (error) {
    redirect(`/quotes/${quoteId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/quotes/${quoteId}`);
  revalidatePath("/quotes");
}

export async function convertQuoteToJob(quoteId: string, customerId: string) {
  const supabase = await createClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select("status")
    .eq("id", quoteId)
    .single();

  if (quote?.status !== "Accepted") {
    redirect(
      `/quotes/${quoteId}?error=${encodeURIComponent("Only accepted quotes can be converted to a job")}`
    );
  }

  const [{ count }, { data: quoteItems }] = await Promise.all([
    supabase.from("jobs").select("*", { count: "exact", head: true }),
    supabase.from("quote_items").select("description, quantity").eq("quote_id", quoteId),
  ]);

  const jobNumber = `JOB-${String((count ?? 0) + 1).padStart(4, "0")}`;

  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      job_number: jobNumber,
      customer_id: customerId,
      quote_id: quoteId,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/quotes/${quoteId}?error=${encodeURIComponent(error.message)}`);
  }

  if (quoteItems && quoteItems.length > 0) {
    await supabase.from("job_items").insert(
      quoteItems.map((item) => ({
        job_id: job.id,
        description: item.description,
        quantity: item.quantity,
      }))
    );
  }

  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/jobs");
  redirect(`/jobs/${job.id}`);
}
