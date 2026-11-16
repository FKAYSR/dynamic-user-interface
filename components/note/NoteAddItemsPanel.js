"use client";

import { useRef, useState } from "react";
import styles from "./ToolPanel.module.css";

const items = [
  { label: "Tag billede", icon: "kamera.svg" },
  { label: "Tilføj billede", icon: "image.svg" },
  { label: "Optagelse", icon: "mic.svg" },
  { label: "Tegning", icon: "tegning.svg" },
];

function NoteAddItem({ item }) {
  const [ripple, setRipple] = useState(null);
  const nextRippleId = useRef(0);

  function showRipple(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.detail === 0 ? bounds.width / 2 : event.clientX - bounds.left;
    const y = event.detail === 0 ? bounds.height / 2 : event.clientY - bounds.top;
    const radius = Math.hypot(Math.max(x, bounds.width - x), Math.max(y, bounds.height - y));

    setRipple({ id: ++nextRippleId.current, x, y, size: radius * 2 });
  }

  return (
    <button className={styles.itemRow} type="button" onClick={showRipple}>
      {ripple && (
        <span
          key={ripple.id}
          className={styles.ripple}
          aria-hidden="true"
          style={{
            "--ripple-x": `${ripple.x}px`,
            "--ripple-y": `${ripple.y}px`,
            "--ripple-size": `${ripple.size}px`,
          }}
          onAnimationEnd={() => setRipple((current) => current?.id === ripple.id ? null : current)}
        />
      )}
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
