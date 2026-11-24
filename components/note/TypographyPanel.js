import styles from "./ToolPanel.module.css";
import RippleEffect, { useRipple } from "./RippleEffect";
import { iconPath } from "@/lib/iconPath";

const tools = [
  { label: "Overskrift 1", icon: "h1.svg", action: "h1" },
  { label: "Overskrift 2", icon: "h2.svg", action: "h2" },
  { label: "Normal tekst", icon: "Aa.svg", action: "normal" },
  { label: "Fed", icon: "bold.svg", action: "bold", separated: true },
  { label: "Kursiv", icon: "italic.svg", action: "italic" },
  { label: "Understreget", icon: "underline.svg", action: "underline" },
  { label: "Fjern formatering", icon: "remove-styling.svg", action: "clear" },
];

// Viser formateringsværktøjer og markerer den formatering, der er aktiv.
export default function TypographyPanel({ onClose, onFormat, activeFormat }) {
  return (
    <section className={`${styles.panel} ${styles.typographyPanel}`} aria-label="Typografi">
      {tools.map((tool) => (
        <TypographyButton
          key={tool.icon}
          tool={tool}
          selected={activeFormat?.[tool.action]}
          onClick={() => onFormat(tool.action)}
        />
      ))}
      <TypographyButton tool={{ label: "Luk typografi", icon: "cancel.svg" }} onClick={onClose} />
    </section>
  );
}

// Tegner én formateringsknap og oplyser, hvis den er valgt.
function TypographyButton({ tool, onClick, selected = false }) {
  const { ripple, triggerRipple, finishRipple } = useRipple();

  return (
    <button
      className={`${styles.typeTool} ${tool.separated ? styles.separatedTool : ""}`}
      type="button"
      aria-label={tool.label}
      aria-pressed={tool.action ? Boolean(selected) : undefined}
      onPointerDown={triggerRipple}
      onClick={(event) => {
        if (event.detail === 0) triggerRipple(event);
        onClick?.();
      }}
    >
      <RippleEffect ripple={ripple} onFinish={finishRipple} />
      <img src={iconPath(tool.icon)} alt="" />
    </button>
  );
}
