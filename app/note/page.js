"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import TypographyPanel from "../../components/note/TypographyPanel";
import NoteAddItemsPanel from "../../components/note/NoteAddItemsPanel";
import ColorPickerPanel from "../../components/note/ColorPickerPanel";

const topActions = [
  { label: "Fastgør note", icon: "pin.svg" },
  { label: "Del note", icon: "add-user.svg" },
  { label: "Arkivér note", icon: "archive.svg" },
];

const editingActions = [
  { label: "Tilføj indhold", icon: "add-item.svg", panel: "items" },
  { label: "Skift farve", icon: "palette.svg", panel: "colors" },
  { label: "Tekstformatering", icon: "A.svg", panel: "typography" },
  { label: "Tilføj checkliste", icon: "checkbox.svg" },
];

function IconButton({ label, icon, className = "", onClick, expanded }) {
  return (
    <button
      className={`${styles.iconButton} ${className}`}
      type="button"
      aria-label={label}
      onClick={onClick}
      aria-expanded={expanded}
    >
      <img src={`/icons/${icon}`} alt="" />
    </button>
  );
}

export default function NotePage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [titleFocused, setTitleFocused] = useState(false);
  const [bodyFocused, setBodyFocused] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [noteColor, setNoteColor] = useState("var(--colors-sticky-notes-standard)");

  function togglePanel(panel) {
    setActivePanel((currentPanel) => currentPanel === panel ? null : panel);
  }

  function closePanel() {
    setActivePanel(null);
  }

  return (
    <main className={styles.screen} style={{ backgroundColor: noteColor }}>
      <div className={styles.noteLayout}>
        <div className={styles.topSection}>
          <nav className={styles.noteNav} aria-label="Notehandling">
            <Link href="/" className={`${styles.iconButton} ${styles.plainButton}`} aria-label="Tilbage til forsiden">
              <img src="/icons/arrow-left.svg" alt="" />
            </Link>
            <div className={styles.topActions}>
              {topActions.map((action) => (
                <IconButton key={action.icon} {...action} />
              ))}
            </div>
          </nav>

          <section className={styles.editor} aria-label="Redigér note">
            <h2 className={styles.titleHeading}>
              <input
                className={styles.titleInput}
                type="text"
                aria-label="Titel"
                placeholder={titleFocused ? "" : "Titel"}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onFocus={() => setTitleFocused(true)}
                onBlur={() => setTitleFocused(false)}
              />
            </h2>
            <textarea
              className={styles.bodyInput}
              aria-label="Notens brødtekst"
              placeholder={bodyFocused ? "" : "Skriv en note..."}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              onFocus={() => setBodyFocused(true)}
              onBlur={() => setBodyFocused(false)}
            />
          </section>
        </div>

        <footer className={styles.bottomBar} aria-label="Noteværktøjer">
          <div className={styles.editingActions}>
            {editingActions.map(({ panel, ...action }) => (
              <IconButton
                key={action.icon}
                {...action}
                onClick={panel ? () => togglePanel(panel) : undefined}
                expanded={panel ? activePanel === panel : undefined}
              />
            ))}
          </div>
          <IconButton label="Flere muligheder" icon="more-vert.svg" />
        </footer>
      </div>

      {activePanel && (
        <>
          <button className={styles.panelBackdrop} type="button" aria-label="Luk værktøjspanel" onClick={closePanel} />
          {activePanel === "typography" && <TypographyPanel onClose={closePanel} />}
          {activePanel === "items" && <NoteAddItemsPanel />}
          {activePanel === "colors" && (
            <ColorPickerPanel selectedColor={noteColor} onSelectColor={setNoteColor} />
          )}
        </>
      )}
    </main>
  );
}
