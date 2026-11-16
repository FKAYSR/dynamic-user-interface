"use client";

import { useRef, useState } from "react";
import styles from "./RippleEffect.module.css";

export function useRipple() {
  const [ripple, setRipple] = useState(null);
  const nextId = useRef(0);

  function triggerRipple(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const keyboardClick = event.type === "click" && event.detail === 0;
    const x = keyboardClick ? bounds.width / 2 : event.clientX - bounds.left;
    const y = keyboardClick ? bounds.height / 2 : event.clientY - bounds.top;
    const radius = Math.hypot(Math.max(x, bounds.width - x), Math.max(y, bounds.height - y));

    setRipple({ id: ++nextId.current, x, y, size: radius * 2 });
  }

  function finishRipple(id) {
    setRipple((current) => current?.id === id ? null : current);
  }

  return { ripple, triggerRipple, finishRipple };
}

export default function RippleEffect({ ripple, onFinish }) {
  if (!ripple) return null;

  return (
    <span
      key={ripple.id}
      className={styles.ripple}
      aria-hidden="true"
      style={{
        "--ripple-x": `${ripple.x}px`,
        "--ripple-y": `${ripple.y}px`,
        "--ripple-size": `${ripple.size}px`,
      }}
      onAnimationEnd={() => onFinish(ripple.id)}
    />
  );
}
