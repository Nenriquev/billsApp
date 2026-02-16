import { AnimatePresence, motion } from "framer-motion";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { IconX, IconTrash } from "@tabler/icons-react";
import Input from "./Input";
import Dropdown from "./Dropdown";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setModal } from "../redux/slices/appSlice";
import { updateTransaction, deleteTransaction } from "../redux/thunks/dataThunks";
import { Transaction, DropdownOption } from "../types";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 50;

  .panel {
    background: var(--bg-card);
    border-radius: var(--radius);
    padding: 24px;
    box-shadow: var(--shadow-lg);
    width: min(90vw, 440px);
    display: flex;
    flex-direction: column;
    gap: 14px;

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      h3 { font-size: 1.05rem; }
      .close-btn {
        cursor: pointer;
        color: var(--text-muted);
        transition: 0.2s;
        &:hover { color: var(--danger); }
      }
    }

    .field-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: -6px;
    }

    .actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
    }

    .actions-right {
      display: flex;
      gap: 10px;
    }

    button {
      padding: 9px 20px;
      border: none;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 0.88rem;
      font-weight: 500;
      transition: 0.2s;
    }

    .btn-save {
      background: var(--accent);
      color: white;
      &:hover { background: #4f46e5; }
    }

    .btn-cancel {
      background: var(--border-light);
      color: var(--text-secondary);
      &:hover { background: var(--border); }
    }

    .btn-delete {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #fef2f2;
      color: var(--danger);
      padding: 9px 16px;
      svg { width: 16px; height: 16px; }
      &:hover { background: #fee2e2; }
    }
  }
`;

const ConfirmOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 60;
`;

const ConfirmBox = styled(motion.div)`
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 24px;
  width: min(90vw, 380px);
  box-shadow: var(--shadow-lg);
  text-align: center;

  h4 { margin-bottom: 8px; font-size: 1rem; }
  p {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 20px;
    line-height: 1.5;
  }

  .confirm-actions {
    display: flex;
    gap: 10px;
    justify-content: center;

    button {
      padding: 9px 20px;
      border: none;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 0.88rem;
      font-weight: 500;
      transition: 0.2s;
    }

    .btn-cancel {
      background: var(--border-light);
      color: var(--text-secondary);
      &:hover { background: var(--border); }
    }

    .btn-confirm-delete {
      background: var(--danger);
      color: white;
      &:hover { background: #dc2626; }
    }
  }
`;

interface ModalProps {
  open: boolean;
  element: Transaction | null;
}

const Modal = ({ open, element }: ModalProps) => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((s) => s.data.categories);
  const ref = useRef<HTMLDivElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [values, setValues] = useState({
    category: "",
    value: "",
    concept: "",
    subcategory: "",
  });

  useEffect(() => {
    if (element) {
      setValues({
        category: element.category?._id ?? "",
        value: String(element.value),
        concept: element.concept,
        subcategory: element.subcategory ?? "",
      });
    }
    setConfirmDelete(false);
  }, [element]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (confirmDelete) return;
      if (ref.current && !ref.current.contains(e.target as Node)) {
        dispatch(setModal({ transaction: false }));
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, dispatch, confirmDelete]);

  const selectedCat = categories.find((c) => c._id === values.category);
  const subcategories = selectedCat?.subcategories ?? [];

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!element?._id) return;
    dispatch(
      updateTransaction({
        id: element._id,
        data: {
          category: { _id: values.category } as Transaction["category"],
          value: Number(values.value),
          concept: values.concept,
          subcategory: values.subcategory || undefined,
        },
      })
    );
  };

  const handleDelete = () => {
    if (!element?._id) return;
    dispatch(deleteTransaction(element._id));
    setConfirmDelete(false);
  };

  const close = () => dispatch(setModal({ transaction: false }));

  return (
    <>
      <AnimatePresence>
        {open && (
          <Overlay
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="panel"
              ref={ref}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="panel-header">
                <h3>Editar transacción</h3>
                <IconX onClick={close} className="close-btn" size={20} />
              </div>

              <span className="field-label">Valor</span>
              <Input name="value" value={values.value} type="number" onChange={handleChange} placeholder="0.00" />

              <span className="field-label">Categoría</span>
              <Dropdown
                options={categories.map((c) => ({ name: c.category, value: c._id }))}
                selectedOption={values.category}
                handleSelect={(o: DropdownOption) =>
                  setValues((p) => ({ ...p, category: o.value as string, subcategory: "" }))
                }
              />

              {subcategories.length > 0 && (
                <>
                  <span className="field-label">Subcategoría</span>
                  <Dropdown
                    options={subcategories.map((s) => ({ name: s.name, value: s.name }))}
                    selectedOption={values.subcategory}
                    handleSelect={(o: DropdownOption) =>
                      setValues((p) => ({ ...p, subcategory: o.value as string }))
                    }
                  />
                </>
              )}

              <span className="field-label">Concepto</span>
              <Input name="concept" value={values.concept} type="text" onChange={handleChange} placeholder="Concepto" />

              <div className="actions">
                <button className="btn-delete" onClick={() => setConfirmDelete(true)}>
                  <IconTrash /> Eliminar
                </button>
                <div className="actions-right">
                  <button className="btn-cancel" onClick={close}>Cancelar</button>
                  <button className="btn-save" onClick={handleSubmit}>Guardar</button>
                </div>
              </div>
            </motion.div>
          </Overlay>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete && (
          <ConfirmOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ConfirmBox
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h4>¿Eliminar transacción?</h4>
              <p>
                Se eliminará <strong>{element?.concept}</strong> por{" "}
                <strong>{Number(element?.value ?? 0).toFixed(2)} €</strong>.
                <br />Esta acción no se puede deshacer.
              </p>
              <div className="confirm-actions">
                <button className="btn-cancel" onClick={() => setConfirmDelete(false)}>Cancelar</button>
                <button className="btn-confirm-delete" onClick={handleDelete}>Eliminar</button>
              </div>
            </ConfirmBox>
          </ConfirmOverlay>
        )}
      </AnimatePresence>
    </>
  );
};

export default Modal;
