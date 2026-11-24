"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./ToolPanel.module.css";
import { iconPath } from "@/lib/iconPath";
import Image from "next/image";

const icons = {
  activities: "1st-medal archery arrow-archery basketball-field basketball beer billiard birthday-cake bonfire book-stack book bookmark-book bowling-ball boxing-glove cinema-old cocktail cycling dart design-pencil dices disco favourite-book fire-flame Fishing flower football-ball football golf gym headphones hourglass karaoke leaderboard-star leaderboard locked-book lullaby magic-wand math-book medal movie music-double-note no-smoking-circle no-smoking open-book palette puzzle quiz rings running sea-and-sun sea-waves skateboard skateboarding smoking soccer-ball stretching swimming table tennis-ball-alt tennis-ball treadmill trekking trophy waist walking yoga",
  analytics: "graph-down graph-up percentage report-columns reports stat-down stat-up stats-down-square stats-report stats-up-square",
  animals: "apple-swift fish jellyfish wolf",
  buildings: "balcony bathroom building cellar church-alt church city elevator farm garage hospital house-rooms industry neighbourhood oil-industry planimetry shop-alt shop small-shop-alt small-shop tunnel",
  clothing: "bag beach-bag-big beach-bag glasses handbag hat her-slips large-suitcase pants-alt pants sandals scarf short-pants-alt short-pants t-shirt umbrella-full women-t-shirt",
  communication: "at-sign-circle at-sign chat-bubble-translate globe internet send-diagonal send time-zone www",
  devices: "apple-imac-2021 laptop megaphone printing-page smartphone-device video-projector wristwatch",
  emojis: "emoji-ball emoji-blink-left emoji-blink-right emoji-look-down emoji-look-left emoji-look-right emoji-look-up emoji-puzzled emoji-quite emoji-really emoji-sad emoji-satisfied emoji-sing-left-note emoji-sing-left emoji-sing-right-note emoji-sing-right emoji-surprise-alt emoji-surprise emoji-talking-angry emoji-talking-happy emoji-think-left emoji-think-right emoji",
  finance: "apple-wallet bank cash coin credit-card credit-cards lot-of-cash piggy-bank wallet",
  food: "apple-half-alt apple-half apple bbq bread-slice cart chocolate coffee-cup cracked-egg cutlery egg glass-empty glass-half-alt glass-half orange-half orange-slice-alt orange-slice pizza-slice",
  gaming: "arcade archery-match augmented-reality bishop bright-crown bright-star crown-circle crown dice-five dice-four dice-one dice-six dice-three dice-two gamepad hexagon-dice nintendo-switch pacman playstation-gamepad pokeball potion rook spades tournament xbox-a xbox-b xbox-x xbox-y",
  health: "donate female health-shield healthcare heart home-hospital hospital-sign male non-binary pharmacy-cross-circle pharmacy-cross-square stroller weight-alt weight",
  home: "air-conditioner bed-ready bed box-iso box closet crib desk dimmer-switch director-chair dishwasher domotic-issue drawer fridge google-home home-alt-slim-horiz home-alt-slim home-alt home-sale home-secure home-shield home-simple-door home-simple home-table home-temperature-in home-temperature-out home-user home lamp light-bulb-off light-bulb-on light-bulb mirror pillow pine-tree rounded-mirror sleeper-chair small-lamp-alt small-lamp sofa two-seater-sofa wash washing-machine",
  layout: "2x2-cell corner-bottom-left corner-bottom-right corner-top-left corner-top-right grid-add grid-minus grid-remove layout-left layout-right table-2-columns table-rows table view-columns-2 view-columns-3 view-grid view-structure-down view-structure-up",
  organization: "bookmark-empty label star-dashed star-half-dashed star three-stars",
  photography: "camera flash video-camera",
  science: "atom brain dna flask graduation-cap infinite magnet-energy magnet microscope moon-sat planet-sat planet radiation rocket round-flask test-tube",
  shapes: "circle flare heptagon hexagon-alt hexagon octagon pentagon rhombus square triangle",
  tools: "angle-tool hammer tools wrench",
  transport: "airplane bicycle car hot-air-balloon motorcycle train tram truck",
};

const catalog = Object.entries(icons).map(([category, names]) => ({
  category,
  items: names.split(" ").map((name) => ({ name, path: `${category}/${name}.svg` })),
}));
const iconCount = catalog.reduce((count, group) => count + group.items.length, 0);

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

