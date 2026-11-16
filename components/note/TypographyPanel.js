import styles from "./ToolPanel.module.css";

const tools = [
  { label: "Overskrift 1", icon: "h1.svg" },
  { label: "Overskrift 2", icon: "h2.svg" },
  { label: "Tekststørrelse", icon: "Aa.svg" },
  { label: "Fed", icon: "bold.svg", separated: true },
  { label: "Kursiv", icon: "italic.svg" },
  { label: "Understreget", icon: "underline.svg" },
  { label: "Fjern formatering", icon: "remove-styling.svg" },
];

export default function TypographyPanel({ onClose }) {
  return (
    <section className={`${styles.panel} ${styles.typographyPanel}`} aria-label="Typografi">
      {tools.map((tool) => (
        <button
          className={`${styles.typeTool} ${tool.separated ? styles.separatedTool : ""}`}
          type="button"
          aria-label={tool.label}
          key={tool.icon}
        >
          <img src={`/icons/${tool.icon}`} alt="" />
        </button>
      ))}
      <button className={styles.typeTool} type="button" aria-label="Luk typografi" onClick={onClose}>
        <img src="/icons/cancel.svg" alt="" />
      </button>
    </section>
  );
}
