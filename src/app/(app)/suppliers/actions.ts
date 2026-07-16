"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function fieldsFromForm(formData: FormData) {
  return {
    name: formData.get("name") as string,
    contact_name: (formData.get("contact_name") as string) || null,
    phone: (formData.get("phone") as string) || null,
    email: (formData.get("email") as string) || null,
    notes: (formData.get("notes") as string) || null,
  };
}

export async function createSupplier(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").insert(fieldsFromForm(formData));

  if (error) {
    redirect(`/suppliers/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/suppliers");
  redirect("/suppliers");
}

export async function updateSupplier(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("suppliers")
    .update(fieldsFromForm(formData))
    .eq("id", id);

  if (error) {
    redirect(`/suppliers/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/suppliers/${id}`);
  revalidatePath("/suppliers");
  redirect("/suppliers");
}

export async function deleteSupplier(id: string) {
  const supabase = await createClient();
  await supabase.from("suppliers").delete().eq("id", id);
  revalidatePath("/suppliers");
  redirect("/suppliers");
}
