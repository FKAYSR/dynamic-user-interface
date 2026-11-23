import { createNote } from "@/app/actions";
import styles from "./AddNoteButton.module.css";

// Sender en ny note til serverhandlingen, eventuelt på en bestemt tavle.
export default function AddNoteButton({ boardId = null }) {
  return (
    <form action={createNote} className={styles.form}>
      {boardId && (
        <input type="hidden" name="boardId" value={boardId} />
      )}
      <button className={styles.button} type="submit" aria-label="Opret ny note">
        <span className={styles.plus} aria-hidden="true" />
      </button>
    </form>
  );
}
