"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import styles from "./NoteCard.module.css";
import noteColors from "./noteColors";

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function NoteCard({ note, onColorChange }) {
  const [selectedColor, setSelectedColor] = useState(note.color ?? "standard");
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const colorPickerId = useId();

  useEffect(() => {
    setSelectedColor(note.color ?? "standard");
  }, [note.id, note.color]);

  const activeColor = noteColors.find((color) => color.id === selectedColor);

  if (!activeColor) {
    throw new Error(`Unknown note color "${selectedColor}" for note "${note.id}".`);
  }

  function selectColor(colorId) {
    setSelectedColor(colorId);
    setIsColorPickerOpen(false);
    onColorChange?.(note.id, colorId);
  }

  return (
    <article
      className={styles.card}
      style={{ backgroundColor: activeColor.value }}
      aria-label={note.title ? `Note: ${note.title}` : "Note"}
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
        <button
          className={styles.colorButton}
          type="button"
          aria-label="Skift farve på note"
          aria-expanded={isColorPickerOpen}
          aria-controls={colorPickerId}
          onClick={() => setIsColorPickerOpen((open) => !open)}
        >
          <Image src="/icons/palette.svg" alt="" width={20} height={20} />
        </button>
      </div>

      {note.sharedPerson?.name && (
        <div className={styles.sharedPerson}>
          {note.sharedPerson.avatarUrl ? (
            <Image
              className={styles.avatar}
              src={note.sharedPerson.avatarUrl}
              alt=""
              width={24}
              height={24}
              unoptimized
            />
          ) : (
            <span className={styles.avatarFallback} aria-hidden="true">
              {getInitials(note.sharedPerson.name)}
            </span>
          )}
          <span className={styles.personName}>{note.sharedPerson.name}</span>
        </div>
      )}

      {note.content && <p className={styles.content}>{note.content}</p>}

      {isColorPickerOpen && (
        <div
          className={styles.colorOptions}
          id={colorPickerId}
          role="group"
          aria-label="Vælg notefarve"
        >
          {noteColors.map((color) => (
            <button
              className={styles.colorOption}
              key={color.id}
              type="button"
              aria-label={`Skift farve til ${color.name}`}
              aria-pressed={color.id === selectedColor}
              title={color.name}
              style={{ backgroundColor: color.value }}
              onClick={() => selectColor(color.id)}
            />
          ))}
        </div>
      )}
    </article>
  );
}
