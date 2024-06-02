import { ChangeEvent } from "react";
import { UploadPageWrapper } from "./Upload.styles";
import { useSheets } from "../../hooks/useSheets";

const Upload = () => {
  const formData = new FormData();
  const { uploadSheet } = useSheets();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const file = formData.get("sheet");
    const option = formData.get("bank");

    if (!file || !option) {
      console.error("Debes seleccionar un archivo y una opción");
      return;
    }

    uploadSheet(formData);
  };

  const handleChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (type === "file") {
      const inputElement = e.target as HTMLInputElement;
      const files = inputElement.files;
      if (files) {
        formData.append(name, files[0]);
      }
    } else {
      formData.append(name, value);
    }
  };

  return (
    <UploadPageWrapper>
      <h1>Upload</h1>

      <form onSubmit={handleSubmit}>
        <select defaultValue={" "} name="bank" onChange={handleChange}>
          <option value={" "} disabled>
            Seleciona una opcion
          </option>
          <option value={"bbva"}>BBVA</option>
          <option value={"santander"}>Santander</option>
        </select>
        <input type="file" name="sheet" accept=".csv, .xlsx, .xls" onChange={handleChange} />
        <button>Submit</button>
      </form>
    </UploadPageWrapper>
  );
};

export default Upload;
