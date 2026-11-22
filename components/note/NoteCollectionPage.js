import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import HomeHeader from "@/components/navigation/HomeHeader";
import NoteGrid from "@/components/note/NoteGrid";
import getNotePreview from "@/components/note/notePreview";
import styles from "@/app/page.module.css";

export default async function NoteCollectionPage({
  title,
  collection,
  navigationKey,
  notice,
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.user_metadata?.onboarding_complete !== true) {
    redirect("/preboarding");
  }

  const isTrash = collection === "trash";
  const supabase = await createClient();
  let notesQuery = supabase
    .from("notes")
    .select("id, title, content, color, archived, deleted_at, created_at")
    .eq("user_id", user.id);

  notesQuery = isTrash
    ? notesQuery
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false })
    : notesQuery
        .eq("archived", true)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

  const [notesResult, boardsResult, labelsResult] = await Promise.all([
    notesQuery,
    supabase
      .from("boards")
      .select("id, name, color, created_at, last_accessed_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("labels")
      .select("id, name, icon")
      .eq("user_id", user.id)
      .order("name", { ascending: true }),
  ]);

  const { data: notes, error } = notesResult;
  const { data: boards, error: boardsError } = boardsResult;
  const { data: labels, error: labelsError } = labelsResult;

  if (error) throw error;
  if (boardsError) throw boardsError;
  if (labelsError) throw labelsError;

  const noteCards = (notes ?? []).map((note) => ({
    id: note.id,
    title: note.title,
    content: getNotePreview(note.content),
    color: note.color || "standard",
  }));

  return (
    <div className={styles.page}>
      <HomeHeader
        navigationKey={navigationKey}
        title={title}
        boards={boards ?? []}
        labels={labels ?? []}
      />
      <main className={styles.main}>
        {notice && <p className={styles.notice}>{notice}</p>}
        {noteCards.length > 0 ? (
          <NoteGrid notes={noteCards} interactive={!isTrash} />
        ) : (
          <p className={styles.emptyState}>
            {isTrash ? "Papirkurven er tom." : "Arkivet er tomt."}
          </p>
        )}
      </main>
    </div>
  );
}
