"use client";

import { useState } from "react";
import noteColors from "@/components/note/noteColors";
import styles from "./HomeSidePanel.module.css";

export default function HomeSidePanel({ boards: initialBoards, labels }) {
  const [open, setOpen] = useState(false);
  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const [boards, setBoards] = useState(initialBoards);
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(
    noteColors.find((color) => color.id === "peach") ?? noteColors[0],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function createBoard(event) {
    event.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError("");

    const response = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), color: selectedColor.id }),
    });

    if (!response.ok) {
      setError("Tavlen kunne ikke oprettes.");
      setSaving(false);
      return;
    }

    const { board } = await response.json();
    setBoards((current) => [board, ...current]);
    setName("");
    setCreateBoardOpen(false);
    setSaving(false);
  }

  return (
    <>
      <button
        className={styles.menuButton}
        type="button"
        aria-label="Åbn menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <img src="/icons/burger-menu.svg" alt="" />
      </button>

      {open && (
        <>
          <button
            className={styles.backdrop}
            type="button"
            aria-label="Luk menu"
            onClick={() => setOpen(false)}
          />
          <aside className={styles.panel} aria-label="Navigation">
            <p className={styles.appName}>Notes</p>

            <nav className={styles.primaryNav} aria-label="Primær navigation">
              <button className={`${styles.navItem} ${styles.active}`} type="button">
                <img src="/icons/light-bulb.svg" alt="" />
                <span>Noter</span>
              </button>
              <button className={styles.navItem} type="button" disabled>
                <img src="/icons/bell.svg" alt="" />
                <span>Påmindelser</span>
              </button>
            </nav>

            <section className={styles.section} aria-labelledby="labels-heading">
              <h2 id="labels-heading" className={`${styles.sectionHeading} ${styles.labelHeading}`}>
                Etiketter
              </h2>
              <button className={styles.createButton} type="button" disabled>
                <span className={styles.plus}>+</span>
                <span>Opret en ny etiket</span>
              </button>
              {labels.length > 0 && (
                <div className={styles.labelList}>
                  {labels.map((label) => (
                    <span className={styles.labelItem} key={label.id}>
                      {label.name}
                    </span>
                  ))}
                </div>
              )}
            </section>

            <section className={styles.section} aria-labelledby="boards-heading">
              <h2 id="boards-heading" className={`${styles.sectionHeading} ${styles.boardHeading}`}>
                Tavler
              </h2>
              <div className={styles.boardContainer}>
                <button
                  className={styles.createButton}
                  type="button"
                  onClick={() => setCreateBoardOpen(true)}
                >
                  <span className={styles.plus}>+</span>
                  <span>Opret en ny tavle</span>
                </button>
                <div className={styles.boardList}>
                  {boards.map((board) => (
                    <button className={styles.boardItem} type="button" key={board.id} disabled>
                      <span
                        className={styles.boardIcon}
                        style={{ borderColor: board.color ? board.color : "var(--baggrund)" }}
                      >
                        <span />
                      </span>
                      <span>{board.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <nav className={styles.secondaryNav} aria-label="Andre funktioner">
              <button type="button" disabled><img src="/icons/archive.svg" alt="" /><span>Arkiv</span></button>
              <button type="button" disabled><img src="/icons/bin.svg" alt="" /><span>Papirkurv</span></button>
              <button type="button" disabled><img src="/icons/settings.svg" alt="" /><span>Indstillinger</span></button>
              <button type="button" disabled><img src="/icons/question.svg" alt="" /><span>Hjælp & feedback</span></button>
            </nav>
          </aside>
        </>
      )}

      {createBoardOpen && (
        <div className={styles.modalLayer} role="presentation">
          <button
            className={styles.modalBackdrop}
            type="button"
            aria-label="Luk oprettelsesvindue"
            onClick={() => setCreateBoardOpen(false)}
          />
          <form className={styles.modal} onSubmit={createBoard}>
            <h2>Opret ny Tavle</h2>

            <label className={styles.nameField}>
              <span>Tavle titel</span>
              <small>Noter oprettet inde for en tavle vil automatisk få titlen som kategori</small>
              <input
                name="name"
                type="text"
                placeholder="Tavletitel"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>

            <div className={styles.colorChoice}>
              <div>
                <strong>Farve</strong>
                <span>Farvetemaet for tavlen</span>
              </div>
              <label className={styles.colorPicker}>
                <select
                  aria-label="Vælg tavlefarve"
                  value={selectedColor.id}
                  onChange={(event) => {
                    const next = noteColors.find((color) => color.id === event.target.value);
                    if (next) setSelectedColor(next);
                  }}
                >
                  {noteColors.map((color) => (
                    <option key={color.id} value={color.id}>{color.name}</option>
                  ))}
                </select>
                <span
                  className={styles.colorCircle}
                  style={{ backgroundColor: selectedColor.value }}
                />
                <small>{selectedColor.name}</small>
              </label>
            </div>

            {error && <p className={styles.formError} role="alert">{error}</p>}

            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                type="button"
                onClick={() => setCreateBoardOpen(false)}
              >
                Annuller
              </button>
              <button className={styles.createButtonPrimary} type="submit" disabled={saving}>
                {saving ? "Opretter..." : "Opret"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