export default function LabelPanel({
  noteId,
  onClose,
  title = "Føj etiket til note",
  standalone = false,
  onCreated,
  onDeleted,
  className = "",
  fullScreen = false,
}) {
  // Styrer etiketternes valg på noter og separat administration af etiketter.
  const [labels, setLabels] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [query, setQuery] = useState("");
  const [icon, setIcon] = useState("tag.svg");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const iconPickerRef = useRef(null);
  const iconPickerTrigger = useRef(null);
  const iconPickerTitleId = useId();
  const panelRef = useRef(null);

  useEffect(() => {
    if (fullScreen) {
      panelRef.current?.querySelector("button:not(:disabled)")?.focus();
    }
  }, [fullScreen]);

  useEffect(() => {
    let active = true;
    const endpoint = standalone || !noteId ? "/api/labels" : `/api/notes/${noteId}/labels`;
    // Hent etiketter én gang, og undgå at opdatere state efter panelet er lukket.
    async function loadLabels() {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error("Etiketterne kunne ikke hentes.");
        const data = await response.json();
        if (!active) return;
        setLabels(data.labels);
        setSelectedIds(data.selectedLabelIds ?? []);
      } catch {
        if (active) setErrorMessage("Etiketterne kunne ikke hentes. Prøv igen.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadLabels();
    return () => { active = false; };
  }, [noteId, standalone]);

  useEffect(() => {
    if (!iconPickerOpen) {
      iconPickerTrigger.current?.focus();
      return;
    }

    const selectedIcon = iconPickerRef.current?.querySelector(
      'button[aria-pressed="true"]',
    );
    const firstIcon = iconPickerRef.current?.querySelector("button");
    (selectedIcon ?? firstIcon)?.focus();
  }, [iconPickerOpen]);

  // Gemmer valgte etiketter på noten og ruller UI'et tilbage ved fejl.
  async function saveSelectedIds(nextIds) {
    if (!noteId) {
      setErrorMessage("Noten kunne ikke findes.");
      return false;
    }

    const previousIds = selectedIds;
    setSelectedIds(nextIds);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/notes/${noteId}/labels`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labelIds: nextIds }),
      });
      if (!response.ok) throw new Error("Etiketterne kunne ikke gemmes.");
      return true;
    } catch {
      setSelectedIds(previousIds);
      setErrorMessage("Etiketterne kunne ikke gemmes. Prøv igen.");
      return false;
    }
  }

  // Sletter en etiket og opdaterer både panelet og den overordnede liste.
  async function deleteLabel(labelId) {
    setErrorMessage("");
    try {
      const response = await fetch(`/api/labels/${labelId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Etiketten kunne ikke slettes.");
      setLabels((current) => current.filter((label) => label.id !== labelId));
      if (editingId === labelId) {
        setEditingId(null);
        setEditName("");
      }
      onDeleted?.(labelId);
    } catch {
      setErrorMessage("Etiketten kunne ikke slettes. Prøv igen.");
    }
  }

  // Opretter en ny etiket, føjer en eksisterende til noten eller gemmer en redigering.
  async function submitQuery() {
    if (saving) return;
    const name = (editingId ? editName : query).trim();
    if (!name) return;

    setSaving(true);
    setErrorMessage("");
    try {
      if (editingId) {
        const response = await fetch(`/api/labels/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, icon }),
        });
        if (!response.ok) throw new Error("Etiketten kunne ikke gemmes.");
        const { label } = await response.json();
        setLabels((current) => current
          .map((item) => item.id === label.id ? label : item)
          .sort((a, b) => a.name.localeCompare(b.name)));
        onCreated?.(label);
        setEditingId(null);
        setEditName("");
        setQuery("");
        setIconPickerOpen(false);
        return;
      }

      const existing = labels.find(
        (label) => label.name.toLowerCase() === name.toLowerCase(),
      );
      if (existing) {
        if (standalone) {
          onCreated?.(existing);
          if (!fullScreen) onClose?.();
        } else if (!selectedIds.includes(existing.id)) {
          const saved = await saveSelectedIds([...selectedIds, existing.id]);
          if (!saved) return;
        }
        setQuery("");
        return;
      }

      const endpoint = standalone || !noteId
        ? "/api/labels"
        : `/api/notes/${noteId}/labels`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon }),
      });
      if (!response.ok) throw new Error("Etiketten kunne ikke oprettes.");
      const { label } = await response.json();
      setLabels((current) => [...current, label]
        .sort((a, b) => a.name.localeCompare(b.name)));

      if (standalone) {
        onCreated?.(label);
        if (!fullScreen) onClose?.();
      } else {
        setSelectedIds((current) => [...current, label.id]);
      }
      setQuery("");
      setIconPickerOpen(false);
    } catch {
      setErrorMessage("Etiketten kunne ikke gemmes. Prøv igen.");
    } finally {
      setSaving(false);
    }
  }

  // Lukker ikonvælgeren med Escape eller holder tastaturfokus inde i dialogen.
  function handleIconPickerKeyDown(event) {
    event.stopPropagation();
    if (event.key === "Escape") {
      setIconPickerOpen(false);
      return;
    }

    keepTabFocusInside(event, iconPickerRef.current);
  }

  // Lukker fuldskærmsvisningen med Escape og fastholder tastaturfokus.
  function handlePanelKeyDown(event) {
    if (!fullScreen || iconPickerOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose?.();
      return;
    }

    if (event.key === "Tab") {
      event.stopPropagation();
      keepTabFocusInside(event, panelRef.current);
    }
  }

  const filteredLabels = editingId
    ? labels
    : labels.filter((label) => label.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <section
      className={`${styles.panel} ${fullScreen ? styles.fullScreenLabelPanel : styles.labelPanel} ${className}`}
      aria-label={title}
      role={fullScreen ? "dialog" : undefined}
      aria-modal={fullScreen ? "true" : undefined}
      aria-busy={loading || saving}
      ref={panelRef}
      onKeyDown={handlePanelKeyDown}
    >
      {fullScreen ? (
        <header className={styles.fullScreenLabelHeader} inert={iconPickerOpen || undefined}>
          <button className={styles.fullScreenBack} type="button" aria-label="Tilbage" onClick={onClose}>
            <Image src={iconPath("arrow-left.svg")} alt="" width={24} height={24} />
          </button>
          <h2>{title}</h2>
        </header>
      ) : (
        <div className={styles.labelHeader} inert={iconPickerOpen || undefined}>
          <h2>{title}</h2>
          <button className={styles.labelClose} type="button" aria-label="Luk" onClick={onClose}><Image src={iconPath("cancel.svg")} alt="" width={24} height={24} /></button>
        </div>
      )}
      <div className={styles.labelSearch} inert={iconPickerOpen || undefined}>
        <button
          className={fullScreen ? styles.fullScreenEditIcon : styles.labelIconButton}
          type="button"
          aria-label="Vælg etiketikon"
          aria-expanded={iconPickerOpen}
          aria-controls={`${iconPickerTitleId}-panel`}
          onClick={(event) => {
            iconPickerTrigger.current = event.currentTarget;
            setIconPickerOpen((open) => !open);
          }}
        >
          <Image src={iconPath(icon)} alt="" width={24} height={24} />
        </button>
        <input
          type="text"
          aria-label={fullScreen ? "Opret eller søg efter etiket" : "Søg eller opret etiket"}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={fullScreen ? "Opret ny etiket" : "Angiv etiketnavn"}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submitQuery();
            }
            if (event.key === "Escape") {
              setQuery("");
              setEditingId(null);
              setIconPickerOpen(false);
            }
          }}
        />
        {fullScreen ? (
          <button className={styles.fullScreenSubmit} type="button" aria-label="Gem etiket" onClick={submitQuery} disabled={saving}>
            <Image src={iconPath("check.svg")} alt="" width={24} height={24} />
          </button>
        ) : (
          <>
            {query && <button className={styles.labelClear} type="button" aria-label="Ryd søgning" onClick={() => setQuery("")}>×</button>}
            {!query && <span className={styles.labelSearchIcon} aria-hidden="true" />}
          </>
        )}
      </div>
      {query.trim() && !fullScreen && !labels.some((label) => label.name.toLowerCase() === query.trim().toLowerCase()) && (
        <button className={styles.labelCreate} type="button" onClick={submitQuery} disabled={saving} inert={iconPickerOpen || undefined}>
          <Image src={iconPath("plus.svg")} alt="" width={24} height={24} />
          <span>Opret <strong>&quot;{query.trim()}&quot;</strong></span>
        </button>
      )}
      {errorMessage && (
        <p className={styles.labelError} role="alert" inert={iconPickerOpen || undefined}>
          {errorMessage}
        </p>
      )}
      {iconPickerOpen && <div
        className={styles.iconPicker}
        id={`${iconPickerTitleId}-panel`}
        ref={iconPickerRef}
        role="group"
        aria-labelledby={iconPickerTitleId}
        onKeyDown={handleIconPickerKeyDown}
      >
        <header className={styles.iconPickerHeader}>
          <div><h3 id={iconPickerTitleId}>Alle ikoner</h3><span>{iconCount} ikoner</span></div>
          <button type="button" aria-label="Luk ikonoversigt" onClick={() => setIconPickerOpen(false)}>×</button>
        </header>
        <div className={styles.iconPickerList}>
          {catalog.map((group) => <section className={styles.iconCategory} key={group.category}>
            <h4>{group.category}</h4>
            <div>{group.items.map((item) => <button type="button" key={item.path} aria-label={item.name} aria-pressed={icon === item.path} onClick={() => { setIcon(item.path); setIconPickerOpen(false); }}>
              <Image src={iconPath(item.path)} alt="" width={24} height={24} />
            </button>)}</div>
          </section>)}
        </div>
      </div>}
      <div className={styles.labelList} inert={iconPickerOpen || undefined}>
        {loading ? <span className={styles.labelEmpty} role="status">Indlæser etiketter...</span> : errorMessage && labels.length === 0 ? null : filteredLabels.length ? filteredLabels.map((label) => {
          const selected = selectedIds.includes(label.id);
          if (fullScreen) {
            if (editingId === label.id) {
              return (
                <div className={styles.fullScreenLabelRow} key={label.id}>
                  <button
                    className={styles.inlineEditIcon}
                    type="button"
                    aria-label="Vælg etiketikon"
                    onClick={(event) => {
                      iconPickerTrigger.current = event.currentTarget;
                      setIconPickerOpen((open) => !open);
                    }}
                  >
                    <Image src={iconPath(icon)} alt="" width={24} height={24} />
                  </button>
                  <input
                    className={styles.inlineEditInput}
                    type="text"
                    value={editName}
                    aria-label={`Rediger navn for ${label.name}`}
                    onChange={(event) => setEditName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") submitQuery();
                      if (event.key === "Escape") {
                        setEditingId(null);
                        setEditName("");
                        setIconPickerOpen(false);
                      }
                    }}
                    autoFocus
                  />
                  <button
                    className={styles.inlineDeleteButton}
                    type="button"
                    aria-label={`Slet ${label.name}`}
                    onClick={() => deleteLabel(label.id)}
                  >
                    <Image src={iconPath("bin.svg")} alt="" width={24} height={24} />
                  </button>
                  <button
                    className={styles.inlineSaveButton}
                    type="button"
                    aria-label={`Gem ${label.name}`}
                    onClick={submitQuery}
                  >
                    <Image src={iconPath("check.svg")} alt="" width={24} height={24} />
                  </button>
                </div>
              );
            }
            return (
              <div className={styles.fullScreenLabelRow} key={label.id}>
                <Image src={iconPath(label.icon)} alt="" width={24} height={24} />
                <span>{label.name}</span>
                <button
                  type="button"
                  aria-label={`Rediger ${label.name}`}
                  onClick={() => {
                    setEditingId(label.id);
                    setEditName(label.name);
                    setIcon(label.icon || "tag.svg");
                    setIconPickerOpen(false);
                    setQuery("");
                  }}
                >
                  <Image src={iconPath("activities/design-pencil.svg")} alt="" width={24} height={24} />
                </button>
              </div>
            );
          }
          return <button className={styles.labelOption} type="button" key={label.id} aria-pressed={selected}
            onClick={() => {
              if (standalone) {
                onCreated?.(label);
                onClose?.();
              } else {
                saveSelectedIds(selected ? selectedIds.filter((id) => id !== label.id) : [...selectedIds, label.id]);
              }
            }}>
            <Image src={iconPath(label.icon)} alt="" width={24} height={24} /><span>{label.name}</span>
            {!standalone && <span className={`${styles.labelCheckbox} ${selected ? styles.labelChecked : ""}`}>{selected && <Image src={iconPath("check.svg")} alt="" width={24} height={24} />}</span>}
          </button>;
        }) : (
          <span className={styles.labelEmpty} role="status">
            {query.trim() ? "Ingen etiketter matcher søgningen." : "Ingen etiketter fundet."}
          </span>
        )}
      </div>
    </section>
  );
}
