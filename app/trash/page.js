import NoteCollectionPage from "@/components/note/NoteCollectionPage";

export const instant = false;

export default function TrashPage() {
  return (
    <NoteCollectionPage
      title="Papirkurv"
      collection="trash"
      navigationKey="trash"
      notice="Noter i papirkurven slettes efter 7 dage"
    />
  );
}
