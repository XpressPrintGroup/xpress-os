"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createJob(customerId: string, formData: FormData) {
  const supabase = await createClient();

  const fields = {
    job_number: formData.get("job_number") as string,
    customer_id: customerId,
    campaign_id: (formData.get("campaign_id") as string) || null,
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
    campaign_id: (formData.get("campaign_id") as string) || null,
    assigned_to: (formData.get("assigned_to") as string) || null,
    due_date: (formData.get("due_date") as string) || null,
    priority: (formData.get("priority") as string) || "Normal",
    notes: (formData.get("notes") as string) || null,
    tracking_number: (formData.get("tracking_number") as string) || null,
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

export async function addJobItem(jobId: string, formData: FormData) {
  const description = formData.get("description") as string;
  const quantity = Number(formData.get("quantity"));
  const isOutsourced = formData.get("is_outsourced") === "on";
  const supplier = (formData.get("supplier") as string) || null;
  const supplierReference = (formData.get("supplier_reference") as string) || null;
  const supplierDueDate = (formData.get("supplier_due_date") as string) || null;
  const supplierCostRaw = formData.get("supplier_cost") as string;
  const supplierCost = supplierCostRaw ? Number(supplierCostRaw) : null;

  if (!description?.trim() || !Number.isFinite(quantity)) {
    return;
  }

  const supabase = await createClient();
  await supabase.from("job_items").insert({
    job_id: jobId,
    description,
    quantity,
    is_outsourced: isOutsourced,
    supplier: isOutsourced ? supplier : null,
    supplier_reference: isOutsourced ? supplierReference : null,
    supplier_due_date: isOutsourced ? supplierDueDate : null,
    supplier_cost: isOutsourced ? supplierCost : null,
  });

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/jobs");
}

export async function deleteJobItem(itemId: string, jobId: string) {
  const supabase = await createClient();
  await supabase.from("job_items").delete().eq("id", itemId);
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/jobs");
}

function sanitizePathSegment(value: string) {
  return value.trim().replace(/[/\\?%*:|"<>]/g, "-").slice(0, 100) || "unknown";
}

export async function uploadJobFile(jobId: string, formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return;

  const supabase = await createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("job_number, customers(name), campaigns(name)")
    .eq("id", jobId)
    .single();

  if (!job) return;

  const customerName = (job.customers as unknown as { name: string } | null)?.name ?? "Unknown";
  const campaignName = (job.campaigns as unknown as { name: string } | null)?.name ?? null;

  const segments = [sanitizePathSegment(customerName)];
  if (campaignName) segments.push(sanitizePathSegment(campaignName));
  segments.push(sanitizePathSegment(job.job_number));

  const fileName = `${job.job_number}_${sanitizePathSegment(file.name)}`;
  const storagePath = `${segments.join("/")}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("job-files")
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) {
    redirect(`/jobs/${jobId}?error=${encodeURIComponent(uploadError.message)}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("job_files").insert({
    job_id: jobId,
    storage_path: storagePath,
    original_filename: file.name,
    uploaded_by: user?.email ?? null,
  });

  revalidatePath(`/jobs/${jobId}`);
}

export async function deleteJobFile(fileId: string, storagePath: string, jobId: string) {
  const supabase = await createClient();
  await supabase.storage.from("job-files").remove([storagePath]);
  await supabase.from("job_files").delete().eq("id", fileId);
  revalidatePath(`/jobs/${jobId}`);
}

export async function addJobActivity(jobId: string, formData: FormData) {
  const text = formData.get("text") as string;
  if (!text?.trim()) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("job_activity").insert({
    job_id: jobId,
    text,
    logged_by: user?.email ?? null,
  });

  revalidatePath(`/jobs/${jobId}`);
}
