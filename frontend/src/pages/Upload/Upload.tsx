import { ChangeEvent, useState } from "react";
import { UploadPageWrapper } from "./Upload.styles";
import { useSheets } from "../../hooks/useSheets";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import Dropdown from "../../components/Dropdown";

const options = [
  {
    name: "BBVA",
    value: "bbva",
  },
  {
    name: "Santander",
    value: "santander",
  },
];

const Upload = () => {
  const { uploadSheet } = useSheets();
  const [option, setOption] = useState<{ name: string; value: string } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const errors = useSelector((state: RootState) => state.data.errors);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file || !option) {
      console.error("Debes seleccionar un archivo y una opción");
      return;
    }
    const formData = new FormData();
    formData.append("sheet", file);
    formData.append("bank", option.value);

    uploadSheet(formData);
  };

  const handleChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { type } = e.target;

    if (type === "file") {
      const inputElement = e.target as HTMLInputElement;
      const files = inputElement.files;
      if (files && files.length > 0) {
        setFile(files[0]);
      }
    }
  };

  return (
    <UploadPageWrapper>
      <h1>Upload</h1>

      <form onSubmit={handleSubmit}>
        <div className="drop">
          <Dropdown options={options} handleSelect={setOption} selectedOption={option?.name} />
        </div>
        {/* <select defaultValue={" "} name="bank" onChange={(e) => setOption(e.target.value)}>
          <option value={option} disabled>
            Seleciona una opcion
          </option>
          <option value={"bbva"}>BBVA</option>
          <option value={"santander"}>Santander</option>
        </select> */}
        <input type="file" name="sheet" accept=".csv, .xlsx, .xls" onChange={handleChange} />

        <button>Submit</button>
        {errors.uploadSheet && <span>{errors.uploadSheet}</span>}
      </form>
    </UploadPageWrapper>
  );
};

export default Upload;
