import { IconChevronDown } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { DropdownOption } from "../types";

interface DropdownProps {
  options: DropdownOption[];
  handleSelect: (option: DropdownOption) => void;
  selectedOption: string | number | undefined;
}

const Wrapper = styled.div`
  width: 100%;
  position: relative;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  height: 40px;
  display: flex;
  align-items: center;
  cursor: pointer;
  background: var(--bg-card);
  user-select: none;
  transition: border-color 0.2s;

  &:hover { border-color: var(--accent); }

  .arrow {
    margin-left: auto;
    display: flex;
    align-items: center;
    padding-right: 8px;
    color: var(--text-muted);
    svg { width: 16px; height: 16px; }
  }

  .label {
    padding: 0 12px;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.88rem;
    color: var(--text-primary);
  }

  .placeholder {
    color: var(--text-muted);
  }

  .menu {
    position: absolute;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    top: calc(100% + 4px);
    width: 100%;
    background: var(--bg-card);
    overflow: hidden;
    z-index: 30;
    max-height: 220px;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);

    span {
      cursor: pointer;
      padding: 8px 12px;
      font-size: 0.88rem;
      transition: 0.15s;
      &:hover { background: var(--accent-light); color: var(--accent); }
    }
  }
`;

const Dropdown = ({ options, handleSelect, selectedOption }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const selected = options.find((o) => o.value === selectedOption);

  return (
    <Wrapper ref={ref} onClick={() => setOpen((p) => !p)}>
      <span className={`label ${!selected ? "placeholder" : ""}`}>
        {selected?.name ?? "Selecciona una opción"}
      </span>
      <div className="arrow"><IconChevronDown /></div>
      <AnimatePresence>
        {open && (
          <motion.div
            className="menu"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {options.map((o) => (
              <span key={o.value} onClick={() => handleSelect(o)}>
                {o.name}
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </Wrapper>
  );
};

export default Dropdown;
