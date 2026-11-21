"use client";

import styles from "./ToolPanel.module.css";
import RippleEffect, { useRipple } from "./RippleEffect";

export default function PanelAction({ icon, label, onClick }) {
  const { ripple, triggerRipple, finishRipple } = useRipple();

  return (
    <button
      className={styles.itemRow}
      type="button"
      onPointerDown={triggerRipple}
      onClick={(event) => {
        if (event.detail === 0) triggerRipple(event);
        onClick?.();
      }}
    >
      <RippleEffect ripple={ripple} onFinish={finishRipple} />
      <img src={`/icons/${icon}`} alt="" />
      <span>{label}</span>
    </button>
  );
}
