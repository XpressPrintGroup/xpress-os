"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function fieldsFromForm(formData: FormData) {
  return {
    name: formData.get("name") as string,
    company: (formData.get("company") as string) || null,
    phone: (formData.get("phone") as string) || null,
    email: (formData.get("email") as string) || null,
    address: (formData.get("address") as string) || null,
    notes: (formData.get("notes") as string) || null,
  };
}

export async function createCustomer(formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .insert(fieldsFromForm(formData))
    .select("id")
    .single();

  if (error) {
    redirect(`/customers/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/customers/${data.id}`);
}

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("customers")
    .update(fieldsFromForm(formData))
    .eq("id", id);

  if (error) {
    redirect(`/customers/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/customers/${id}`);
  revalidatePath("/customers");
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient();
  await supabase.from("customers").delete().eq("id", id);
  revalidatePath("/customers");
  redirect("/customers");
}

export async function addActivity(customerId: string, formData: FormData) {
  const text = formData.get("text") as string;
  if (!text?.trim()) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("customer_activity").insert({
    customer_id: customerId,
    text,
    logged_by: user?.email ?? null,
  });

  revalidatePath(`/customers/${customerId}`);
}
