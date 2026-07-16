"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function moveJobStatus(jobId: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("jobs").update({ status }).eq("id", jobId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/board");
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
}
