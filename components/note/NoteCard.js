"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./NoteCard.module.css";
import noteColors from "./noteColors";
import { getNoteText } from "./noteContent";

export default function NoteCard({ note, interactive = true }) {
  // Displays the note preview as an article or makes the whole card a link.
  const title = getNoteText(note.title);
  const content = getNoteText(note.content);
  const CardElement = interactive ? Link : "article";
  const preview = content.slice(0, 100).trim();
  const cardLabel = title
    ? `Åbn note: ${title}`
    : preview
      ? `Åbn note: ${preview}${content.length > preview.length ? "…" : ""}`
      : "Åbn note uden titel eller indhold";
  const activeColor =
    noteColors.find((color) => color.id === note.color)
    ?? noteColors.find((color) => color.value === note.color)
    ?? noteColors[0];

  return (
    <CardElement
      {...(interactive ? { href: `/note/${note.id}` } : {})}
      className={styles.card}
      style={{ backgroundColor: activeColor.value }}
      aria-label={interactive ? cardLabel : undefined}
    >
      {note.imageUrl && (
        <div className={styles.image}>
          <Image
              src={note.imageUrl}
              alt={note.imageAlt ?? title ?? "Billede i note"}
            fill
            sizes="(max-width: 768px) 194px, 216px"
            unoptimized
            className={styles.imageContent}
          />
        </div>
      )}

      <div className={styles.heading}>
        {title && <h2 className={styles.title}>{title}</h2>}
      </div>

      {content && <p className={styles.content}>{content}</p>}
    </CardElement>
  );
}
