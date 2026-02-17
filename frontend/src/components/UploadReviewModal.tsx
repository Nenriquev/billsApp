import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { IconX, IconCheck } from "@tabler/icons-react";
import { PreviewTransaction, CategorySuggestion } from "../types";
import { formatDate, formatCurrency } from "../utils/format";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { saveSelectedTransactions, createCategory, fetchCategories } from "../redux/thunks/dataThunks";
import { setToast } from "../redux/slices/appSlice";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 100;
  padding: 20px;
  overflow-y: auto;
`;

const Panel = styled(motion.div)`
  background: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  width: min(95vw, 1000px);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;

  h2 {
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0;
  }

  .close-btn {
    cursor: pointer;
    color: var(--text-muted);
    transition: 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);

    &:hover {
      background: var(--border-light);
      color: var(--text-primary);
    }
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .select-all {
      font-size: 0.85rem;
      color: var(--accent);
      cursor: pointer;
      font-weight: 500;
      user-select: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const TransactionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 8px;
`;

const TransactionItem = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.15s;
  user-select: none;

  &:hover {
    background: var(--border-light);
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: var(--accent);
  }

  .transaction-info {
    flex: 1;
    display: grid;
    grid-template-columns: 2fr 1.5fr 1fr 1fr;
    gap: 12px;
    align-items: center;
    font-size: 0.9rem;

    .concept {
      font-weight: 500;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .category {
      font-size: 0.85rem;
      color: var(--text-secondary);
      background: var(--bg-body);
      padding: 2px 8px;
      border-radius: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      
      &.empty {
        font-style: italic;
        color: var(--text-muted);
        background: transparent;
      }
    }

    .date {
      color: var(--text-secondary);
      font-size: 0.85rem;
      text-align: right;
    }

    .value {
      font-weight: 600;
      color: var(--text-primary);
      text-align: right;
    }
  }
`;

const SuggestionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SuggestionItem = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;

  &:hover {
    border-color: var(--accent);
    background: var(--accent-light);
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: var(--accent);
    margin-top: 2px;
    flex-shrink: 0;
  }

  .suggestion-content {
    flex: 1;

    .category-name {
      font-weight: 600;
      font-size: 1rem;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .description {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .transactions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;

      .transaction-tag {
        font-size: 0.75rem;
        padding: 4px 8px;
        background: var(--border-light);
        border-radius: 4px;
        color: var(--text-secondary);
      }
    }
  }
`;

const Footer = styled.div`
  padding: 20px 24px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  background: var(--bg-card);

  .summary {
    font-size: 0.9rem;
    color: var(--text-secondary);

    strong {
      color: var(--text-primary);
    }
  }

  .actions {
    display: flex;
    gap: 12px;

    button {
      padding: 10px 24px;
      border: none;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .btn-cancel {
      background: var(--border-light);
      color: var(--text-secondary);

      &:hover:not(:disabled) {
        background: var(--border);
      }
    }

    .btn-save {
      background: var(--accent);
      color: white;

      &:hover:not(:disabled) {
        background: #4f46e5;
      }
    }
  }
`;

interface UploadReviewModalProps {
  open: boolean;
  transactions: PreviewTransaction[];
  categorySuggestions: CategorySuggestion[];
  onClose: () => void;
  onSave: () => void;
}

const UploadReviewModal = ({
  open,
  transactions,
  categorySuggestions,
  onClose,
  onSave,
}: UploadReviewModalProps) => {
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector((state) => state.data);
  const ref = useRef<HTMLDivElement>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<number>>(new Set());
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  
  const getCategoryDisplay = (tx: PreviewTransaction) => {
    if (tx.category) {
      const cat = categories.find((c) => c._id === tx.category);
      if (cat) {
        return (
          <>
            {cat.category}
            {tx.subcategory && <span style={{ opacity: 0.7 }}> &gt; {tx.subcategory}</span>}
          </>
        );
      }
    }
    
    // Si no tiene ID pero tiene una sugerencia de texto (nueva categoría propuesta por IA)
    if (tx.suggestedCategory) {
       return (
         <span style={{ color: "var(--accent)", fontStyle: "italic" }}>
           {tx.suggestedCategory} <small>(Nueva)</small>
         </span>
       );
    }

    return null;
  };

  // Inicializar con todas las transacciones y sugerencias seleccionadas
  useEffect(() => {
    if (open) {
      if (transactions.length > 0) {
        setSelectedTransactions(new Set(transactions.map((_, i) => i)));
      }
      if (categorySuggestions.length > 0) {
        setSelectedSuggestions(new Set(categorySuggestions.map((_, i) => i)));
      }
    }
  }, [open, transactions, categorySuggestions]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (!saving) {
          onClose();
        }
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose, saving]);

  const toggleTransaction = (index: number) => {
    setSelectedTransactions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleSuggestion = (index: number) => {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const selectAllTransactions = () => {
    if (selectedTransactions.size === transactions.length) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(transactions.map((_, i) => i)));
    }
  };

  const handleSave = async () => {
    if (selectedTransactions.size === 0) {
      dispatch(setToast({ open: true, msg: "Selecciona al menos una transacción", type: "danger" }));
      return;
    }

    setSaving(true);

    try {
      const newCategoryMap = new Map<string, string>();
      const categoryIds: string[] = [];
      
      // Identificar sugerencias rechazadas (no seleccionadas)
      const rejectedSuggestionNames = new Set<string>();
      categorySuggestions.forEach((s, i) => {
        if (!selectedSuggestions.has(i)) {
          rejectedSuggestionNames.add(s.category);
        }
      });

      // Crear solo las categorías marcadas que NO son existentes
      for (const index of selectedSuggestions) {
        const suggestion = categorySuggestions[index];
        
        // Si ya existe, no hacemos nada 
        if (suggestion.isExisting) continue;

        try {
          const result = await dispatch(
            createCategory({
              category: suggestion.category,
              types: [{ name: "Gasto", entry: "expense" }],
              subcategories: [],
            })
          ).unwrap();
          
          categoryIds.push(result._id);
          newCategoryMap.set(suggestion.category, result._id);
        } catch (error) {
          console.error("Error creando categoría:", error);
        }
      }

      // Guardar transacciones seleccionadas
      const transactionsToSave = Array.from(selectedTransactions).map((i) => {
        const tx = { ...transactions[i] };
        
        // 1. Verificar si la categoría asignada (ID) corresponde a una sugerencia rechazada
        if (tx.category) {
            const cat = categories.find(c => c._id === tx.category);
            if (cat && rejectedSuggestionNames.has(cat.category)) {
                tx.category = ""; // Borrar asignación rechazada
            }
        }

        // 2. Verificar si la sugerencia de texto corresponde a una rechazada
        if (tx.suggestedCategory && rejectedSuggestionNames.has(tx.suggestedCategory)) {
             delete tx.suggestedCategory; // Ignorar sugerencia rechazada
        }

        // 3. Asignar ID de nueva categoría si corresponde
        if (!tx.category && tx.suggestedCategory && newCategoryMap.has(tx.suggestedCategory)) {
          tx.category = newCategoryMap.get(tx.suggestedCategory)!;
        }
        
        return tx;
      });

      await dispatch(
        saveSelectedTransactions({
          transactions: transactionsToSave,
          categoryIds,
        })
      ).unwrap();

      await dispatch(fetchCategories());

      dispatch(
        setToast({
          open: true,
          msg: `${transactionsToSave.length} transacciones guardadas exitosamente`,
          type: "success",
        })
      );

      onSave();
      onClose();
    } catch (error) {
      dispatch(
        setToast({
          open: true,
          msg: error instanceof Error ? error.message : "Error al guardar transacciones",
          type: "danger",
        })
      );
    } finally {
      setSaving(false);
    }
  };

  const selectedCount = selectedTransactions.size;
  const totalValue = Array.from(selectedTransactions)
    .reduce((sum, i) => sum + transactions[i].value, 0);

  return (
    <AnimatePresence>
      {open && (
        <Overlay
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Panel
            ref={ref}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <Header>
              <h2>Revisar transacciones</h2>
              <IconX onClick={onClose} className="close-btn" size={24} />
            </Header>

            <Content>
              <Section>
                <div className="section-header">
                  <h3>Transacciones ({transactions.length})</h3>
                  <span className="select-all" onClick={selectAllTransactions}>
                    {selectedTransactions.size === transactions.length
                      ? "Deseleccionar todas"
                      : "Seleccionar todas"}
                  </span>
                </div>
                <TransactionsList>
                  {transactions.map((tx, index) => (
                    <TransactionItem key={index}>
                      <input
                        type="checkbox"
                        checked={selectedTransactions.has(index)}
                        onChange={() => toggleTransaction(index)}
                      />
                      <div className="transaction-info">
                        <span className="concept">{tx.concept}</span>
                        <span className={`category ${!tx.category && !tx.suggestedCategory ? "empty" : ""}`}>
                          {getCategoryDisplay(tx) || "Sin categoría"}
                        </span>
                        <span className="date">{formatDate(tx.date)}</span>
                        <span className="value">{formatCurrency(tx.value)}</span>
                      </div>
                    </TransactionItem>
                  ))}
                </TransactionsList>
              </Section>

              {/* Sección de Categorías NUEVAS */}
              {categorySuggestions.filter(s => !s.isExisting).length > 0 && (
                <Section>
                  <h3>Sugerencias de NUEVAS categorías ({categorySuggestions.filter(s => !s.isExisting).length})</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "-12px", marginBottom: "4px" }}>
                    Estas categorías NO existen y serán creadas si las seleccionas.
                  </p>
                  <SuggestionsList>
                    {categorySuggestions.map((suggestion, index) => {
                      if (suggestion.isExisting) return null;
                      return (
                        <SuggestionItem key={index}>
                          <input
                            type="checkbox"
                            checked={selectedSuggestions.has(index)}
                            onChange={() => toggleSuggestion(index)}
                          />
                          <div className="suggestion-content">
                            <div className="category-name" style={{ color: "var(--accent)" }}>
                              {suggestion.category} <small>(Nueva)</small>
                            </div>
                            <div className="description">{suggestion.description}</div>
                            <div className="transactions">
                              {suggestion.transactions.slice(0, 5).map((tx, i) => (
                                <span key={i} className="transaction-tag">
                                  {tx}
                                </span>
                              ))}
                              {suggestion.transactions.length > 5 && (
                                <span className="transaction-tag">
                                  +{suggestion.transactions.length - 5} más
                                </span>
                              )}
                            </div>
                          </div>
                        </SuggestionItem>
                      );
                    })}
                  </SuggestionsList>
                </Section>
              )}

              {/* Sección de Categorías EXISTENTES */}
              {categorySuggestions.filter(s => s.isExisting).length > 0 && (
                <Section>
                  <h3>Confirmar asignaciones existentes ({categorySuggestions.filter(s => s.isExisting).length})</h3>
                  <SuggestionsList>
                    {categorySuggestions.map((suggestion, index) => {
                      if (!suggestion.isExisting) return null;
                      return (
                        <SuggestionItem key={index}>
                          <input
                            type="checkbox"
                            checked={selectedSuggestions.has(index)}
                            onChange={() => toggleSuggestion(index)}
                          />
                          <div className="suggestion-content">
                            <div className="category-name">
                              {suggestion.category}
                            </div>
                            <div className="description">{suggestion.description}</div>
                            <div className="transactions">
                              {suggestion.transactions.slice(0, 5).map((tx, i) => (
                                <span key={i} className="transaction-tag">
                                  {tx}
                                </span>
                              ))}
                              {suggestion.transactions.length > 5 && (
                                <span className="transaction-tag">
                                  +{suggestion.transactions.length - 5} más
                                </span>
                              )}
                            </div>
                          </div>
                        </SuggestionItem>
                      );
                    })}
                  </SuggestionsList>
                </Section>
              )}
            </Content>

            <Footer>
              <div className="summary">
                <strong>{selectedCount}</strong> de {transactions.length} transacciones
                seleccionadas • Total: <strong>{formatCurrency(totalValue)}</strong>
              </div>
              <div className="actions">
                <button className="btn-cancel" onClick={onClose} disabled={saving}>
                  Cancelar
                </button>
                <button
                  className="btn-save"
                  onClick={handleSave}
                  disabled={saving || selectedCount === 0}
                >
                  {saving ? (
                    "Guardando..."
                  ) : (
                    <>
                      <IconCheck size={18} />
                      Guardar seleccionadas
                    </>
                  )}
                </button>
              </div>
            </Footer>
          </Panel>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default UploadReviewModal;
