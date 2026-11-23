"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";
import TypographyPanel from "../../components/note/TypographyPanel";
import NoteAddItemsPanel from "../../components/note/NoteAddItemsPanel";
import ColorPickerPanel from "../../components/note/ColorPickerPanel";
import RippleEffect, { useRipple } from "../../components/note/RippleEffect";
import MoreMenuPanel from "../../components/note/MoreMenuPanel";
import PaperLayoutPanel from "../../components/note/PaperLayoutPanel";
import LabelPanel from "../../components/note/LabelPanel";
import noteColors from "../../components/note/noteColors";
import { getNoteBlocks } from "../../components/note/noteContent";
import { getBoardHref } from "@/components/navigation/boardUtils";

// Normaliserer ét gemt afsnit og genkender også den gamle tjeklistetekst.
function decodeBlock(block, index) {
  const text = typeof block === "string"
    ? block
    : typeof block?.text === "string"
      ? block.text
      : "";
  const legacyChecklist = text.match(/^-\s*\[([ xX])\]\s*(.*)$/);

  if (legacyChecklist) {
    return {
      id: index + 1,
      type: "checklist",
      text: legacyChecklist[2],
      checked: legacyChecklist[1].toLowerCase() === "x",
    };
  }

  const hasChecklistState = block && typeof block === "object"
    && ("checked" in block || block.type === "checklist");
  return {
    id: index + 1,
    type: hasChecklistState ? "checklist" : "paragraph",
    text,
    checked: Boolean(block?.checked),
  };
}

// Omdanner ny og ældre gemt noteindhold til blokke, som editoren kan vise.
function decodeInitialContent(content) {
  if (!content) {
    return [{ id: 1, type: "paragraph", text: "" }];
  }

  if (Array.isArray(content) && content.length > 0) {
    return content.map(decodeBlock);
  }

  if (typeof content === "string") {
    if (content.startsWith("[")) {
      try {
        const blocks = JSON.parse(content);
        if (Array.isArray(blocks) && blocks.length > 0) {
          return blocks.map(decodeBlock);
        }
      } catch {
        // Ugyldig JSON vises som almindelig tekst i stedet for at stoppe editoren.
      }
    }

    return content
      .split("\n")
      .filter((text, index, lines) => text.length > 0 || lines.length === 1)
      .map((text, index) => ({
        id: index + 1,
        type: "paragraph",
        text,
        checked: false,
      }));
  }

  return [{ id: 1, type: "paragraph", text: "", checked: false }];
}

// Fjerner editorens midlertidige felter, før indholdet gemmes.
function encodeContent(blocks) {
  return blocks.map((block) => ({
    text: block.text,
    ...(block.type === "checklist" ? { checked: Boolean(block.checked) } : {}),
  }));
}

// Finder den gemte type ud fra, om noten indeholder tekst eller tjeklister.
function getNoteType(blocks) {
  const hasText = blocks.some((block) => block.type === "paragraph");
  const hasChecklist = blocks.some((block) => block.type === "checklist");

  if (hasText && hasChecklist) return "mixed";
  if (hasChecklist) return "checklist";
  return "text";
}

const topActions = [
  { label: "Fastgør note", icon: "pin.svg", disabled: true },
  { label: "Del note", icon: "add-user.svg", disabled: true },
  { label: "Arkivér note", icon: "archive.svg" },
];

const editingActions = [
  { label: "Tilføj indhold", icon: "add-item.svg", panel: "items" },
  { label: "Skift farve", icon: "palette.svg", panel: "colors" },
  { label: "Tekstformatering", icon: "A.svg", panel: "typography" },
  { label: "Tilføj checkliste", icon: "checkbox.svg", command: "checklist" },
];

