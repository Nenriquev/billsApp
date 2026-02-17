import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { UploadPageWrapper, UploadCard, LoadingOverlay } from "./Upload.styles";
import Loader from "../../components/Loader";
import Dropdown from "../../components/Dropdown";
import { useAppDispatch } from "../../redux/hooks";
import { previewSheet } from "../../redux/thunks/dataThunks";
import { DropdownOption, PreviewTransaction, CategorySuggestion } from "../../types";
import { IconUpload, IconFile, IconX } from "@tabler/icons-react";
import UploadReviewModal from "../../components/UploadReviewModal";
import { setToast } from "../../redux/slices/appSlice";

const bankOptions: DropdownOption[] = [
  { name: "BBVA (Excel)", value: "bbva" },
  { name: "Santander (Excel)", value: "santander" },
  { name: "Santander (PDF)", value: "santander-cuenta-pdf" },
];

const Upload = () => {
  const dispatch = useAppDispatch();
  const fileRef = useRef<HTMLInputElement>(null);
  const [bank, setBank] = useState<DropdownOption | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewData, setPreviewData] = useState<{
    transactions: PreviewTransaction[];
    categorySuggestions: CategorySuggestion[];
  } | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !bank) return;

    const formData = new FormData();
    formData.append("sheet", file);
    formData.append("bank", bank.value as string);

    setUploading(true);
    try {
      const result = await dispatch(previewSheet(formData)).unwrap();
      setPreviewData(result);
      setShowReviewModal(true);
    } catch (error) {
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

  const handleReviewComplete = () => {
    setPreviewData(null);
    setFile(null);
    setBank(null);
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

  const removeFile = () => {
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <UploadPageWrapper>
      <UploadCard>
        {uploading && (
          <LoadingOverlay>
            <Loader />
            <div>
              <span>Analizando transacciones...</span>
              <p className="subtitle" style={{ marginBottom: 0 }}>Clasificando con IA</p>
            </div>
          </LoadingOverlay>
        )}
        
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
                  <IconFile size={32} stroke={1.5} color="var(--accent)" />
                  <div className="file-details">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <button type="button" className="remove-btn" onClick={(e) => { e.stopPropagation(); removeFile(); }}>
                    <IconX size={20} />
                  </button>
                </div>
              ) : (
                <div className="drop-content">
                  <IconUpload size={40} stroke={1.5} color="var(--text-muted)" />
                  <span>Arrastra tu archivo aquí o <strong>haz clic</strong> para seleccionar</span>
                  <span className="formats">Formatos: .xls, .xlsx, .csv, .pdf</span>
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={!file || !bank || uploading}>
            {uploading ? "Procesando..." : "Subir y revisar"}
          </button>
        </form>
      </UploadCard>

      {showReviewModal && previewData && (
        <UploadReviewModal
          open={showReviewModal}
          transactions={previewData.transactions}
          categorySuggestions={previewData.categorySuggestions}
          onClose={() => {
            setShowReviewModal(false);
            handleReviewComplete();
          }}
          onSave={handleReviewComplete}
        />
      )}
    </UploadPageWrapper>
  );
};

export default Upload;
