import { createNote } from "@/app/actions";
import styles from "./AddNoteButton.module.css";

export default function AddNoteButton() {
  return (
    <form action={createNote} className={styles.form}>
      <button className={styles.button} type="submit" aria-label="Opret ny note">
        <span className={styles.plus} aria-hidden="true" />
      </button>
    </form>
  );
}
