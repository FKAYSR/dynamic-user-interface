import styles from "./ToolPanel.module.css";
import PanelAction from "./PanelAction";

const actions = [
  { id: "delete", label: "Slet note", icon: "bin.svg" },
  { id: "label", label: "Tilføj etiket", icon: "tag.svg" },
  { id: "paper", label: "Skift papir layout", icon: "layout/table-rows.svg" },
];

export default function MoreMenuPanel({ onSelect }) {
  return (
    <section
      className={`${styles.panel} ${styles.morePanel}`}
      aria-label="Flere notemuligheder"
    >
      {actions.map((action) => (
        <PanelAction
          key={action.id}
          icon={action.icon}
          label={action.label}
          onClick={() => onSelect(action.id)}
        />
      ))}
    </section>
  );
}
