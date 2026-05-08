"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function createHabit(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  if (!name?.trim()) throw new Error("Name is required");

  await supabase
    .from("habits")
    .insert({ user_id: user.id, name: name.trim() });

  revalidatePath("/dashboard");
}

export async function deleteHabit(habitId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await supabase.from("habits").delete().eq("id", habitId).eq("user_id", user.id);

  revalidatePath("/dashboard");
}

export async function toggleCheckIn(habitId: string, date: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: existing } = await supabase
    .from("check_ins")
    .select("id")
    .eq("habit_id", habitId)
    .eq("date", date)
    .single();

  if (existing) {
    await supabase.from("check_ins").delete().eq("id", existing.id).eq("user_id", user.id);
  } else {
    await supabase
      .from("check_ins")
      .insert({ user_id: user.id, habit_id: habitId, date });
  }

  revalidatePath("/dashboard");
}
