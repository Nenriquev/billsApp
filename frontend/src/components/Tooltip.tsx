import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useState } from "react";
import styled from "styled-components";

const Wrapper = styled.div<{ $position: string }>`
  position: relative;

  .tooltip {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    ${(p) => p.$position}: calc(100% + 8px);
    background: var(--text-primary);
    color: white;
    border-radius: 6px;
    padding: 6px 10px;
    white-space: nowrap;
    font-size: 0.75rem;
    font-weight: 500;
    pointer-events: none;
    z-index: 40;
  }
`;

interface TooltipProps {
  children: ReactNode;
  position: "left" | "right" | "bottom" | "top";
  text: string;
}

const Tooltip = ({ children, position, text }: TooltipProps) => {
  const [show, setShow] = useState(false);

  return (
    <Wrapper
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      $position={position}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="tooltip"
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </Wrapper>
  );
};

export default Tooltip;
