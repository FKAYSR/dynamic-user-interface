import styles from "./ToolPanel.module.css";
import RippleEffect, { useRipple } from "./RippleEffect";

const actions = [
  { id: "delete", label: "Slet note", icon: "bin.svg" },
  { id: "label", label: "Tilføj etiket", icon: "tag.svg" },
  { id: "paper", label: "Skift papir layout", icon: "layout/table-rows.svg" },
];

function MenuAction({ action, onSelect }) {
  const { ripple, triggerRipple, finishRipple } = useRipple();

  return (
    <button
      className={styles.itemRow}
      type="button"
      onPointerDown={triggerRipple}
      onClick={(event) => {
        if (event.detail === 0) triggerRipple(event);
        onSelect(action.id);
      }}
    >
      <RippleEffect ripple={ripple} onFinish={finishRipple} />
      <img src={`/icons/${action.icon}`} alt="" />
      <span>{action.label}</span>
    </button>
  );
}

export default function MoreMenuPanel({ onSelect }) {
  return (
    <section
      className={`${styles.panel} ${styles.morePanel}`}
      aria-label="Flere notemuligheder"
    >
      {actions.map((action) => (
        <MenuAction key={action.id} action={action} onSelect={onSelect} />
      ))}
    </section>
  );
}
