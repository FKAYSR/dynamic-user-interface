"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import noteColors from "@/components/note/noteColors";
import LabelPanel from "@/components/note/LabelPanel";
import styles from "./HomeSidePanel.module.css";
import { iconPath } from "@/lib/iconPath";
import { getBoardHref, sortBoardsByLastAccessed } from "./boardUtils";
import Image from "next/image";
import Link from "next/link";

// Holder tastaturfokus inde i en åben dialog, indtil brugeren lukker den.
function keepTabFocusInside(event, container) {
  if (event.key !== "Tab" || !container) return;

  const controls = container.querySelectorAll(
    'a[href], button:not(:disabled), input:not(:disabled)',
  );
  const firstControl = controls[0];
  const lastControl = controls[controls.length - 1];

  if (event.shiftKey && document.activeElement === firstControl) {
    event.preventDefault();
    lastControl?.focus();
  } else if (!event.shiftKey && document.activeElement === lastControl) {
    event.preventDefault();
    firstControl?.focus();
  }
}

// Tegner en tavle med farvede felter som et dekorativt ikon.
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

// Viser navigation og oprettelsesvinduer til tavler og etiketter.
export default function HomeSidePanel({ boards: initialBoards, labels, navigationKey }) {
  const panelId = `navigation-panel-${useId().replace(/:/g, "-")}`;
  const router = useRouter();
  const menuButtonRef = useRef(null);
  const panelRef = useRef(null);
  const createLabelButtonRef = useRef(null);
  const createBoardButtonRef = useRef(null);
  const boardDialogRef = useRef(null);
  const boardNameFieldRef = useRef(null);
  const colorPickerButtonRef = useRef(null);
  const colorPanelRef = useRef(null);
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

  useEffect(() => {
    if (!open) return;

    panelRef.current?.querySelector("a[href], button:not(:disabled)")?.focus();
    const menuButton = menuButtonRef.current;
    return () => {
      requestAnimationFrame(() => menuButton?.focus());
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    // Lukker det øverste åbne vindue eller holder fokus i sidemenuen.
    function handleMenuKeys(event) {
      if (event.key === "Escape") {
        if (colorPanelOpen) setColorPanelOpen(false);
        else if (createLabelOpen) setCreateLabelOpen(false);
        else if (createBoardOpen) setCreateBoardOpen(false);
        else setOpen(false);
        return;
      }

      if (!createLabelOpen && !createBoardOpen && !colorPanelOpen) {
        keepTabFocusInside(event, panelRef.current);
      }
    }

    document.addEventListener("keydown", handleMenuKeys);
    return () => document.removeEventListener("keydown", handleMenuKeys);
  }, [open, colorPanelOpen, createLabelOpen, createBoardOpen]);

  useEffect(() => {
    if (createBoardOpen) {
      boardNameFieldRef.current?.focus();
    } else {
      createBoardButtonRef.current?.focus();
    }
  }, [createBoardOpen]);

  useEffect(() => {
    if (!createLabelOpen) createLabelButtonRef.current?.focus();
  }, [createLabelOpen]);

  useEffect(() => {
    if (colorPanelOpen) {
      colorPanelRef.current?.querySelector("button")?.focus();
    } else if (open) {
      colorPickerButtonRef.current?.focus();
    }
  }, [colorPanelOpen, open]);

  // Holder tastaturfokus i den dialog, der er åben oven på navigationen.
  function handleDialogKeyDown(event) {
    const container = colorPanelOpen ? colorPanelRef.current : boardDialogRef.current;
    keepTabFocusInside(event, container);
  }

  // Opretter en tavle og viser en fejl i formularen, hvis serveren ikke lykkes.
  async function createBoard(event) {
    event.preventDefault();
    const boardName = name.trim();
    if (!boardName) {
      setError("Skriv et navn til tavlen.");
      boardNameFieldRef.current?.focus();
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: boardName, color: selectedColor.id }),
      });

      if (!response.ok) {
        setError("Tavlen kunne ikke oprettes.");
        return;
      }

      const { board } = await response.json();
      if (!board) {
        throw new Error("Serveren returnerede ikke den nye tavle.");
      }
      setBoards((current) => [board, ...current]);
      setName("");
      setCreateBoardOpen(false);
      setColorPanelOpen(false);
    } catch (requestError) {
      console.error("Tavlen kunne ikke oprettes:", requestError);
      setError("Tavlen kunne ikke oprettes. Kontrollér forbindelsen, og prøv igen.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        className={styles.menuButton}
        type="button"
        ref={menuButtonRef}
        inert={open || undefined}
        aria-label="Åbn menu"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <Image src={iconPath("burger-menu.svg")} alt="" width={48} height={48} />
      </button>

      {open && (
        <>
          <button
            className={styles.backdrop}
            type="button"
            aria-label="Luk menu"
            onClick={() => setOpen(false)}
          />
          <aside
            id={panelId}
            className={styles.panel}
            ref={panelRef}
            inert={createBoardOpen || createLabelOpen || colorPanelOpen || undefined}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${panelId}-title`}
          >
            <h2 id={`${panelId}-title`} className={styles.appName}>Notes</h2>

            <nav className={styles.primaryNav} aria-label="Primær navigation">
              <Link
                className={`${styles.navItem} ${navigationKey === "home" ? styles.active : ""}`}
                href="/"
                aria-current={navigationKey === "home" ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                <Image src={iconPath("light-bulb.svg")} alt="" width={24} height={24} />
                <span>Noter</span>
              </Link>
              <Link
                className={`${styles.navItem} ${styles.unavailable}`}
                href="/404"
                onClick={() => setOpen(false)}
              >
                <Image src={iconPath("bell.svg")} alt="" width={24} height={24} />
                <span>Påmindelser</span>
              </Link>
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
                ref={createLabelButtonRef}
                aria-haspopup="dialog"
                aria-expanded={createLabelOpen}
                onClick={() => setCreateLabelOpen(true)}
              >
                <Image
                  src={iconPath("plus.svg")}
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
                      <Image
                        className={styles.labelIcon}
                        src={iconPath(label.icon)}
                        alt=""
                        width={24}
                        height={24}
                      />
                      <span>{label.name}</span>
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
                  ref={createBoardButtonRef}
                  aria-haspopup="dialog"
                  aria-expanded={createBoardOpen}
                  onClick={() => setCreateBoardOpen(true)}
                >
                  <Image
                    src={iconPath("plus.svg")}
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
                      aria-current={navigationKey === `board-${board.id}` ? "page" : undefined}
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
              <Link
                className={navigationKey === "archive" ? styles.active : ""}
                href="/archive"
                aria-current={navigationKey === "archive" ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                <Image src={iconPath("archive.svg")} alt="" width={24} height={24} />
                <span>Arkiv</span>
              </Link>
              <Link
                className={navigationKey === "trash" ? styles.active : ""}
                href="/trash"
                aria-current={navigationKey === "trash" ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                <Image src={iconPath("bin.svg")} alt="" width={24} height={24} />
                <span>Papirkurv</span>
              </Link>
              <Link
                className={styles.unavailable}
                href="/404"
                onClick={() => setOpen(false)}
              >
                <Image src={iconPath("settings.svg")} alt="" width={24} height={24} />
                <span>Indstillinger</span>
              </Link>
              <Link
                className={styles.unavailable}
                href="/404"
                onClick={() => setOpen(false)}
              >
                <Image src={iconPath("question.svg")} alt="" width={24} height={24} />
                <span>Hjælp & feedback</span>
              </Link>
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
        <div
          className={styles.modalLayer}
          role="presentation"
          inert={colorPanelOpen || undefined}
        >
          <button
            className={styles.modalBackdrop}
            type="button"
            aria-label="Luk oprettelsesvindue"
            onClick={() => {
              setColorPanelOpen(false);
              setCreateBoardOpen(false);
            }}
          />
          <form
            className={styles.modal}
            ref={boardDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-board-title"
            aria-busy={saving}
            onKeyDown={handleDialogKeyDown}
            onSubmit={createBoard}
          >
            <h2 id="create-board-title">Opret ny Tavle</h2>

            <label className={styles.nameField}>
              <span>Tavle titel</span>
              <small id="board-name-description">
                Noter oprettet inde for en tavle vil automatisk få titlen som
                kategori
              </small>
              <input
                ref={boardNameFieldRef}
                name="name"
                type="text"
                placeholder="Tavletitel"
                value={name}
                aria-invalid={error ? true : undefined}
                aria-describedby={error
                  ? "board-name-description board-create-error"
                  : "board-name-description"}
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
                aria-controls="board-color-panel"
                aria-haspopup="dialog"
                ref={colorPickerButtonRef}
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
              <p id="board-create-error" className={styles.formError} role="alert">
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
          <section
            id="board-color-panel"
            className={styles.colorPanel}
            ref={colorPanelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="board-color-title"
            onKeyDown={handleDialogKeyDown}
          >
            <h2 id="board-color-title">Vælg tavlefarve</h2>
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
