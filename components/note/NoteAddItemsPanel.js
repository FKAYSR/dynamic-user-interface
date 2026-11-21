"use client";

import styles from "./ToolPanel.module.css";
import PanelAction from "./PanelAction";

const items = [
  { label: "Tag billede", icon: "kamera.svg" },
  { label: "Tilføj billede", icon: "image.svg" },
  { label: "Optagelse", icon: "mic.svg" },
  { label: "Tegning", icon: "tegning.svg" },
];

export default function NoteAddItemsPanel() {
  return (
    <section className={`${styles.panel} ${styles.itemsPanel}`} aria-label="Tilføj til note">
      {items.map((item) => (
        <PanelAction key={item.icon} icon={item.icon} label={item.label} />
      ))}
    </section>
  );
}
