"use client";
import type { PointerEvent } from "react";

export function InteractiveDots() {
  const move = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
    event.currentTarget.style.setProperty("--pointer-opacity", "1");
  };
  const leave = (event: PointerEvent<HTMLDivElement>) => event.currentTarget.style.setProperty("--pointer-opacity", "0");
  return <div aria-hidden className="interactive-dot-field" onPointerMove={move} onPointerLeave={leave} />;
}
