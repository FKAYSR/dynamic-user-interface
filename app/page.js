import styles from "./page.module.css";
import Seachbar from "@/components/note/Seachbar";
import NoteGrid from "@/components/note/NoteGrid";
import Image from "next/image";
import AddNoteButton from "@/components/note/AddNoteButton";
import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import HomeSidePanel from "@/components/navigation/HomeSidePanel";

export const instant = false;

function getNotePreview(content) {
  if (Array.isArray(content)) {
    return content
      .map((block) => (block && typeof block.text === "string"
        ? block.text.replace(/^-\s*\[[ xX]\]\s*/, "")
        : ""))
      .join("\n");
  }

  if (typeof content !== "string") {
    if (content && typeof content.text === "string") return content.text;
    return "";
  }
  if (!content.startsWith("[")) return content;

  try {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) return "";
    return parsed
      .map((block) => typeof block?.text === "string" ? block.text : "")
      .join("\n");
  } catch {
    return content;
  }
}

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
      .select("id, name, color, created_at")
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
      <header className={styles.header}>
        <HomeSidePanel boards={boards ?? []} labels={labels ?? []} />
        <Seachbar />
        <Image src="/icons/sort.svg" alt="sorter" width={48} height={48} />
        <div className={styles.touchArea}>
          <div className={styles.avatar}></div>
        </div>
      </header>
      <main className={styles.main}>
        <NoteGrid notes={noteCards} />
      </main>
      <AddNoteButton />
    </div>
  );
}
