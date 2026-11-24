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

// Henter brugerens aktive noter og viser dem sammen med tavler og etiketter.
export default async function Home({ searchParams }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (user.user_metadata?.onboarding_complete !== true) {
    redirect("/preboarding");
  }

  const params = await searchParams;
  const query = typeof params?.q === "string" ? params.q.trim().toLocaleLowerCase("da-DK") : "";
  const colorFilter = typeof params?.color === "string" ? params.color : "";
  const typeFilter = typeof params?.type === "string" ? params.type : "";
  const labelFilter = typeof params?.label === "string" ? params.label : "";

  const supabase = await createClient();
  const [notesResult, boardsResult, labelsResult, linksResult] = await Promise.all([
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
    supabase
      .from("note_labels")
      .select("note_id, label_id"),
  ]);

  const { data: notes, error } = notesResult;
  const { data: boards, error: boardsError } = boardsResult;
  const { data: labels, error: labelsError } = labelsResult;
  const { data: links, error: linksError } = linksResult;

  if (error) {
    throw error;
  }
  if (boardsError) throw boardsError;
  if (labelsError) throw labelsError;
  if (linksError) throw linksError;

  let filteredNotes = notes ?? [];
  const selectedLabel = (labels ?? []).find((label) => label.id === labelFilter);
  if (colorFilter) {
    filteredNotes = filteredNotes.filter((note) => (note.color || "standard") === colorFilter);
  }
  if (typeFilter) {
    filteredNotes = filteredNotes.filter((note) => note.type === typeFilter);
  }
  if (labelFilter) {
    const linkedNoteIds = new Set(
      (links ?? [])
        .filter((link) => link.label_id === labelFilter)
        .map((link) => link.note_id),
    );
    filteredNotes = filteredNotes.filter((note) => linkedNoteIds.has(note.id));
  }
  if (query) {
    const matchingLabels = new Set(
      (labels ?? [])
        .filter((label) => label.name.toLocaleLowerCase("da-DK").includes(query))
        .map((label) => label.id),
    );
    const linkedNoteIds = new Set(
      (links ?? [])
        .filter((link) => matchingLabels.has(link.label_id))
        .map((link) => link.note_id),
    );
    filteredNotes = filteredNotes.filter((note) => {
      const preview = getNotePreview(note.content).toLocaleLowerCase("da-DK");
      const title = typeof note.title === "string"
        ? note.title.toLocaleLowerCase("da-DK")
        : "";
      return title.includes(query) || preview.includes(query) || linkedNoteIds.has(note.id);
    });
  }

  const noteCards = filteredNotes.map((note) => ({
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
        title={selectedLabel?.name}
        titleIcon={selectedLabel ? (selectedLabel.icon || "tag.svg") : undefined}
      />
      {!labelFilter && boards?.length > 0 && (
        <section className={styles.boardCarousel} aria-label="Tavler">
          <h2 className={styles.visuallyHidden}>Tavler</h2>
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
        <h1 className={styles.visuallyHidden}>Noter</h1>
        {noteCards.length > 0 ? (
          <NoteGrid notes={noteCards} />
        ) : (
          <p className={styles.emptyState} role="status">
            {query || colorFilter || typeFilter || labelFilter
              ? "Ingen noter matcher dine filtre."
              : "Du har ikke oprettet nogen noter endnu."}
          </p>
        )}
      </main>
      <AddNoteButton />
    </div>
  );
}
