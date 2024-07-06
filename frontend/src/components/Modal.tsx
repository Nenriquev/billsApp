import { AnimatePresence, motion } from "framer-motion";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { setModal } from "../redux/slices/appSlice";
import { IconX } from "@tabler/icons-react";
import Input from "./Input";
import useData from "../hooks/useData";
import { Transaction } from "../types";
import Dropdown from "./Dropdown";
import { RootState } from "../redux/store";
const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #0000005a;

  .main {
    background-color: white;
    border-radius: 10px;
    padding: 12px;
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.15);
    border: 1px solid #8787875d;
    width: 30%;
    height: 300px;

    .icon {
      cursor: pointer;
    }
  }
`;

const Modal = ({ open, element }: { open: boolean; element: Transaction | null }) => {
  const dispatch = useDispatch();
  const { updateTransaction } = useData();
  const categories = useSelector((state: RootState) => state.data.categories);
  const modalRef = useRef<HTMLDivElement>(null);
  const [inputValues, setInputValues] = useState<{ category?: string; value?: string; concept?: string } | null>(null);
  
  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      dispatch(setModal({ transaction: false }));
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputValues({ ...inputValues, [name]: value });
  };

  const handleSubmit = () => {
    if (element?._id) updateTransaction({ id: element?._id, data: inputValues });
  };

  useEffect(() => {
    if (element) {
      setInputValues({
        category: element.category,
        value: element.value,
        concept: element.concept,
      });
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      setInputValues(null);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <ModalWrapper as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="main" ref={modalRef}>
            <div>
              <IconX onClick={() => dispatch(setModal({ transaction: false }))} className="icon" />
            </div>
            <div className="">
              <Input name="value" value={inputValues?.value || ""} type="number" onChange={handleChange} />
              <Dropdown
                options={categories?.map((item) => ({ name: item.category, value: item.category })) || []}
                selectedOption={inputValues?.category}
                handleSelect={(item: any) => {
                  console.log(item);
                  setInputValues({ ...inputValues, category: item.value });
                }}
              />

              <Input name="concept" value={inputValues?.concept || ""} type="string" onChange={handleChange} />
            </div>

            <button onClick={handleSubmit}>Guardar</button>
          </div>
        </ModalWrapper>
      )}
    </AnimatePresence>
  );
};

export default Modal;
