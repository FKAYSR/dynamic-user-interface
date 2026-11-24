import styles from "./ToolPanel.module.css";
import { iconPath } from "../iconPath";
import noteColors from "./noteColors";

// Viser farver, så brugeren kan ændre notens baggrund.
export default function ColorPickerPanel({ selectedColor, onSelectColor }) {
  return (
    <section
      className={`${styles.panel} ${styles.colorPanel}`}
      aria-label="Farver"
    >
      <h2>Farver</h2>
      <div className={styles.colorOptions}>
        {noteColors.map((color) => {
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
              {color.icon && <img className={styles.dropletIcon} src={iconPath(color.icon)} alt="" />}
              {selected && <img className={styles.selectedMark} src={iconPath("color-selected.svg")} alt="" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}
