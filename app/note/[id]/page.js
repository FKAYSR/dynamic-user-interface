import { redirect, notFound } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import NotePage from "../page";

export const instant = false;

// Henter en note, brugeren ejer, og giver den videre til noteeditoren.
export default async function SpecificNotePage({ params }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const supabase = await createClient();
  const { data: note, error } = await supabase
    .from("notes")
    .select("id, title, content, color, paper, type, board:boards!notes_board_id_fkey(id, name)")
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!note) {
    notFound();
  }

  return <NotePage initialNote={note} />;
}
