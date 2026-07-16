"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function fieldsFromForm(formData: FormData) {
  return {
    name: formData.get("name") as string,
    category: (formData.get("category") as string) || null,
    default_unit_price: Number(formData.get("default_unit_price")) || 0,
  };
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").insert(fieldsFromForm(formData));

  if (error) {
    redirect(`/pricing/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/pricing");
  redirect("/pricing");
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update(fieldsFromForm(formData))
    .eq("id", id);

  if (error) {
    redirect(`/pricing/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/pricing/${id}`);
  revalidatePath("/pricing");
  redirect("/pricing");
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/pricing");
  redirect("/pricing");
}
