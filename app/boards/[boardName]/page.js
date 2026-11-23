import { notFound, redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import HomeHeader from "@/components/navigation/HomeHeader";
import { getBoardSlug } from "@/components/navigation/boardUtils";
import getNotePreview from "@/components/note/notePreview";
import NoteGrid from "@/components/note/NoteGrid";
import AddNoteButton from "@/components/note/AddNoteButton";
import styles from "./page.module.css";

export const instant = false;

// Henter tavlen og dens noter efter at have kontrolleret brugerens adgang.
export default async function BoardPage({ params, searchParams }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (user.user_metadata?.onboarding_complete !== true) {
    redirect("/preboarding");
  }

  const [{ boardName }, query] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const boardSelection = supabase
    .from("boards")
    .select("id, name, color, created_at, last_accessed_at")
    .eq("user_id", user.id);
  let board;

  if (typeof query.id === "string") {
    const { data, error } = await boardSelection
      .eq("id", query.id)
      .maybeSingle();

    if (error) throw error;
    board = data;
  } else {
    const { data, error } = await boardSelection.order("created_at", {
      ascending: false,
    });

    if (error) throw error;
    board = data?.find(
      (candidate) => getBoardSlug(candidate.name) === boardName,
    );
  }

  if (!board) notFound();

  const { data: accessedBoard, error: accessError } = await supabase
    .from("boards")
    .update({ last_accessed_at: new Date().toISOString() })
    .eq("id", board.id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (accessError) throw accessError;
  if (!accessedBoard) notFound();

  const [notesResult, boardsResult, labelsResult] = await Promise.all([
    supabase
      .from("notes")
      .select("id, title, content, color, type, pinned, archived, created_at")
      .eq("user_id", user.id)
      .eq("board_id", board.id)
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

  const { data: notes, error: notesError } = notesResult;
  const { data: boards, error: boardsError } = boardsResult;
  const { data: labels, error: labelsError } = labelsResult;

  if (notesError) throw notesError;
  if (boardsError) throw boardsError;
  if (labelsError) throw labelsError;

  const noteCards = (notes ?? []).map((note) => ({
    id: note.id,
    title: note.title,
    content: getNotePreview(note.content),
    color: note.color || "standard",
  }));
  const boardColor = board.color || "var(--colors-neutral-100)";

  return (
    <div className={styles.page}>
      <HomeHeader
        navigationKey={`board-${board.id}`}
        boards={boards ?? []}
        labels={labels ?? []}
      />
      <div className={styles.content}>
        <div
          className={styles.boardTitle}
          style={{ "--board-color": boardColor }}
        >
          <div
            className={styles.boardLine}
            style={{ "--board-color": boardColor }}
          ></div>
          <div className={styles.boardTitleContainer}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M12 0H0C6.62742 0 12 5.37258 12 12V0Z"
                fill="var(--board-color)"
              />
            </svg>
            <div className={styles.boardTitleLabel}>
              <h1 id="board-title">{board.name}</h1>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M0 0H12C5.37258 0 0 5.37258 0 12V0Z"
                fill="var(--board-color)"
              />
            </svg>
          </div>
        </div>
        <main className={styles.main} aria-labelledby="board-title">
          {noteCards.length > 0 ? (
            <NoteGrid notes={noteCards} />
          ) : (
            <p className={styles.emptyState} role="status">
              Der er endnu ingen noter på denne tavle.
            </p>
          )}
        </main>
      </div>

      <AddNoteButton boardId={board.id} />
    </div>
  );
}
