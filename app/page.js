import styles from "./page.module.css";
import Link from "next/link";
import NoteGrid from "@/components/note/NoteGrid";
import AddNoteButton from "@/components/note/AddNoteButton";
import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { BoardIcon } from "@/components/navigation/HomeSidePanel";
import HomeHeader from "@/components/navigation/HomeHeader";
import { getBoardHref, sortBoardsByLastAccessed } from "@/components/navigation/boardUtils";
import getNotePreview from "@/components/note/notePreview";

export const instant = false;

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (user.user_metadata?.onboarding_complete !== true) {
    redirect("/preboarding");
  }

  const supabase = await createClient();
  const [notesResult, boardsResult, labelsResult] = await Promise.all([
    supabase
      .from("notes")
      .select("id, title, content, color, type, pinned, archived, created_at")
      .eq("user_id", user.id)
      .eq("archived", false)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
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

  if (error) {
    throw error;
  }
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
        navigationKey="home"
        boards={boards ?? []}
        labels={labels ?? []}
      />
      {boards?.length > 0 && (
        <section className={styles.boardCarousel} aria-label="Tavler">
          <div className={styles.boardCarouselItems}>
            {sortBoardsByLastAccessed(boards).map((board) => (
              <Link
                className={styles.boardCarouselItem}
                href={getBoardHref(board)}
                key={board.id}
                prefetch={false}
              >
                <BoardIcon
                  color={board.color}
                  className={styles.boardCarouselIcon}
                />
                <span className={styles.boardCarouselName}>{board.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
      <main className={styles.main}>
        <NoteGrid notes={noteCards} />
      </main>
      <AddNoteButton />
    </div>
  );
}
