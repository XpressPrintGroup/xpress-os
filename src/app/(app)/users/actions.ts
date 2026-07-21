"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateUserProfile(id: string, formData: FormData) {
  const supabase = await createClient();

  const fields = {
    name: (formData.get("name") as string) || null,
    role: formData.get("role") as string,
  };

  const { error } = await supabase.from("users").update(fields).eq("id", id);

  if (error) {
    redirect(`/users?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/users");
}
