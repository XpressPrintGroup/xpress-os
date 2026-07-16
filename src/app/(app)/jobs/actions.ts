"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createJob(customerId: string, formData: FormData) {
  const supabase = await createClient();

  const fields = {
    job_number: formData.get("job_number") as string,
    customer_id: customerId,
    product_type: (formData.get("product_type") as string) || null,
    assigned_to: (formData.get("assigned_to") as string) || null,
    due_date: (formData.get("due_date") as string) || null,
    priority: (formData.get("priority") as string) || "Normal",
    notes: (formData.get("notes") as string) || null,
  };

  const { data, error } = await supabase
    .from("jobs")
    .insert(fields)
    .select("id")
    .single();

  if (error) {
    redirect(
      `/jobs/new?customerId=${customerId}&error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath(`/customers/${customerId}`);
  redirect(`/jobs/${data.id}`);
}

export async function updateJob(id: string, customerId: string, formData: FormData) {
  const supabase = await createClient();

  const fields = {
    product_type: (formData.get("product_type") as string) || null,
    assigned_to: (formData.get("assigned_to") as string) || null,
    due_date: (formData.get("due_date") as string) || null,
    priority: (formData.get("priority") as string) || "Normal",
    notes: (formData.get("notes") as string) || null,
  };

  const { error } = await supabase.from("jobs").update(fields).eq("id", id);

  if (error) {
    redirect(`/jobs/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/jobs/${id}`);
  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/jobs");
}

export async function updateJobStatus(id: string, formData: FormData) {
  const status = formData.get("status") as string;
  const supabase = await createClient();

  const { error } = await supabase.from("jobs").update({ status }).eq("id", id);

  if (error) {
    redirect(`/jobs/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/jobs/${id}`);
  revalidatePath("/jobs");
}
