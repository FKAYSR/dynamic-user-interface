import NoteCard from "./NoteCard";
import styles from "./NoteGrid.module.css";

export default function NoteGrid({ notes, interactive = true }) {
  // Renders each note consistently across the home, board, archive, and trash pages.
  return (
    <section className={styles.grid} aria-label="Noter">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} interactive={interactive} />
      ))}
    </section>
  );
}