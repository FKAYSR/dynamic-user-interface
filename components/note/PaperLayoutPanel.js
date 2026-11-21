import styles from "./ToolPanel.module.css";

const layouts = [
  { id: "blank", label: "Blank" },
  { id: "lined", label: "Linjeret" },
];

export default function PaperLayoutPanel({ selectedLayout, onSelectLayout }) {
  return (
    <section className={`${styles.panel} ${styles.paperPanel}`} aria-label="Vælg papir layout">
      <h2>Papir layout</h2>
      <div className={styles.paperOptions}>
        {layouts.map((layout) => (
          <button
            className={`${styles.paperOption} ${selectedLayout === layout.id ? styles.selectedPaper : ""}`}
            type="button"
            key={layout.id}
            aria-label={layout.label}
            aria-pressed={selectedLayout === layout.id}
            onClick={() => onSelectLayout(layout.id)}
          >
            <span className={`${styles.paperPreview} ${layout.id === "lined" ? styles.linedPreview : ""}`} />
            <span>{layout.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
