"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function fieldsFromForm(formData: FormData) {
  return {
    name: formData.get("name") as string,
    start_date: (formData.get("start_date") as string) || null,
    end_date: (formData.get("end_date") as string) || null,
    notes: (formData.get("notes") as string) || null,
  };
}

export async function createCampaign(customerId: string, formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .insert({ customer_id: customerId, ...fieldsFromForm(formData) })
    .select("id")
    .single();

  if (error) {
    redirect(
      `/campaigns/new?customerId=${customerId}&error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath(`/customers/${customerId}`);
  redirect(`/campaigns/${data.id}`);
}

export async function updateCampaign(id: string, customerId: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("campaigns")
    .update(fieldsFromForm(formData))
    .eq("id", id);

  if (error) {
    redirect(`/campaigns/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/campaigns/${id}`);
  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/campaigns");
}

export async function deleteCampaign(id: string, customerId: string) {
  const supabase = await createClient();
  await supabase.from("campaigns").delete().eq("id", id);
  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/campaigns");
  redirect(`/customers/${customerId}`);
}
