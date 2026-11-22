"use client";

import { useId, useState } from "react";
import noteColors from "@/components/note/noteColors";
import styles from "./HomeSidePanel.module.css";
import { getBoardHref, sortBoardsByLastAccessed } from "./boardUtils";
import Image from "next/image";
import Link from "next/link";

export function BoardIcon({ color, className = styles.boardIcon }) {
  const id = `board-icon-${useId().replace(/:/g, "-")}`;

  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="36"
      height="48"
      viewBox="0 0 36 48"
      fill="none"
      aria-hidden="true"
    >
      <g clipPath={`url(#${id}-clip)`}>
        <path
          d="M6 1.5H30C32.4853 1.5 34.5 3.51472 34.5 6V42C34.5 44.4853 32.4853 46.5 30 46.5H6C3.51472 46.5 1.5 44.4853 1.5 42V6C1.5 3.51472 3.51472 1.5 6 1.5Z"
          strokeWidth="3"
          stroke={color || "var(--colors-neutral-100)"}
        />
        <path
          d="M6 1.5H30C32.4853 1.5 34.5 3.51472 34.5 6V42C34.5 44.4853 32.4853 46.5 30 46.5H6C3.51472 46.5 1.5 44.4853 1.5 42V6C1.5 3.51472 3.51472 1.5 6 1.5Z"
          strokeWidth="3"
          stroke="black"
          strokeOpacity="0.27"
        />
        <g filter={`url(#${id}-filter-inner)`}>
          <path
            d="M30 3H6C4.34315 3 3 4.34315 3 6V42C3 43.6569 4.34315 45 6 45H30C31.6569 45 33 43.6569 33 42V6C33 4.34315 31.6569 3 30 3Z"
            fill={color || "var(--colors-neutral-100)"}
          />
          <path
            d="M30 3H6C4.34315 3 3 4.34315 3 6V42C3 43.6569 4.34315 45 6 45H30C31.6569 45 33 43.6569 33 42V6C33 4.34315 31.6569 3 30 3Z"
            fill="#F8F8F8"
            fillOpacity="0.6"
          />
          <g filter={`url(#${id}-filter-pink)`}>
            <path d="M16.5 11.25H6V21.75H16.5V11.25Z" fill="#FBADC4" />
          </g>
          <path
            d="M16.5 11.25H6V12.75H16.5V11.25Z"
            fill="black"
            fillOpacity="0.08"
          />
          <g filter={`url(#${id}-filter-yellow)`}>
            <path d="M30 6H19.5V16.5H30V6Z" fill="#E8C07D" />
          </g>
          <path d="M30 6H19.5V7.5H30V6Z" fill="black" fillOpacity="0.08" />
          <g filter={`url(#${id}-filter-green)`}>
            <path d="M30 22.5H19.5V33H30V22.5Z" fill="#9FD8A1" />
          </g>
          <path d="M30 22.5H19.5V24H30V22.5Z" fill="black" fillOpacity="0.08" />
          <g filter={`url(#${id}-filter-turquoise)`}>
            <path d="M16.5 27.75H6V38.25H16.5V27.75Z" fill="#77DBCF" />
          </g>
          <path
            d="M16.5 27.75H6V29.25H16.5V27.75Z"
            fill="black"
            fillOpacity="0.08"
          />
        </g>
      </g>
      <defs>
        <filter
          id={`${id}-filter-inner`}
          x="3"
          y="3"
          width="30"
          height="43.5"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1.5" />
          <feGaussianBlur stdDeviation="0.75" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.16 0"
          />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow" />
        </filter>
        {[
          ["pink", "3", "9", "16.5", "16.5"],
          ["yellow", "16.5", "3.75", "16.5", "16.5"],
          ["green", "16.5", "20.25", "16.5", "16.5"],
          ["turquoise", "3", "25.5", "16.5", "16.5"],
        ].map(([color, x, y, width, height]) => (
          <filter
            key={color}
            id={`${id}-filter-${color}`}
            x={x}
            y={y}
            width={width}
            height={height}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="0.75" />
            <feGaussianBlur stdDeviation="1.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.19 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow"
              result="shape"
            />
          </filter>
        ))}
        <clipPath id={`${id}-clip`}>
          <rect width="36" height="48" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export default function HomeSidePanel({ boards: initialBoards, labels }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [initialLabels, setInitialLabels] = useState(labels);
  const [createLabelOpen, setCreateLabelOpen] = useState(false);
  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const [boards, setBoards] = useState(initialBoards);
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(
    noteColors.find((color) => color.id === "peach") ?? noteColors[0],
  );
  const [colorPanelOpen, setColorPanelOpen] = useState(false);
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
    setColorPanelOpen(false);
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
              <Link
                className={`${styles.navItem} ${styles.active}`}
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push("/");
                }}
              >
                <img src="/icons/light-bulb.svg" alt="" />
                <span>Noter</span>
              </button>
              <button
                className={styles.navItem}
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push("/404");
                }}
              >
                <img src="/icons/bell.svg" alt="" />
                <span>Påmindelser</span>
              </button>
            </nav>

            <section
              className={styles.section}
              aria-labelledby="labels-heading"
            >
              <h2
                id="labels-heading"
                className={`${styles.sectionHeading} ${styles.labelHeading}`}
              >
                Etiketter
              </h2>
              <button
                className={styles.createButton}
                type="button"
                onClick={() => setCreateLabelOpen(true)}
              >
                <Image
                  src="/icons/plus.svg"
                  alt=""
                  width={48}
                  height={48}
                  className={styles.createIcon}
                />
                <span>Opret en ny etiket</span>
              </button>
              {initialLabels.length > 0 && (
                <div className={styles.labelList}>
                  {initialLabels.map((label) => (
                    <button
                      className={styles.labelItem}
                      type="button"
                      key={label.id}
                      onClick={() => {
                        setOpen(false);
                        router.push(`/?label=${encodeURIComponent(label.id)}`);
                      }}
                    >
                      {label.name}
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section
              className={styles.section}
              aria-labelledby="boards-heading"
            >
              <h2
                id="boards-heading"
                className={`${styles.sectionHeading} ${styles.boardHeading}`}
              >
                Tavler
              </h2>
              <div className={styles.boardContainer}>
                <button
                  className={styles.createButton}
                  type="button"
                  onClick={() => setCreateBoardOpen(true)}
                >
                  <Image
                    src="/icons/plus.svg"
                    alt=""
                    width={48}
                    height={48}
                    className={styles.createIcon}
                  />
                  <span>Opret en ny tavle</span>
                </button>
                <div className={styles.boardList}>
                  {sortBoardsByLastAccessed(boards).map((board) => (
                    <Link
                      className={styles.boardItem}
                      href={getBoardHref(board)}
                      key={board.id}
                      prefetch={false}
                    >
                      <BoardIcon color={board.color} />
                      <span>{board.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            <nav className={styles.secondaryNav} aria-label="Andre funktioner">
              <button type="button" disabled>
                <img src="/icons/archive.svg" alt="" />
                <span>Arkiv</span>
              </button>
              <button type="button" disabled>
                <img src="/icons/bin.svg" alt="" />
                <span>Papirkurv</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push("/404");
                }}
              >
                <img src="/icons/settings.svg" alt="" />
                <span>Indstillinger</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push("/404");
                }}
              >
                <img src="/icons/question.svg" alt="" />
                <span>Hjælp & feedback</span>
              </button>
            </nav>
          </aside>
        </>
      )}

      {createLabelOpen && (
        <LabelPanel
          standalone
          fullScreen
          title="Rediger etiketter"
          className={styles.sideLabelPanel}
          onClose={() => setCreateLabelOpen(false)}
          onCreated={(label) => {
            setInitialLabels((current) => (
              current.some((item) => item.id === label.id)
                ? current
                    .map((item) => item.id === label.id ? label : item)
                    .sort((a, b) => a.name.localeCompare(b.name))
                : [...current, label].sort((a, b) => a.name.localeCompare(b.name))
            ));
          }}
          onDeleted={(labelId) => {
            setInitialLabels((current) => current.filter((label) => label.id !== labelId));
          }}
        />
      )}

      {createBoardOpen && (
        <div className={styles.modalLayer} role="presentation">
          <button
            className={styles.modalBackdrop}
            type="button"
            aria-label="Luk oprettelsesvindue"
            onClick={() => {
              setColorPanelOpen(false);
              setCreateBoardOpen(false);
            }}
          />
          <form className={styles.modal} onSubmit={createBoard}>
            <h2>Opret ny Tavle</h2>

            <label className={styles.nameField}>
              <span>Tavle titel</span>
              <small>
                Noter oprettet inde for en tavle vil automatisk få titlen som
                kategori
              </small>
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
              <button
                className={styles.colorPicker}
                type="button"
                aria-label={`Vælg tavlefarve, ${selectedColor.name}`}
                aria-expanded={colorPanelOpen}
                onClick={() => setColorPanelOpen(true)}
              >
                <span
                  className={styles.colorCircle}
                  style={{ backgroundColor: selectedColor.value }}
                />
                <small>{selectedColor.name}</small>
              </button>
            </div>

            {error && (
              <p className={styles.formError} role="alert">
                {error}
              </p>
            )}

            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                type="button"
                onClick={() => {
                  setColorPanelOpen(false);
                  setCreateBoardOpen(false);
                }}
              >
                Annuller
              </button>
              <button
                className={styles.createButtonPrimary}
                type="submit"
                disabled={saving}
              >
                {saving ? "Gemmer..." : "Gem"}
              </button>
            </div>
          </form>
        </div>
      )}

      {createBoardOpen && colorPanelOpen && (
        <>
          <button
            className={styles.colorBackdrop}
            type="button"
            aria-label="Luk farvevalg"
            onClick={() => setColorPanelOpen(false)}
          />
          <section className={styles.colorPanel} aria-label="Vælg tavlefarve">
            <h2>Farver</h2>
            <div className={styles.colorOptions}>
              {noteColors.map((color) => (
                <button
                  type="button"
                  key={color.id}
                  aria-label={color.name}
                  aria-pressed={selectedColor.id === color.id}
                  className={styles.colorOption}
                  style={{ backgroundColor: color.value }}
                  onClick={() => {
                    setSelectedColor(color);
                    setColorPanelOpen(false);
                  }}
                >
                  {selectedColor.id === color.id && (
                    <span aria-hidden="true">✓</span>
                  )}
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
