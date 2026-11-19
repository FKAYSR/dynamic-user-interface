import styles from "./ToolPanel.module.css";

const colors = [
  { name: "Standard", value: "var(--colors-sticky-notes-standard)", icon: "droplet.svg" },
  { name: "Lyserød", value: "var(--colors-sticky-notes-lyserød)" },
  { name: "Fersken", value: "var(--colors-sticky-notes-fersken)" },
  { name: "Gul", value: "var(--colors-sticky-notes-gul)" },
  { name: "Grøn", value: "var(--colors-sticky-notes-grøn)" },
  { name: "Turkis", value: "var(--colors-sticky-notes-turkis)" },
  { name: "Lyseblå", value: "var(--colors-sticky-notes-støvblå)" },
  { name: "Blå", value: "var(--colors-sticky-notes-blå)" },
  { name: "Lavendel", value: "var(--colors-sticky-notes-lavendel)" },
  { name: "Beige", value: "var(--colors-sticky-notes-beige)" },
];

export default function ColorPickerPanel({ selectedColor, onSelectColor }) {
  return (
    <section
      className={`${styles.panel} ${styles.colorPanel}`}
      aria-label="Farver"
      style={{ backgroundColor: selectedColor }}
    >
      <h2>Farver</h2>
      <div className={styles.colorOptions}>
        {colors.map((color) => {
          const selected = color.value === selectedColor;
          return (
            <button
              className={`${styles.colorOption} ${selected ? styles.selectedColor : ""}`}
              type="button"
              key={color.value}
              aria-label={color.name}
              aria-pressed={selected}
              style={{ backgroundColor: color.value }}
              onClick={() => onSelectColor(color.value)}
            >
              {color.icon && <img className={styles.dropletIcon} src={`/icons/${color.icon}`} alt="" />}
              {selected && <img className={styles.selectedMark} src="/icons/color-selected.svg" alt="" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}
