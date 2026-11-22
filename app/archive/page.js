import NoteCollectionPage from "@/components/note/NoteCollectionPage";

export const instant = false;

export default function ArchivePage() {
  return (
    <NoteCollectionPage
      title="Arkiv"
      collection="archive"
      navigationKey="archive"
    />
  );
}
