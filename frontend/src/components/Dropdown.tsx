import { IconChevronDown } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

interface DropdownProps {
  options: { name: string | number; value: string | number }[];
  handleSelect: any;
  selectedOption: string | number | undefined;
}

const DropdownWrapper = styled.div`
  width: 100%;
  position: relative;
  border-radius: 10px;
  border: 1px solid #a2a2a2;
  height: 40px;
  display: flex;
  align-items: center;
  cursor: pointer;
  background-color: white;

  .arrow {
    margin-left: auto;
    display: flex;
    align-items: center;
    padding-right: 5px;

    svg {
      stroke-width: 1;
    }
  }

  .label {
    padding: 10px;
  }

  .dropdown {
    position: absolute;
    display: flex;
    flex-direction: column;
    border: 1px solid #a2a2a2;
    border-radius: 0 0 10px 10px;
    top: 102%;
    width: 100%;
    background-color: white;
    overflow: hidden;
    z-index: 10;

    span {
      cursor: pointer;
      padding: 10px;
      transition: 0.3s;

      &:hover {
        background-color: #c9daff;
        transition: 0.3s;
      }
    }
  }
`;

const Dropdown = ({ options, handleSelect, selectedOption }: DropdownProps) => {
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <DropdownWrapper ref={dropdownRef} onClick={() => setOpenDropdown(!openDropdown)}>
      <span className="label">{options.find((item) => item.value === selectedOption)?.name || "Selecciona una opción"}</span>
      <div className="arrow">
        <IconChevronDown />
      </div>

      <AnimatePresence>
        {openDropdown && (
          <motion.div className="dropdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {options.map((option) => (
              <span key={option.value} onClick={() => handleSelect(option)}>
                {option.name}
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </DropdownWrapper>
  );
};

export default Dropdown;
