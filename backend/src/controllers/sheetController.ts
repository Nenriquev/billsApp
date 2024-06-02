import { Response, Request } from "express";
import XLSX from "xlsx";
import { destructureData } from "../utils/relationBankData";
import Data from "../models/Data";

interface DataProps {
  concept: string;
  value: number;
  category: string;
  date: Date;
}

const readSheet = async (req: Request, res: Response) => {
  const { file, body } = req;

  if (!body.bank) {
    return res.status(400).json({ err: "Debe seleccionar el banco" });
  }

  if (
    file &&
    (file.mimetype === "application/vnd.ms-excel" || file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
  ) {
    const buffer = file.buffer;
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const data = destructureData(sheetData, body.bank);

    if (data && data.length > 0) {
      await saveDataInDb(data);
    }
  } else {
    return res.status(400).json({ err: "El archivo no es un archivo Excel válido." });
  }

  return res.status(200).json({ msg: "Succesfully" });
};

const saveDataInDb = async (data: DataProps[]) => {
  try {
    for (const element of data) {
      await Data.findOneAndUpdate({ concept: element.concept, date: element.date, value: element.value }, element, {
        upsert: true,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export { readSheet };