// Genbruger samme tilgængelige ikonknap og trykanimation i værktøjslinjerne.
function IconControl({
  href,
  label,
  icon,
  className = "",
  onClick,
  expanded,
  disabled = false,
  buttonRef,
}) {
  const { ripple, triggerRipple, finishRipple } = useRipple();
  const Control = href ? Link : "button";

  return (
    <Control
      {...(href ? { href, prefetch: false } : { type: "button" })}
      {...(!href ? { disabled, ref: buttonRef } : {})}
      className={`${styles.iconButton} ${className}`}
      aria-label={label}
      onPointerDown={triggerRipple}
      aria-haspopup={expanded !== undefined ? "dialog" : undefined}
      onClick={(event) => {
        if (event.detail === 0) triggerRipple(event);
        onClick?.(event);
      }}
      aria-expanded={expanded}
    >
      <RippleEffect ripple={ripple} onFinish={finishRipple} />
      <img src={`/icons/${icon}`} alt="" />
    </Control>
  );
}

export default function NotePage({ initialNote = null }) {
  // Samler editorens tilstand, så alle ændringer kan gemmes som én note.
  const router = useRouter();
  const returnHref = initialNote?.board?.name
    ? getBoardHref(initialNote.board)
    : "/";
  const [title, setTitle] = useState(initialNote?.title ?? "");
  const [titleFocused, setTitleFocused] = useState(false);
  const [blocks, setBlocks] = useState(() =>
    decodeInitialContent(initialNote?.content),
  );
  const [focusedBlockId, setFocusedBlockId] = useState(null);
  const [activeBlockId, setActiveBlockId] = useState(1);
  const [activePanel, setActivePanel] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [archiveError, setArchiveError] = useState(false);
  const [binHalfFull, setBinHalfFull] = useState(false);
  const [paperLayout, setPaperLayout] = useState(initialNote?.paper ?? "blank");
  const [saveStatus, setSaveStatus] = useState("");
  const saveStatusTimeout = useRef(null);
  const deleteTimeouts = useRef([]);
  const cancelDeleteButton = useRef(null);
  const moreOptionsButton = useRef(null);
  const titleField = useRef(null);
  const activePanelRef = useRef(null);
  const panelTriggerRef = useRef(null);
  useEffect(() => {
    return () => {
      if (saveStatusTimeout.current) {
        window.clearTimeout(saveStatusTimeout.current);
      }
      deleteTimeouts.current.forEach(window.clearTimeout);
    };
  }, []);
  useEffect(() => {
    if (deleteDialogOpen) cancelDeleteButton.current?.focus();
  }, [deleteDialogOpen]);
  useEffect(() => {
    if (!activePanel) return;
    activePanelRef.current
      ?.querySelector("button:not(:disabled), input:not(:disabled)")
      ?.focus();
  }, [activePanel]);
  const [noteColor, setNoteColor] = useState(
    initialNote?.color
      ? (noteColors.find((color) => color.id === initialNote.color)?.value
        ?? noteColors.find((color) => color.value === initialNote.color)?.value
        ?? "var(--baggrund)")
      : "var(--baggrund)",
  );
  const nextBlockId = useRef(
    getNoteBlocks(initialNote?.content).reduce(
      (highestId, block) => Math.max(highestId, Number(block.id) || 0),
      0,
    ),
  );
  const blockRefs = useRef(new Map());
  const cursor = useRef({ blockId: 1, start: 0, end: 0 });

  // Melder gemmeprocessen uden at gentage samme status hele tiden.
  const showSaveStatus = useCallback((status) => {
    setSaveStatus(status);
    if (saveStatusTimeout.current) {
      window.clearTimeout(saveStatusTimeout.current);
    }
    if (status === "Gemt" || status === "Kunne ikke gemme") {
      saveStatusTimeout.current = window.setTimeout(() => {
        setSaveStatus("");
      }, 2000);
    }
  }, []);

  // Gemmer hele noten og viser fejl eller succes i skærmlæserens statusområde.
  const saveNote = useCallback(async () => {
    if (!initialNote?.id) return false;

    const matchingColor = noteColors.find((color) => color.value === noteColor);
    const content = encodeContent(blocks);

    showSaveStatus("Gemmer...");
    try {
      const response = await fetch(`/api/notes/${initialNote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          color: matchingColor?.id ?? "standard",
          paper: paperLayout,
          type: getNoteType(blocks),
        }),
      });

      if (!response.ok) throw new Error("Kunne ikke gemme noten.");
      showSaveStatus("Gemt");
      return true;
    } catch {
      showSaveStatus("Kunne ikke gemme");
      return false;
    }
  }, [initialNote, title, blocks, noteColor, paperLayout, showSaveStatus]);

  useEffect(() => {
    if (!initialNote?.id) return;

    const timeoutId = window.setTimeout(saveNote, 600);

    return () => window.clearTimeout(timeoutId);
  }, [initialNote?.id, saveNote]);

  // Opdaterer både React-state og farven, der bruges på resten af siden.
  function selectNoteColor(color) {
    setNoteColor(color);
    document.documentElement.style.setProperty("--baggrund", color);
  }

  // Opretter et tomt tekst- eller tjeklistepunkt med et unikt id.
  function createBlock(type, text = "") {
    return { id: ++nextBlockId.current, type, text, checked: false };
  }

  // Flytter fokus til et noteafsnit og placerer markøren i teksten.
  function focusBlock(id, position = 0) {
    setActiveBlockId(id);
    setFocusedBlockId(id);
    requestAnimationFrame(() => {
      const field = blockRefs.current.get(id);
      if (!field) return;
      field.focus();
      field.setSelectionRange(position, position);
      cursor.current = { blockId: id, start: position, end: position };
    });
  }

  // Husker markørens position, så formatering kan bevare skrivepunktet.
  function rememberCursor(id, field) {
    cursor.current = {
      blockId: id,
      start: field.selectionStart,
      end: field.selectionEnd,
    };
    setActiveBlockId(id);
  }

  // Opdaterer kun det valgte afsnit uden at ændre de andre afsnit.
  function updateBlock(id, changes) {
    setBlocks((currentBlocks) => currentBlocks.map((block) =>
      block.id === id ? { ...block, ...changes } : block
    ));
  }

  // Gør piletaster, Enter og Backspace til genveje mellem noteafsnit.
  function handleBlockKeyDown(event, block, index) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (index > 0) {
        const previousBlock = blocks[index - 1];
        focusBlock(previousBlock.id, previousBlock.text.length);
      } else {
        requestAnimationFrame(() => {
          titleField.current?.focus();
          titleField.current?.setSelectionRange(title.length, title.length);
        });
      }
      return;
    }

    if (event.key === "ArrowDown") {
      if (index < blocks.length - 1) {
        event.preventDefault();
        const nextBlock = blocks[index + 1];
        focusBlock(nextBlock.id, 0);
      }
      return;
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (block.type === "checklist" && block.text.length === 0) {
        updateBlock(block.id, { type: "paragraph", checked: false });
        focusBlock(block.id);
        return;
      }

      const nextType = block.type;
      const nextBlock = createBlock(nextType);
      setBlocks((currentBlocks) => {
        const nextBlocks = [...currentBlocks];
        nextBlocks.splice(index + 1, 0, nextBlock);
        return nextBlocks;
      });
      focusBlock(nextBlock.id);
      return;
    }

    if (
      (event.key === "Backspace" || event.key === "Delete")
      && block.type === "checklist"
      && block.text.length === 0
    ) {
      event.preventDefault();
      updateBlock(block.id, { type: "paragraph", checked: false });
      focusBlock(block.id);
      return;
    }

    if (event.key === "Backspace" && block.text.length === 0 && blocks.length > 1) {
      event.preventDefault();
      const previousBlock = blocks[Math.max(0, index - 1)];
      setBlocks((currentBlocks) => currentBlocks.filter((item) => item.id !== block.id));
      focusBlock(previousBlock.id, previousBlock.text.length);
    }
  }

  // Indsætter en tjekliste ved markøren uden at miste tekst før eller efter.
  function insertChecklist() {
    const currentIndex = blocks.findIndex((block) => block.id === activeBlockId);
    const index = currentIndex === -1 ? blocks.length - 1 : currentIndex;
    const currentBlock = blocks[index];
    const selection = cursor.current.blockId === currentBlock.id
      ? cursor.current
      : { start: currentBlock.text.length, end: currentBlock.text.length };
    const checklistBlock = createBlock("checklist");

    if (currentBlock.type === "paragraph") {
      const before = currentBlock.text.slice(0, selection.start);
      const after = currentBlock.text.slice(selection.end);
      const insertedBlocks = [checklistBlock];

      if (after.length > 0) {
        insertedBlocks.push(createBlock("paragraph", after));
      }

      if (currentBlock.text.length === 0 || before.length === 0) {
        setBlocks((currentBlocks) => {
          const nextBlocks = [...currentBlocks];
          nextBlocks.splice(index, 1, ...insertedBlocks);
          return nextBlocks;
        });
      } else {
        const precedingParagraph = { ...currentBlock, text: before };
        setBlocks((currentBlocks) => {
          const nextBlocks = [...currentBlocks];
          nextBlocks.splice(index, 1, precedingParagraph, ...insertedBlocks);
          return nextBlocks;
        });
      }
      focusBlock(checklistBlock.id);
      return;
    }

    setBlocks((currentBlocks) => {
      const nextBlocks = [...currentBlocks];
      nextBlocks.splice(index + 1, 0, checklistBlock);
      return nextBlocks;
    });
    focusBlock(checklistBlock.id);
  }

  // Anvender valgt formatering og sætter markøren tilbage i samme afsnit.
  function applyTypography(action) {
    const block = blocks.find((item) => item.id === activeBlockId);
    if (!block) return;

    let changes;
    if (action === "h1") changes = { heading: "h1" };
    else if (action === "h2") changes = { heading: "h2" };
    else if (action === "normal") changes = { heading: null };
    else if (action === "bold") changes = { bold: !block.bold };
    else if (action === "italic") changes = { italic: !block.italic };
    else if (action === "underline") changes = { underline: !block.underline };
    else if (action === "clear") changes = { heading: null, bold: false, italic: false, underline: false };
    else return;

    updateBlock(block.id, changes);
    const position = cursor.current.blockId === block.id ? cursor.current.end : block.text.length;
    setFocusedBlockId(block.id);
    requestAnimationFrame(() => {
      const field = blockRefs.current.get(block.id);
      if (!field) return;
      field.style.height = "auto";
      field.style.height = `${field.scrollHeight}px`;
      field.focus();
      field.setSelectionRange(position, position);
      cursor.current = { blockId: block.id, start: position, end: position };
    });
  }

  // Åbner et værktøjspanel eller lukker det, hvis det allerede er åbent.
  function togglePanel(panel, event) {
    if (event?.currentTarget) panelTriggerRef.current = event.currentTarget;
    setActivePanel((currentPanel) => currentPanel === panel ? null : panel);
  }

  // Lukker det aktive værktøjspanel.
  function closePanel() {
    setActivePanel(null);
    requestAnimationFrame(() => {
      (panelTriggerRef.current ?? moreOptionsButton.current)?.focus();
    });
  }

  // Lukker værktøjspanelet med Escape eller holder fokus inde i panelet.
  function handlePanelKeyDown(event) {
    if (event.key === "Escape") {
      closePanel();
      return;
    }

    if (event.key !== "Tab") return;
    const controls = activePanelRef.current?.querySelectorAll(
      'button:not(:disabled), input:not(:disabled), [tabindex="0"]',
    );
    const firstControl = controls?.[0];
    const lastControl = controls?.[controls.length - 1];

    if (event.shiftKey && document.activeElement === firstControl) {
      event.preventDefault();
      lastControl?.focus();
    } else if (!event.shiftKey && document.activeElement === lastControl) {
      event.preventDefault();
      firstControl?.focus();
    }
  }

  // Arkiverer først efter at de seneste ændringer er gemt.
  async function archiveNote() {
    if (!initialNote?.id) return;

    setArchiveError(false);
    if (!await saveNote()) {
      setArchiveError(true);
      return;
    }

    try {
      const response = await fetch(`/api/notes/${initialNote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "archive" }),
      });

      if (!response.ok) throw new Error("Kunne ikke arkivere noten.");

      router.push(returnHref);
      router.refresh();
    } catch {
      setArchiveError(true);
    }
  }

  // Afspiller sletteanimationen og sletter derefter noten på serveren.
  function deleteNote() {
    if (isDeleting) return;

    setDeleteDialogOpen(false);
    setDeleteError(false);
    setBinHalfFull(false);
    setIsDeleting(true);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animationDuration = reduceMotion ? 0 : 1350;
    const binAnimationDelay = reduceMotion ? 0 : 972;

    deleteTimeouts.current = [
      window.setTimeout(() => setBinHalfFull(true), binAnimationDelay),
    ];

    deleteTimeouts.current.push(window.setTimeout(async () => {
      try {
        if (initialNote?.id) {
          const response = await fetch(`/api/notes/${initialNote.id}`, {
            method: "DELETE",
          });
          if (!response.ok) throw new Error("Kunne ikke slette noten.");
        }

        router.push(returnHref);
        router.refresh();
      } catch {
        setIsDeleting(false);
        setBinHalfFull(false);
        setDeleteError(true);
        setDeleteDialogOpen(true);
      }
    }, animationDuration));
  }

  // Starter slettebekræftelsen fra menuen og fjerner tidligere fejlbeskeder.
  function requestDeleteNote() {
    closePanel();
    setDeleteError(false);
    setDeleteDialogOpen(true);
  }

  // Lukker slettebekræftelsen uden at ændre noten.
  function cancelDeleteNote() {
    setDeleteDialogOpen(false);
    setDeleteError(false);
    setBinHalfFull(false);
    requestAnimationFrame(() => moreOptionsButton.current?.focus());
  }

  // Vælger handlingen fra menuen med ekstra noteværktøjer.
  function selectMoreAction(action) {
    if (action === "delete") requestDeleteNote();
    else if (action === "label") setActivePanel("labels");
    else if (action === "paper") setActivePanel("paper");
  }

  const currentBlock = blocks.find((block) => block.id === activeBlockId);
  const activeFormat = {
    h1: currentBlock?.heading === "h1",
    h2: currentBlock?.heading === "h2",
    normal: !currentBlock?.heading,
    bold: Boolean(currentBlock?.bold),
    italic: Boolean(currentBlock?.italic),
    underline: Boolean(currentBlock?.underline),
  };

  return (
    <main className={styles.screen} style={{ backgroundColor: noteColor }}>
      <h1 className={styles.visuallyHidden}>
        {title || "Redigér note"}
      </h1>
      <div
        className={styles.noteLayout}
        inert={deleteDialogOpen || isDeleting || Boolean(activePanel) || undefined}
      >
        <div className={styles.topSection}>
          <nav className={styles.noteNav} aria-label="Notehandling" style={{ backgroundColor: noteColor }}>
            <IconControl
              href={returnHref}
              label={initialNote?.board?.name ? "Tilbage til tavlen" : "Tilbage til forsiden"}
              icon="arrow-left.svg"
              className={styles.plainButton}
              onClick={async (event) => {
                event.preventDefault();
                await saveNote();
                router.push(returnHref);
              }}
            />
            <span className={styles.saveStatus} role="status" aria-live="polite">
              {saveStatus}
            </span>
            <div className={styles.topActions}>
              {topActions.map((action) => (
                <IconControl
                  key={action.icon}
                  {...action}
                  disabled={action.disabled}
                  onClick={action.label === "Arkivér note" ? archiveNote : undefined}
                />
              ))}
            </div>
          </nav>

          <section
            className={`${styles.editor} ${isDeleting ? styles.editorThrowing : ""}`}
            aria-label="Redigér note"
          >
            <h2 className={styles.titleHeading}>
              <label className={styles.visuallyHidden} htmlFor="note-title">
                Titel
              </label>
              <input
                className={styles.titleInput}
                id="note-title"
                ref={titleField}
                type="text"
                placeholder={titleFocused ? "" : "Titel"}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onFocus={() => setTitleFocused(true)}
                onBlur={() => setTitleFocused(false)}
              />
            </h2>
            <div
              className={`${styles.bodyEditor} ${paperLayout === "lined" ? styles.linedBody : ""}`}
              aria-label="Notens brødtekst"
              role="group"
            >
              {blocks.map((block, index) => (
                <div className={styles.blockRow} key={block.id}>
                  {block.type === "checklist" && (
                    <input
                      className={styles.checklistToggle}
                      type="checkbox"
                      aria-label={`Markér tjeklistepunkt ${index + 1} som færdigt`}
                      checked={Boolean(block.checked)}
                      onChange={(event) => updateBlock(block.id, { checked: event.target.checked })}
                    />
                  )}
                  <textarea
                    ref={(field) => {
                      if (field) blockRefs.current.set(block.id, field);
                      else blockRefs.current.delete(block.id);
                    }}
                    className={`${styles.blockInput} ${block.type === "checklist" ? styles.checklistText : ""} ${block.checked ? styles.completedText : ""}`}
                    aria-label={block.type === "checklist"
                      ? `Tjeklistepunkt ${index + 1}`
                      : `Notetekst ${index + 1}`}
                    placeholder={block.type === "paragraph" && !block.text && focusedBlockId !== block.id ? "Skriv en note..." : ""}
                    value={block.text}
                    rows={1}
                    style={{
                      fontSize: block.heading === "h1"
                        ? "2rem"
                        : block.heading === "h2"
                          ? "1.5rem"
                          : undefined,
                      fontWeight: block.heading || block.bold
                        ? "var(--typography-weight-bold)"
                        : undefined,
                      fontStyle: block.italic ? "italic" : undefined,
                      textDecoration: [
                        block.underline ? "underline" : "",
                        block.checked ? "line-through" : "",
                      ].filter(Boolean).join(" ") || undefined,
                    }}
                    onFocus={(event) => {
                      setFocusedBlockId(block.id);
                      rememberCursor(block.id, event.currentTarget);
                    }}
                    onBlur={() => setFocusedBlockId((focusedId) => focusedId === block.id ? null : focusedId)}
                    onClick={(event) => rememberCursor(block.id, event.currentTarget)}
                    onSelect={(event) => rememberCursor(block.id, event.currentTarget)}
                    onChange={(event) => {
                      const field = event.currentTarget;
                      field.style.height = "auto";
                      field.style.height = `${field.scrollHeight}px`;
                      rememberCursor(block.id, field);
                      updateBlock(block.id, { text: field.value });
                    }}
                    onKeyDown={(event) => handleBlockKeyDown(event, block, index)}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer
          className={styles.bottomBar}
          aria-label="Noteværktøjer"
          style={{ backgroundColor: noteColor }}
        >
          <div className={styles.editingActions}>
            {editingActions.map(({ panel, command, ...action }) => (
              <IconControl
                key={action.icon}
                {...action}
                onClick={panel
                  ? (event) => togglePanel(panel, event)
                  : command === "checklist"
                    ? insertChecklist
                    : undefined}
                expanded={panel ? activePanel === panel : undefined}
              />
            ))}
          </div>
          <IconControl
            label="Flere muligheder"
            icon="more-vert.svg"
            buttonRef={moreOptionsButton}
            onClick={(event) => togglePanel("more", event)}
            expanded={activePanel === "more"}
          />
        </footer>
      </div>

      {activePanel && (
        <div
          ref={activePanelRef}
          role="dialog"
          aria-modal="true"
          aria-label={{
            typography: "Tekstformatering",
            items: "Tilføj indhold",
            colors: "Skift note farve",
            more: "Flere notemuligheder",
            labels: "Etiketter",
            paper: "Vælg papir layout",
          }[activePanel]}
          onKeyDown={handlePanelKeyDown}
        >
          <button
            className={`${styles.panelBackdrop} ${activePanel === "typography" ? styles.typographyBackdrop : ""}`}
            type="button"
            aria-label="Luk værktøjspanel"
            onClick={closePanel}
          />
          {activePanel === "typography" && (
            <TypographyPanel
              onClose={closePanel}
              onFormat={applyTypography}
              activeFormat={activeFormat}
            />
          )}
          {activePanel === "items" && <NoteAddItemsPanel />}
          {activePanel === "colors" && (
            <ColorPickerPanel selectedColor={noteColor} onSelectColor={selectNoteColor} />
          )}
          {activePanel === "more" && (
            <MoreMenuPanel onSelect={selectMoreAction} />
          )}
          {activePanel === "labels" && (
            <LabelPanel noteId={initialNote?.id} onClose={closePanel} />
          )}
          {activePanel === "paper" && (
            <PaperLayoutPanel
              selectedLayout={paperLayout}
              onSelectLayout={(layout) => {
                setPaperLayout(layout);
                closePanel();
              }}
            />
          )}
        </div>
      )}

      {(deleteDialogOpen || isDeleting) && (
        <div
          className={styles.deleteAnimation}
          role={deleteDialogOpen ? "dialog" : undefined}
          aria-modal={deleteDialogOpen ? "true" : undefined}
          aria-labelledby={deleteDialogOpen ? "delete-note-prompt" : undefined}
          aria-describedby={deleteDialogOpen ? "delete-note-description" : undefined}
          aria-label={isDeleting && !deleteDialogOpen ? "Sletter note" : undefined}
          aria-live={isDeleting && !deleteDialogOpen ? "polite" : undefined}
          tabIndex={deleteDialogOpen ? -1 : undefined}
          onKeyDown={(event) => {
            if (event.key === "Escape" && deleteDialogOpen) {
              cancelDeleteNote();
              return;
            }

            if (event.key === "Tab" && deleteDialogOpen) {
              const buttons = event.currentTarget.querySelectorAll("button:not(:disabled)");
              const firstButton = buttons[0];
              const lastButton = buttons[buttons.length - 1];

              if (event.shiftKey && document.activeElement === firstButton) {
                event.preventDefault();
                lastButton?.focus();
              } else if (!event.shiftKey && document.activeElement === lastButton) {
                event.preventDefault();
                firstButton?.focus();
              }
            }
          }}
        >
          {deleteDialogOpen && (
            <>
              <p id="delete-note-prompt" className={styles.deletePrompt}>Vil du slette noten?</p>
              <p id="delete-note-description" className={styles.visuallyHidden}>
                Denne handling flytter noten til papirkurven.
              </p>
              <div className={styles.deleteActions}>
                <button
                  ref={cancelDeleteButton}
                  type="button"
                  onClick={cancelDeleteNote}
                >
                  Afbryd
                </button>
                <button type="button" onClick={deleteNote}>Ja, slet</button>
              </div>
            </>
          )}
          <div className={styles.trashCan} aria-hidden="true">
            <img src={binHalfFull ? "/icons/bin-half-full.svg" : "/icons/bin.svg"} alt="" />
          </div>
        </div>
      )}
      {deleteError && (
        <p className={styles.deleteError} role="alert">Kunne ikke slette noten. Prøv igen.</p>
      )}
      {archiveError && (
        <p className={styles.deleteError} role="alert">
          Kunne ikke arkivere noten. Prøv igen.
        </p>
      )}
    </main>
  );
}
