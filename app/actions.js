"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export async function createNote() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const defaultColor =
    user.user_metadata?.default_note_color ||
    "standard";

  const { data: note, error } = await supabase
    .from("notes")
    .insert({
      user_id: user.id,
      title: "",
      content: "",
      color: defaultColor,
      type: "text",
      pinned: false,
      archived: false,
      paper: "blank",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error("Kunne ikke oprette den nye note.");
  }

  revalidatePath("/");
  redirect(`/note/${note.id}`);
}
