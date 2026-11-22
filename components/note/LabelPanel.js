"use client";

import { useEffect, useState } from "react";
import styles from "./ToolPanel.module.css";

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
  const [labels, setLabels] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [query, setQuery] = useState("");
  const [icon, setIcon] = useState("tag.svg");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    let active = true;
    const endpoint = standalone || !noteId ? "/api/labels" : `/api/notes/${noteId}/labels`;
    fetch(endpoint)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        if (!active) return;
        setLabels(data.labels);
        setSelectedIds(data.selectedLabelIds ?? []);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [noteId, standalone]);

  async function saveSelectedIds(nextIds) {
    setSelectedIds(nextIds);
    await fetch(`/api/notes/${noteId}/labels`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ labelIds: nextIds }),
    });
  }

  async function deleteLabel(labelId) {
    const response = await fetch(`/api/labels/${labelId}`, {
      method: "DELETE",
    });
    if (!response.ok) return;
    setLabels((current) => current.filter((label) => label.id !== labelId));
    if (editingId === labelId) {
      setEditingId(null);
      setEditName("");
    }
    onDeleted?.(labelId);
  }

  async function submitQuery() {
    const name = (editingId ? editName : query).trim();
    if (!name) return;
    if (editingId) {
      const response = await fetch(`/api/labels/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon }),
      });
      if (!response.ok) return;
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
    const existing = labels.find((label) => label.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      if (standalone) {
        onCreated?.(existing);
        if (!fullScreen) onClose?.();
        setQuery("");
        return;
      }
      if (!selectedIds.includes(existing.id)) await saveSelectedIds([...selectedIds, existing.id]);
      setQuery("");
      return;
    }
    const response = await fetch(standalone || !noteId ? "/api/labels" : `/api/notes/${noteId}/labels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, icon }),
    });
    if (!response.ok) return;
    const { label } = await response.json();
    setLabels((current) => [...current, label].sort((a, b) => a.name.localeCompare(b.name)));
    if (standalone) {
      onCreated?.(label);
      if (!fullScreen) onClose?.();
    } else {
      setSelectedIds((current) => [...current, label.id]);
    }
    setQuery("");
    setIconPickerOpen(false);
  }

  const filteredLabels = editingId
    ? labels
    : labels.filter((label) => label.name.toLowerCase().includes(query.toLowerCase()));
  const iconCount = catalog.reduce((count, group) => count + group.items.length, 0);

  return (
    <section
      className={`${styles.panel} ${fullScreen ? styles.fullScreenLabelPanel : styles.labelPanel} ${className}`}
      aria-label={title}
    >
      {fullScreen ? (
        <header className={styles.fullScreenLabelHeader}>
          <button className={styles.fullScreenBack} type="button" aria-label="Tilbage" onClick={onClose}>
            <img src="/icons/arrow-left.svg" alt="" />
          </button>
          <h2>{title}</h2>
        </header>
      ) : (
        <div className={styles.labelHeader}>
          <h2>{title}</h2>
          <button className={styles.labelClose} type="button" aria-label="Luk" onClick={onClose}><img src="/icons/cancel.svg" alt="" /></button>
        </div>
      )}
      <div className={styles.labelSearch}>
        {fullScreen ? (
          <button
            className={styles.fullScreenEditIcon}
            type="button"
            aria-label="Vælg etiketikon"
            aria-expanded={iconPickerOpen}
            onClick={() => setIconPickerOpen((open) => !open)}
          >
            <img src={`/icons/${icon}`} alt="" />
          </button>
        ) : (
          <button className={styles.labelIconButton} type="button" aria-label="Vælg etiketikon" aria-expanded={iconPickerOpen} onClick={() => setIconPickerOpen((open) => !open)}>
            <img src={`/icons/${icon}`} alt="" />
          </button>
        )}
        <input type="text" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={fullScreen ? "Opret ny etiket" : "Angiv etiketnavn"}
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
          }} />
        {fullScreen ? (
          <button className={styles.fullScreenSubmit} type="button" aria-label="Gem etiket" onClick={submitQuery}>
            <img src="/icons/check.svg" alt="" />
          </button>
        ) : (
          <>
            {query && <button className={styles.labelClear} type="button" aria-label="Ryd søgning" onClick={() => setQuery("")}>×</button>}
            {!query && <span className={styles.labelSearchIcon} aria-hidden="true" />}
          </>
        )}
      </div>
      {query.trim() && !fullScreen && !labels.some((label) => label.name.toLowerCase() === query.trim().toLowerCase()) && (
        <button className={styles.labelCreate} type="button" onClick={submitQuery}>
          <img src="/icons/plus.svg" alt="" />
          <span>Opret <strong>"{query.trim()}"</strong></span>
        </button>
      )}
      {iconPickerOpen && <div className={styles.iconPicker} role="dialog" aria-label="Alle ikoner">
        <header className={styles.iconPickerHeader}>
          <div><h3>Alle ikoner</h3><span>{iconCount} ikoner</span></div>
          <button type="button" aria-label="Luk ikonoversigt" onClick={() => setIconPickerOpen(false)}>×</button>
        </header>
        <div className={styles.iconPickerList}>
          {catalog.map((group) => <section className={styles.iconCategory} key={group.category}>
            <h4>{group.category}</h4>
            <div>{group.items.map((item) => <button type="button" key={item.path} aria-label={item.name} aria-pressed={icon === item.path} onClick={() => { setIcon(item.path); setIconPickerOpen(false); }}>
              <img src={`/icons/${item.path}`} alt="" />
            </button>)}</div>
          </section>)}
        </div>
      </div>}
      <div className={styles.labelList}>
        {loading ? <span className={styles.labelEmpty}>Indlæser etiketter...</span> : filteredLabels.length ? filteredLabels.map((label) => {
          const selected = selectedIds.includes(label.id);
          if (fullScreen) {
            if (editingId === label.id) {
              return (
                <div className={styles.fullScreenLabelRow} key={label.id}>
                  <button
                    className={styles.inlineEditIcon}
                    type="button"
                    aria-label="Vælg etiketikon"
                    onClick={() => setIconPickerOpen((open) => !open)}
                  >
                    <img src={`/icons/${icon}`} alt="" />
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
                    <img src="/icons/bin.svg" alt="" />
                  </button>
                  <button
                    className={styles.inlineSaveButton}
                    type="button"
                    aria-label={`Gem ${label.name}`}
                    onClick={submitQuery}
                  >
                    <img src="/icons/check.svg" alt="" />
                  </button>
                </div>
              );
            }
            return (
              <div className={styles.fullScreenLabelRow} key={label.id}>
                <img src={`/icons/${label.icon || "tag.svg"}`} alt="" />
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
                  <img src="/icons/activities/design-pencil.svg" alt="" />
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
            <img src={`/icons/${label.icon || "tag.svg"}`} alt="" /><span>{label.name}</span>
            {!standalone && <span className={`${styles.labelCheckbox} ${selected ? styles.labelChecked : ""}`}>{selected && <img src="/icons/check.svg" alt="" />}</span>}
          </button>;
        }) : query.trim() ? null : <span className={styles.labelEmpty}>Ingen etiketter fundet</span>}
      </div>
    </section>
  );
}
