"use client";

import styles from "./ToolPanel.module.css";
import RippleEffect, { useRipple } from "./RippleEffect";
import { iconPath } from "@/lib/iconPath";

// Viser én knap i et værktøjspanel med ikon, tekst og trykanimation.
export default function PanelAction({ icon, label, onClick, disabled = false }) {
  const { ripple, triggerRipple, finishRipple } = useRipple();

  return (
    <button
      className={styles.itemRow}
      type="button"
      disabled={disabled}
      onPointerDown={disabled ? undefined : triggerRipple}
      onClick={(event) => {
        if (disabled) return;
        if (event.detail === 0) triggerRipple(event);
        onClick?.();
      }}
    >
      <RippleEffect ripple={ripple} onFinish={finishRipple} />
      <img src={iconPath(icon)} alt="" />
      <span>{label}</span>
    </button>
  );
}
