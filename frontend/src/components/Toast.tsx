import { useEffect } from "react";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setToast } from "../redux/slices/appSlice";
import { IconCheck, IconAlertTriangle } from "@tabler/icons-react";

const Wrapper = styled.div<{ $type: string }>`
  position: fixed;
  z-index: 100;
  bottom: 20px;
  right: 20px;
  background: var(--bg-card);
  min-width: 300px;
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;

  .icon-wrap {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: ${(p) => (p.$type === "success" ? "var(--success-light)" : "var(--danger-light)")};
    color: ${(p) => (p.$type === "success" ? "var(--success)" : "var(--danger)")};
    svg { width: 16px; height: 16px; }
  }

  .msg {
    font-size: 0.88rem;
    color: var(--text-primary);
    font-weight: 500;
  }

  .bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    border-radius: 0 0 var(--radius) var(--radius);
    background: ${(p) => (p.$type === "success" ? "var(--success)" : "var(--danger)")};
  }
`;

const Toast = () => {
  const { open, msg, type } = useAppSelector((s) => s.app.toast);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => dispatch(setToast({ open: false, msg: "", type: null })), 4000);
    return () => clearTimeout(t);
  }, [open, dispatch]);

  return (
    <AnimatePresence>
      {open && (
        <Wrapper
          as={motion.div}
          $type={type || "success"}
          initial={{ x: "120%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "120%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <div className="icon-wrap">
            {type === "success" ? <IconCheck /> : <IconAlertTriangle />}
          </div>
          <span className="msg">{msg}</span>
          <motion.div
            className="bar"
            initial={{ width: "100%" }}
            animate={{ width: 0 }}
            transition={{ duration: 4 }}
          />
        </Wrapper>
      )}
    </AnimatePresence>
  );
};

export default Toast;
