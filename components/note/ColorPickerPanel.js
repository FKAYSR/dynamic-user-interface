import styles from "./ToolPanel.module.css";
import { iconPath } from "@/lib/iconPath";
import noteColors from "./noteColors";
import Image from "next/image";

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
              {color.icon && <Image className={styles.dropletIcon} src={iconPath(color.icon)} alt="" width={24} height={24} />}
              {selected && <Image className={styles.selectedMark} src={iconPath("color-selected.svg")} alt="" width={20} height={20} />}
            </button>
          );
        })}
      </div>
    </section>
  );
}
