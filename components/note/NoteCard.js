"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./NoteCard.module.css";
import noteColors from "./noteColors";

export default function NoteCard({ note }) {
  const activeColor =
    noteColors.find((color) => color.id === note.color)
    ?? noteColors.find((color) => color.value === note.color)
    ?? noteColors[0];

  return (
    <Link
      href={`/note/${note.id}`}
      className={styles.card}
      style={{ backgroundColor: activeColor.value }}
      aria-label={note.title ? `Åbn note: ${note.title}` : "Åbn note"}
    >
      {note.imageUrl && (
        <div className={styles.image}>
          <Image
            src={note.imageUrl}
            alt={note.imageAlt ?? note.title ?? "Billede i note"}
            fill
            sizes="(max-width: 768px) 194px, 216px"
            unoptimized
            className={styles.imageContent}
          />
        </div>
      )}

      <div className={styles.heading}>
        {note.title && <h2 className={styles.title}>{note.title}</h2>}
      </div>

      {note.content && <p className={styles.content}>{note.content}</p>}
    </Link>
  );
}
