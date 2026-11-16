"use client";

import { useRef, useState } from "react";
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
  { label: "Tilføj checkliste", icon: "checkbox.svg", command: "checklist" },
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
  const [titleFocused, setTitleFocused] = useState(false);
  const [blocks, setBlocks] = useState([{ id: 1, type: "paragraph", text: "" }]);
  const [focusedBlockId, setFocusedBlockId] = useState(null);
  const [activeBlockId, setActiveBlockId] = useState(1);
  const [activePanel, setActivePanel] = useState(null);
  const [noteColor, setNoteColor] = useState("var(--colors-sticky-notes-standard)");
  const nextBlockId = useRef(1);
  const blockRefs = useRef(new Map());
  const cursor = useRef({ blockId: 1, start: 0, end: 0 });

  function createBlock(type, text = "") {
    return { id: ++nextBlockId.current, type, text, checked: false };
  }

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

  function rememberCursor(id, field) {
    cursor.current = {
      blockId: id,
      start: field.selectionStart,
      end: field.selectionEnd,
    };
    setActiveBlockId(id);
  }

  function updateBlock(id, changes) {
    setBlocks((currentBlocks) => currentBlocks.map((block) =>
      block.id === id ? { ...block, ...changes } : block
    ));
  }

  function handleBlockKeyDown(event, block, index) {
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

    if (event.key === "Backspace" && block.text.length === 0 && blocks.length > 1) {
      event.preventDefault();
      const previousBlock = blocks[Math.max(0, index - 1)];
      setBlocks((currentBlocks) => currentBlocks.filter((item) => item.id !== block.id));
      focusBlock(previousBlock.id, previousBlock.text.length);
    }
  }

  function insertChecklist() {
    const currentIndex = blocks.findIndex((block) => block.id === activeBlockId);
    const index = currentIndex === -1 ? blocks.length - 1 : currentIndex;
    const currentBlock = blocks[index];
    const selection = cursor.current.blockId === currentBlock.id
      ? cursor.current
      : { start: currentBlock.text.length, end: currentBlock.text.length };
    const checklistBlock = createBlock("checklist");
    const followingParagraph = createBlock("paragraph", "");

    if (currentBlock.type === "paragraph") {
      const before = currentBlock.text.slice(0, selection.start);
      const after = currentBlock.text.slice(selection.end);

      if (currentBlock.text.length === 0) {
        setBlocks((currentBlocks) => {
          const nextBlocks = [...currentBlocks];
          nextBlocks.splice(index, 1, checklistBlock, followingParagraph);
          return nextBlocks;
        });
      } else {
        const precedingParagraph = { ...currentBlock, text: before };
        followingParagraph.text = after;
        setBlocks((currentBlocks) => {
          const nextBlocks = [...currentBlocks];
          nextBlocks.splice(index, 1, precedingParagraph, checklistBlock, followingParagraph);
          return nextBlocks;
        });
      }
      focusBlock(checklistBlock.id);
      return;
    }

    setBlocks((currentBlocks) => {
      const nextBlocks = [...currentBlocks];
      nextBlocks.splice(index + 1, 0, checklistBlock, followingParagraph);
      return nextBlocks;
    });
    focusBlock(checklistBlock.id);
  }

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
            <div className={styles.bodyEditor} aria-label="Notens brødtekst">
              {blocks.map((block, index) => (
                <div className={styles.blockRow} key={block.id}>
                  {block.type === "checklist" && (
                    <input
                      className={styles.checklistToggle}
                      type="checkbox"
                      aria-label="Markér punkt som færdigt"
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
                    aria-label={block.type === "checklist" ? "Tjeklistepunkt" : "Notetekst"}
                    placeholder={block.type === "paragraph" && !block.text && focusedBlockId !== block.id ? "Skriv en note..." : ""}
                    value={block.text}
                    rows={1}
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

        <footer className={styles.bottomBar} aria-label="Noteværktøjer">
          <div className={styles.editingActions}>
            {editingActions.map(({ panel, command, ...action }) => (
              <IconButton
                key={action.icon}
                {...action}
                onClick={panel ? () => togglePanel(panel) : command === "checklist" ? insertChecklist : undefined}
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
