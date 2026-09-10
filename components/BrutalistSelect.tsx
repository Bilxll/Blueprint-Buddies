"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type BrutalistSelectOption = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: BrutalistSelectOption[];
  ariaLabel?: string;
  variant?: "field" | "compact" | "crm";
  disabled?: boolean;
};

export function BrutalistSelect({
  value,
  onChange,
  options,
  ariaLabel,
  variant = "field",
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const selected = options[selectedIndex] ?? options[0];

  useEffect(() => {
    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function choose(nextValue: string) {
    onChange(nextValue);
    setOpen(false);
    requestAnimationFrame(() => buttonRef.current?.focus());
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const current = options.findIndex((option) => option.value === value);
      const next = current < 0 ? 0 : (current + direction + options.length) % options.length;
      if (!open) setOpen(true);
      else choose(options[next].value);
    }
  }

  return (
    <div ref={rootRef} className={`brutalSelect brutalSelect--${variant} ${open ? "isOpen" : ""} ${disabled ? "isDisabled" : ""}`}>
      <button
        ref={buttonRef}
        type="button"
        className="brutalSelectTrigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className="brutalSelectValue">{selected?.label ?? "SELECT"}</span>
        <span className="brutalSelectIcon" aria-hidden="true"><ChevronDown size={16} /></span>
      </button>

      {open && (
        <div className="brutalSelectMenuWrap">
          <div className="brutalSelectRule"><span>SELECT</span><span>{String(options.length).padStart(2, "0")} OPTIONS</span></div>
          <div id={listId} className="brutalSelectMenu" role="listbox" aria-label={ariaLabel}>
            {options.map((option, index) => {
              const active = option.value === value;
              return (
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  key={option.value}
                  className={`brutalSelectOption ${active ? "selected" : ""}`}
                  onClick={() => choose(option.value)}
                >
                  <span className="brutalSelectIndex">{String(index + 1).padStart(2, "0")}</span>
                  <span className="brutalSelectOptionLabel">{option.label}</span>
                  <span className="brutalSelectCheck" aria-hidden="true">{active && <Check size={15} strokeWidth={3} />}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
