import { ChangeEvent, FormEvent, useRef, useState, useMemo } from "react";
import { 
  UploadPageWrapper, 
  UploadCard, 
  LoadingOverlay, 
  ReviewContainer, 
  SuggestionBlock, 
  TransactionTable, 
  SuccessState,
  StepProgressContainer,
  StepItem,
  StepLine,
  AIBadge
} from "./Upload.styles";
import Loader from "../../components/Loader";
import Dropdown from "../../components/Dropdown";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { previewSheet, saveSelectedTransactions, fetchTransactions, fetchCategories, createCategory, updateCategory } from "../../redux/thunks/dataThunks";
import { DropdownOption, PreviewTransaction, CategorySuggestion } from "../../types";
import { IconUpload, IconFile, IconX, IconCheck, IconTrash, IconChevronLeft, IconSparkles } from "@tabler/icons-react";
import { setToast } from "../../redux/slices/appSlice";
import { formatDate, formatCurrency } from "../../utils/format";
import { motion, AnimatePresence } from "framer-motion";

const bankOptions: DropdownOption[] = [
  { name: "BBVA (Excel)", value: "bbva" },
  { name: "Santander (Excel)", value: "santander" },
  { name: "Santander (PDF)", value: "santander-cuenta-pdf" },
];

type Step = 'UPLOAD' | 'LOADING' | 'REVIEW' | 'SUCCESS';

const StepProgress = ({ currentStep }: { currentStep: Step }) => {
  const steps: { key: Step; label: string }[] = [
    { key: 'UPLOAD', label: 'Selección' },
    { key: 'LOADING', label: 'Análisis' },
    { key: 'REVIEW', label: 'Revisión' },
    { key: 'SUCCESS', label: 'Listo' }
  ];

  const currentIdx = steps.findIndex(s => s.key === currentStep);
  const loadingIdx = steps.findIndex(s => s.key === 'LOADING');
  const reviewIdx = steps.findIndex(s => s.key === 'REVIEW');
  const successIdx = steps.findIndex(s => s.key === 'SUCCESS');

  return (
    <StepProgressContainer>
      <StepLine $completed={currentIdx > 0} />
      {steps.map((s, i) => {
        const isCompleted = i < currentIdx || currentStep === 'SUCCESS';
        const isActive = s.key === currentStep;
        return (
          <StepItem key={s.key} $active={isActive} $completed={isCompleted}>
            <div className="circle">
              {isCompleted ? <IconCheck size={18} /> : i + 1}
            </div>
            <span>{s.label}</span>
          </StepItem>
        );
      })}
    </StepProgressContainer>
  );
};

