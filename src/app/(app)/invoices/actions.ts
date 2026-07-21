"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

async function recomputeInvoiceTotal(supabase: SupabaseClient, invoiceId: string) {
  const { data: items } = await supabase
    .from("invoice_items")
    .select("quantity, unit_price")
    .eq("invoice_id", invoiceId);

  const total = (items ?? []).reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
    0
  );

  await supabase.from("invoices").update({ total }).eq("id", invoiceId);
}

export async function createInvoice(jobId: string, formData: FormData) {
  const supabase = await createClient();
  const invoiceNumber = formData.get("invoice_number") as string;
  const notes = (formData.get("notes") as string) || null;

  const { data: job } = await supabase
    .from("jobs")
    .select("customer_id, quote_id")
    .eq("id", jobId)
    .single();

  if (!job) redirect(`/jobs/${jobId}`);

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      job_id: jobId,
      customer_id: job.customer_id,
      invoice_number: invoiceNumber,
      notes,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/invoices/new?jobId=${jobId}&error=${encodeURIComponent(error.message)}`);
  }

  if (job.quote_id) {
    const { data: quoteItems } = await supabase
      .from("quote_items")
      .select("description, quantity, unit_price")
      .eq("quote_id", job.quote_id);

    if (quoteItems && quoteItems.length > 0) {
      await supabase.from("invoice_items").insert(
        quoteItems.map((item) => ({
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
        }))
      );
      await recomputeInvoiceTotal(supabase, invoice.id);
    }
  }

  revalidatePath(`/jobs/${jobId}`);
  redirect(`/invoices/${invoice.id}`);
}

export async function addInvoiceItem(invoiceId: string, formData: FormData) {
  const description = formData.get("description") as string;
  const quantity = Number(formData.get("quantity"));
  const unitPrice = Number(formData.get("unit_price"));

  if (!description?.trim() || !Number.isFinite(quantity) || !Number.isFinite(unitPrice)) {
    return;
  }

  const supabase = await createClient();
  await supabase.from("invoice_items").insert({
    invoice_id: invoiceId,
    description,
    quantity,
    unit_price: unitPrice,
  });

  await recomputeInvoiceTotal(supabase, invoiceId);
  revalidatePath(`/invoices/${invoiceId}`);
}

export async function deleteInvoiceItem(itemId: string, invoiceId: string) {
  const supabase = await createClient();
  await supabase.from("invoice_items").delete().eq("id", itemId);
  await recomputeInvoiceTotal(supabase, invoiceId);
  revalidatePath(`/invoices/${invoiceId}`);
}

export async function updateInvoiceStatus(invoiceId: string, formData: FormData) {
  const status = formData.get("status") as string;
  const supabase = await createClient();

  const { error } = await supabase.from("invoices").update({ status }).eq("id", invoiceId);

  if (error) {
    redirect(`/invoices/${invoiceId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
}

export async function updateInvoiceNotes(invoiceId: string, formData: FormData) {
  const notes = (formData.get("notes") as string) || null;
  const supabase = await createClient();

  await supabase.from("invoices").update({ notes }).eq("id", invoiceId);
  revalidatePath(`/invoices/${invoiceId}`);
}
