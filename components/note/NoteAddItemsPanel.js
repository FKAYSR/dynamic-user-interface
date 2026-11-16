"use client";

import styles from "./ToolPanel.module.css";
import RippleEffect, { useRipple } from "./RippleEffect";

const items = [
  { label: "Tag billede", icon: "kamera.svg" },
  { label: "Tilføj billede", icon: "image.svg" },
  { label: "Optagelse", icon: "mic.svg" },
  { label: "Tegning", icon: "tegning.svg" },
];

function NoteAddItem({ item }) {
  const { ripple, triggerRipple, finishRipple } = useRipple();

  return (
    <button
      className={styles.itemRow}
      type="button"
      onPointerDown={triggerRipple}
      onClick={(event) => event.detail === 0 && triggerRipple(event)}
    >
      <RippleEffect ripple={ripple} onFinish={finishRipple} />
      <img src={`/icons/${item.icon}`} alt="" />
      <span>{item.label}</span>
    </button>
  );
}

export default function NoteAddItemsPanel() {
  return (
    <section className={`${styles.panel} ${styles.itemsPanel}`} aria-label="Tilføj til note">
      {items.map((item) => (
        <NoteAddItem item={item} key={item.icon} />
      ))}
    </section>
  );
}
