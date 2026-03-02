import { IconChevronDown, IconCheck } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { DropdownOption } from "../types";

interface MultiSelectDropdownProps {
  options: DropdownOption[];
  handleSelect: (options: (string | number)[]) => void;
  selectedOptions: (string | number)[];
  placeholder?: string;
}

const Wrapper = styled.div<{ $isOpen: boolean }>`
  width: 100%;
  position: relative;
  border-radius: var(--radius-sm);
  border: 1px solid ${(props) => (props.$isOpen ? "var(--accent)" : "var(--border)")};
  box-shadow: ${(props) => (props.$isOpen ? "0 0 0 3px var(--accent-light)" : "none")};
  height: 40px;
  display: flex;
  align-items: center;
  cursor: pointer;
  background: var(--bg-card);
  user-select: none;
  transition: all 0.2s;

  &:hover { 
    border-color: var(--accent); 
  }

  .arrow {
    margin-left: auto;
    display: flex;
    align-items: center;
    padding-right: 8px;
    color: var(--text-muted);
    transition: transform 0.2s;
    transform: ${(props) => (props.$isOpen ? "rotate(180deg)" : "rotate(0deg)")};
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
    max-height: 250px;
    overflow-y: auto;
    box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));

    .option-item {
      cursor: pointer;
      padding: 10px 12px;
      font-size: 0.88rem;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: 0.15s;
      
      &:hover { 
        background: var(--bg-hover); 
      }

      &.selected {
        background: var(--accent-light);
        color: var(--accent);
        font-weight: 500;
      }

      svg {
        width: 16px;
        height: 16px;
        stroke-width: 2.5;
      }
    }
  }
`;

const MultiSelectDropdown = ({ options, handleSelect, selectedOptions, placeholder = "Seleccionar opciones" }: MultiSelectDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const toggleOption = (value: string | number) => {
    if (selectedOptions.includes(value)) {
      handleSelect(selectedOptions.filter((o) => o !== value));
    } else {
      handleSelect([...selectedOptions, value]);
    }
  };

  const getLabel = () => {
    if (selectedOptions.length === 0) return null;
    if (selectedOptions.length === 1) {
      return options.find(o => o.value === selectedOptions[0])?.name;
    }
    return `${selectedOptions.length} seleccionados`;
  };

  const label = getLabel();

  return (
    <Wrapper ref={ref} $isOpen={open} onClick={() => setOpen((p) => !p)}>
      <span className={`label ${!label ? "placeholder" : ""}`}>
        {label ?? placeholder}
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
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {options.map((o) => {
              const isSelected = selectedOptions.includes(o.value);
              return (
                <div 
                  key={o.value} 
                  className={`option-item ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleOption(o.value)}
                >
                  <div style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isSelected && <IconCheck />}
                  </div>
                  {o.name}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </Wrapper>
  );
};

export default MultiSelectDropdown;
