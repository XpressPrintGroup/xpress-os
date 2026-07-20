"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateUserProfile(id: string, formData: FormData) {
  const supabase = await createClient();

  const fields = {
    name: (formData.get("name") as string) || null,
    role: formData.get("role") as string,
  };

  await supabase.from("users").update(fields).eq("id", id);

  revalidatePath("/users");
}
