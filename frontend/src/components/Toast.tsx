import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import styled from "styled-components";
import { useEffect } from "react";
import { setToast } from "../redux/slices/appSlice";
import { AnimatePresence, motion } from "framer-motion";

const ToastWrapper = styled.div`
  position: fixed;
  z-index: 99;
  background-color: white;
  width: 300px;
  height: 100px;
  border-radius: 10px;
  bottom: 10px;
  right: 30px;
  overflow: hidden;
  border: 1px solid #8787875d;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.15);

  .progressBar {
    position: absolute;
    bottom: 0;
    height: 2px;
  }
`;

const colors = {
  success: "green",
  danger: "red",
};

const Toast = () => {
  const toast = useSelector((state: RootState) => state.app.toast);
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setToast({ open: false, msg: "", type: null }));
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {toast.open && (
        <ToastWrapper
          as={motion.div}
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {toast.msg}
          <motion.div
            className="progressBar"
            style={{ backgroundColor: toast.type ? colors[toast.type] : "" }}
            initial={{ width: "100%" }}
            animate={{ width: 0 }}
            transition={{ duration: 5 }}
          ></motion.div>
        </ToastWrapper>
      )}
    </AnimatePresence>
  );
};

export default Toast;
