import NoteCard from "./NoteCard";
import styles from "./NoteGrid.module.css";

export default function NoteGrid({ notes }) {
  return (
    <section className={styles.grid} aria-label="Noter">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </section>
  );
}