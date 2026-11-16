"use client";

import { useState } from "react";
import styles from "./page.module.css";

const topActions = [
  { label: "Fastgør note", icon: "pin.svg" },
  { label: "Del note", icon: "add-user.svg" },
  { label: "Arkivér note", icon: "archive.svg" },
];

const editingActions = [
  { label: "Tilføj indhold", icon: "add-item.svg" },
  { label: "Skift farve", icon: "palette.svg" },
  { label: "Tekstformatering", icon: "A.svg" },
  { label: "Markér note", icon: "checkbox.svg" },
];

function IconButton({ label, icon, className = "" }) {
  return (
    <button className={`${styles.iconButton} ${className}`} type="button" aria-label={label}>
      <img src={`/icons/${icon}`} alt="" />
    </button>
  );
}

export default function NotePage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [titleFocused, setTitleFocused] = useState(false);
  const [bodyFocused, setBodyFocused] = useState(false);

  return (
    <main className={styles.screen}>
      <div className={styles.statusBar} aria-hidden="true">
        <span className={styles.time}>10.56</span>
        <div className={styles.statusDetails}>
          <span>4G</span>
          <span className={styles.signal}>
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className={styles.battery}><i /></span>
        </div>
      </div>

      <div className={styles.noteLayout}>
        <div className={styles.topSection}>
          <nav className={styles.noteNav} aria-label="Notehandling">
            <IconButton label="Tilbage" icon="arrow-left.svg" className={styles.plainButton} />
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
            {editingActions.map((action) => (
              <IconButton key={action.icon} {...action} />
            ))}
          </div>
          <IconButton label="Flere muligheder" icon="more-vert.svg" />
        </footer>
      </div>
    </main>
  );
}
