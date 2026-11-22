"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { getBoardSlug } from "@/components/navigation/boardUtils";

export async function createNote(formData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const boardIdValue = formData.get("boardId");
  if (boardIdValue !== null && typeof boardIdValue !== "string") {
    throw new Error("Ugyldig tavle.");
  }

  const boardId = boardIdValue || null;
  let board = null;
  if (boardId) {
    const { data, error: boardError } = await supabase
      .from("boards")
      .select("id, name")
      .eq("id", boardId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (boardError) throw boardError;
    if (!data) throw new Error("Tavlen blev ikke fundet.");
    board = data;
  }

  const { data: note, error } = await supabase
    .from("notes")
    .insert({
      user_id: user.id,
      title: "",
      content: [],
      color: "standard",
      type: "text",
      pinned: false,
      archived: false,
      paper: "blank",
      board_id: boardId,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error("Kunne ikke oprette den nye note.");
  }

  revalidatePath("/");
  if (board) {
    revalidatePath(`/boards/${encodeURIComponent(getBoardSlug(board.name))}`);
  }
  redirect(`/note/${note.id}`);
}

