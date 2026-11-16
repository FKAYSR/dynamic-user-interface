import styles from "./ToolPanel.module.css";
import RippleEffect, { useRipple } from "./RippleEffect";

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
        <TypographyButton key={tool.icon} tool={tool} />
      ))}
      <TypographyButton tool={{ label: "Luk typografi", icon: "cancel.svg" }} onClick={onClose} />
    </section>
  );
}

function TypographyButton({ tool, onClick }) {
  const { ripple, triggerRipple, finishRipple } = useRipple();

  return (
    <button
      className={`${styles.typeTool} ${tool.separated ? styles.separatedTool : ""}`}
      type="button"
      aria-label={tool.label}
      onPointerDown={triggerRipple}
      onClick={(event) => {
        if (event.detail === 0) triggerRipple(event);
        onClick?.();
      }}
    >
      <RippleEffect ripple={ripple} onFinish={finishRipple} />
      <img src={`/icons/${tool.icon}`} alt="" />
    </button>
  );
}