const Upload = () => {
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector((state) => state.data);
  const fileRef = useRef<HTMLInputElement>(null);
  
  // App States
  const [step, setStep] = useState<Step>('UPLOAD');
  const [bank, setBank] = useState<DropdownOption | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Review Data States
  const [transactions, setTransactions] = useState<PreviewTransaction[]>([]);
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !bank) return;

    const formData = new FormData();
    formData.append("sheet", file);
    formData.append("bank", bank.value as string);

    setStep('LOADING');
    setUploading(true);
    
    try {
      const result = await dispatch(previewSheet(formData)).unwrap();
      setTransactions(result.transactions);
      setSuggestions(result.categorySuggestions);
      setStep('REVIEW');
    } catch (error) {
      setStep('UPLOAD');
      dispatch(
        setToast({
          open: true,
          msg: error instanceof Error ? error.message : "Error al procesar el archivo",
          type: "danger",
        })
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFromSuggestion = (suggestionIdx: number, txId: string) => {
    const newSuggestions = [...suggestions];
    const suggestion = { ...newSuggestions[suggestionIdx] };
    
    const tx = transactions.find(t => t.tempId === txId);
    if (!tx) return;

    suggestion.transactions = suggestion.transactions.filter(concept => concept !== tx.concept);
    suggestion.tempIds = suggestion.tempIds?.filter(id => id !== txId);
    
    if (suggestion.transactions.length === 0) {
      newSuggestions.splice(suggestionIdx, 1);
    } else {
      newSuggestions[suggestionIdx] = suggestion;
    }
    setSuggestions(newSuggestions);

    const newTransactions: PreviewTransaction[] = transactions.map(t => {
      if (t.tempId === txId) {
        return { ...t, category: undefined, suggestedCategory: undefined, subcategory: null };
      }
      return t;
    });
    setTransactions(newTransactions);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const newCategoryMap = new Map<string, string>();
      const categoryIds: string[] = [];
      
      for (const suggestion of suggestions) {
        if (!suggestion.isExisting) {
          try {
            const uniqueConcepts = Array.from(new Set(suggestion.transactions));
            const result = await dispatch(
              createCategory({
                category: suggestion.category,
                types: [],
                subcategories: uniqueConcepts.map(concept => ({
                  name: concept,
                  types: []
                })),
              })
            ).unwrap();
            
            categoryIds.push(result._id);
            newCategoryMap.set(suggestion.category, result._id);
          } catch (err) {
            console.error("Error al crear categoría:", err);
          }
        } else {
          // Si YA EXISTE, comprobamos si hay nuevos conceptos para "aprender"
          const existingCat = categories.find(c => c.category === suggestion.category);
          if (existingCat) {
            const currentSubNames = new Set(existingCat.subcategories.map(s => s.name.toLowerCase()));
            const newConcepts = suggestion.transactions.filter(t => !currentSubNames.has(t.toLowerCase()));
            
            if (newConcepts.length > 0) {
              try {
                // Actualizamos la categoría añadiendo las nuevas subcategorías
                const updatedSubcategories = [
                  ...existingCat.subcategories,
                  ...newConcepts.map(name => ({ name, types: [] }))
                ];
                
                await dispatch(
                  updateCategory({
                    id: existingCat._id,
                    data: { subcategories: updatedSubcategories }
                  })
                ).unwrap();
              } catch (err) {
                console.error("Error al actualizar categoría existente:", err);
              }
            }
          }
        }
      }

      const transactionsToSave = transactions.map(tx => {
        const cleanedTx = { ...tx };
        if (cleanedTx.suggestedCategory && newCategoryMap.has(cleanedTx.suggestedCategory)) {
          cleanedTx.category = newCategoryMap.get(cleanedTx.suggestedCategory)!;
        }
        return cleanedTx;
      });

      await dispatch(
        saveSelectedTransactions({
          transactions: transactionsToSave,
          categoryIds,
        })
      ).unwrap();

      await dispatch(fetchTransactions());
      await dispatch(fetchCategories());

      setStep('SUCCESS');
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

  const reset = () => {
    setStep('UPLOAD');
    setFile(null);
    setBank(null);
    setTransactions([]);
    setSuggestions([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) setFile(files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) setFile(files[0]);
  };

  const unassignedTransactions = useMemo(() => 
    transactions.filter(t => !t.category && !t.suggestedCategory),
  [transactions]);

  const totalAmount = useMemo(() => 
    transactions.reduce((sum, t) => sum + t.value, 0),
  [transactions]);

  return (
    <UploadPageWrapper>
      <UploadCard $isReview={step === 'REVIEW'}>
        <div className="card-header">
          <StepProgress currentStep={step} />
        </div>

        <AnimatePresence mode="wait">
          {step === 'UPLOAD' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h1>Subir extracto bancario</h1>
              <p className="subtitle">
                Sube tus extractos en formato Excel (.xls, .xlsx) o PDF según el banco.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="field-label">Banco / Tipo</label>
                  <div className="dropdown-wrap">
                    <Dropdown
                      options={bankOptions}
                      handleSelect={setBank}
                      selectedOption={bank?.value}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="field-label">Archivo</label>
                  <div
                    className={`drop-zone ${dragOver ? "drag-over" : ""} ${file ? "has-file" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => !file && fileRef.current?.click()}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".csv,.xlsx,.xls,.pdf"
                      onChange={handleFileChange}
                      hidden
                    />

                    {file ? (
                      <div className="file-info">
                        <IconFile size={36} stroke={1.5} color="var(--accent)" />
                        <div className="file-details">
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                        <button type="button" className="remove-btn" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                          <IconX size={20} />
                        </button>
                      </div>
                    ) : (
                      <div className="drop-content">
                        <IconUpload size={48} stroke={1.5} color="var(--text-muted)" />
                        <span>Arrastra tu archivo aquí o <strong>haz clic</strong> para seleccionar</span>
                        <span className="formats">Formatos soportados: .xls, .xlsx, .csv, .pdf</span>
                      </div>
                    )}
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={!file || !bank}>
                  Continuar al análisis
                </button>
              </form>
            </motion.div>
          )}

          {step === 'LOADING' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingOverlay>
                <div className="loader-orbit">
                  <Loader />
                </div>
                <div>
                  <span>Clasificando con IA</span>
                  <p className="subtitle">Estamos identificando patrones y categorías en tus movimientos bancarios.</p>
                </div>
              </LoadingOverlay>
            </motion.div>
          )}

          {step === 'REVIEW' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <ReviewContainer>
                <div className="review-sticky-header">
                  <div className="header-info">
                    <h2>Revisar Asignaciones</h2>
                    <div className="stats">
                      <strong>{transactions.length}</strong> transacciones detectadas • Total: <strong>{formatCurrency(totalAmount)}</strong>
                    </div>
                  </div>
                  <AIBadge>
                    <IconSparkles size={18} />
                    Sugerencias de IA aplicadas
                  </AIBadge>
                </div>

                <div className="scroll-area">
                  {/* Bloques de Sugerencias */}
                  {suggestions.map((s, sIdx) => (
                    <SuggestionBlock key={s.category}>
                      <div className="block-header">
                        <div className="title-group">
                          <h3>
                            <IconSparkles size={18} />
                            {s.category}
                          </h3>
                          {!s.isExisting && <span className="badge">NUEVA CATEGORÍA</span>}
                        </div>
                        <span className="desc">{s.description}</span>
                      </div>
                      <TransactionTable>
                        <thead>
                          <tr>
                            <th>Concepto</th>
                            <th>Fecha</th>
                            <th style={{ textAlign: 'right' }}>Valor</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {s.tempIds?.map(txId => {
                            const tx = transactions.find(t => t.tempId === txId);
                            if (!tx) return null;
                            return (
                              <tr key={txId}>
                                <td className="concept" title={tx.concept}>{tx.concept}</td>
                                <td className="date">{formatDate(tx.date)}</td>
                                <td className="amount">{formatCurrency(tx.value)}</td>
                                <td className="actions">
                                  <button onClick={() => handleRemoveFromSuggestion(sIdx, txId)} title="Quitar de esta categoría">
                                    <IconTrash size={18} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </TransactionTable>
                    </SuggestionBlock>
                  ))}

                  {/* Bloque de Transacciones Sin Asignar */}
                  {unassignedTransactions.length > 0 && (
                    <SuggestionBlock style={{ borderColor: 'var(--border)', opacity: 0.7 }}>
                      <div className="block-header" style={{ background: '#f8fafc' }}>
                        <div className="title-group">
                          <h3 style={{ color: 'var(--text-secondary)' }}>Sin asignar (Otros)</h3>
                        </div>
                        <span className="desc">Movimientos no clasificados</span>
                      </div>
                      <TransactionTable>
                        <tbody>
                          {unassignedTransactions.map(tx => (
                            <tr key={tx.tempId}>
                              <td className="concept">{tx.concept}</td>
                              <td className="date">{formatDate(tx.date)}</td>
                              <td className="amount">{formatCurrency(tx.value)}</td>
                              <td></td>
                            </tr>
                          ))}
                        </tbody>
                      </TransactionTable>
                    </SuggestionBlock>
                  )}
                </div>

                <div className="review-footer">
                  <button className="btn-secondary" onClick={() => setStep('UPLOAD')} disabled={saving}>
                    <IconChevronLeft size={18} />
                    Volver y cambiar archivo
                  </button>
                  <div className="actions">
                    <button className="btn-secondary" onClick={reset} disabled={saving}>
                      Cancelar
                    </button>
                    <button className="btn-primary" onClick={handleSave} disabled={saving}>
                      {saving ? "Guardando..." : (
                        <>
                          <IconCheck size={20} />
                          Finalizar y Guardar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </ReviewContainer>
            </motion.div>
          )}

          {step === 'SUCCESS' && (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <SuccessState>
                <div className="icon-circle">
                  <IconCheck size={40} />
                </div>
                <h2>¡Importación Exitosa!</h2>
                <p>Hemos procesado correctamente todos tus movimientos. Ya puedes verlos en tu panel de control.</p>
                <button className="finish-btn" onClick={reset}>
                  Subir otro extracto
                </button>
              </SuccessState>
            </motion.div>
          )}
        </AnimatePresence>
      </UploadCard>
    </UploadPageWrapper>
  );
};

export default Upload;
