import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { UploadPageWrapper } from "./Upload.styles";
import Dropdown from "../../components/Dropdown";
import { useAppDispatch } from "../../redux/hooks";
import { uploadSheet } from "../../redux/thunks/dataThunks";
import { DropdownOption } from "../../types";
import { IconUpload, IconFile, IconX } from "@tabler/icons-react";

const bankOptions: DropdownOption[] = [
  { name: "BBVA (Excel)", value: "bbva" },
  { name: "Santander - Cuenta (Excel)", value: "santander" },
  { name: "Santander - Cuenta (PDF)", value: "santander-cuenta-pdf" },
  { name: "Santander - Tarjeta crédito (PDF)", value: "santander-credito" },
];

const Upload = () => {
  const dispatch = useAppDispatch();
  const fileRef = useRef<HTMLInputElement>(null);
  const [bank, setBank] = useState<DropdownOption | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !bank) return;

    const formData = new FormData();
    formData.append("sheet", file);
    formData.append("bank", bank.value as string);

    setUploading(true);
    await dispatch(uploadSheet(formData));
    setUploading(false);
    setFile(null);
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
      <h1>Subir extracto bancario</h1>
      <p className="subtitle">
        Sube tus extractos en formato Excel (.xls, .xlsx) o PDF según el banco.
      </p>

      <form onSubmit={handleSubmit}>
        <label className="field-label">Banco / Tipo</label>
        <div className="dropdown-wrap">
          <Dropdown
            options={bankOptions}
            handleSelect={setBank}
            selectedOption={bank?.value}
          />
        </div>

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
              <IconFile size={24} />
              <div className="file-details">
                <span className="file-name">{file.name}</span>
                <span className="file-size">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <button type="button" className="remove-btn" onClick={removeFile}>
                <IconX size={16} />
              </button>
            </div>
          ) : (
            <div className="drop-content">
              <IconUpload size={32} color="var(--text-muted)" />
              <span>Arrastra tu archivo aquí o <strong>haz clic</strong> para seleccionar</span>
              <span className="formats">Formatos: .xls, .xlsx, .csv, .pdf</span>
            </div>
          )}
        </div>

        <button type="submit" className="submit-btn" disabled={!file || !bank || uploading}>
          {uploading ? "Procesando..." : "Subir y procesar"}
        </button>
      </form>
    </UploadPageWrapper>
  );
};

export default Upload;
