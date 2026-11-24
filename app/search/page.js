import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import noteColors from "@/components/note/noteColors";
import SearchBrowser from "@/components/search/SearchBrowser";
import { iconPath } from "@/components/iconPath";

const typeOptions = [
  { id: "text", name: "Tekst", icon: iconPath("Aa.svg") },
  { id: "checklist", name: "Lister", icon: iconPath("checkbox.svg") },
  { id: "mixed", name: "Blandet", icon: iconPath("layout/view-columns-2.svg") },
];

// Finder de filtre, der faktisk bruges på brugerens aktive noter.
export default async function SearchPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const [notesResult, labelsResult, linksResult] = await Promise.all([
    supabase
      .from("notes")
      .select("id, color, type")
      .eq("user_id", user.id)
      .eq("archived", false)
      .is("deleted_at", null),
    supabase
      .from("labels")
      .select("id, name, icon")
      .eq("user_id", user.id)
      .order("name", { ascending: true }),
    supabase
      .from("note_labels")
      .select("note_id, label_id"),
  ]);

  const { data: notes, error: notesError } = notesResult;
  const { data: labels, error: labelsError } = labelsResult;
  const { data: links, error: linksError } = linksResult;

  if (notesError) throw notesError;
  if (labelsError) throw labelsError;
  if (linksError) throw linksError;

  const activeNotes = notes ?? [];
  const activeNoteIds = new Set(activeNotes.map((note) => note.id));
  const usedLabelIds = new Set(
    (links ?? [])
      .filter((link) => activeNoteIds.has(link.note_id))
      .map((link) => link.label_id),
  );
  const usedLabels = (labels ?? []).filter((label) => usedLabelIds.has(label.id));

  const usedTypes = new Set(activeNotes.map((note) => note.type).filter(Boolean));
  const types = typeOptions.filter((type) => usedTypes.has(type.id));

  const usedColors = new Set(activeNotes.map((note) => note.color || "standard"));
  const colors = noteColors
    .filter((color) => usedColors.has(color.id))
    .map((color) => ({
      id: color.id,
      name: color.name,
      value: color.value,
      icon: color.icon,
    }));

  return (
    <SearchBrowser
      labels={usedLabels}
      types={types}
      colors={colors}
    />
  );
}
