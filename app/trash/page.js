import NoteCollectionPage from "@/components/note/NoteCollectionPage";

export const instant = false;

// Viser noter, som brugeren har lagt i papirkurven.
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
