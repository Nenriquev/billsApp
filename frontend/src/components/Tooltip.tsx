import { AnimatePresence, motion } from "framer-motion";
import React, { ReactNode, useState } from "react";
import styled from "styled-components";

const TooltipWrapper = styled.div<{ position: string }>`
  position: relative;

  .tooltip {
    position: absolute;
    top: 10%;
    ${(props) => props.position}: 50px;
    background-color: #000000e4;
    color: white;
    border-radius: 10px;
    padding: 10px;
    white-space: nowrap;
  }
`;

const Tooltip = ({ children, position, text }: { children: ReactNode; position: "left" | "right" | "bottom" | "top"; text: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <TooltipWrapper onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} position={position}>
      {children}
      <AnimatePresence>
        {open && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="tooltip">
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </TooltipWrapper>
  );
};

export default Tooltip;
