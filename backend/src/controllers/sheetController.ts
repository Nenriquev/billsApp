import { Response, Request } from "express";
import XLSX from "xlsx";
import { destructureData } from "../utils/relationBankData";
import Data from "../models/Data";
import bankData from "../data/bank.json";

interface DataProps {
  concept: string;
  value: number;
  category: string | null | undefined;
  date: Date;
  bank: string;
}

const readSheet = async (req: Request, res: Response) => {
  const { file, body } = req;

  try {
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
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: false });
      const headers: any = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 })[0];

      const matchedBank = bankData.find((bank) => {
        return bank.headers.every((header) => headers.includes(header));
      });

      if (!matchedBank || matchedBank.bank !== body.bank) {
        return res.status(400).json({ err: "El archivo tiene un formato invalido para el banco seleccionado" });
      }

      const data = await destructureData(sheetData, body.bank);

      if (data && data.length > 0) {
        await saveDataInDb(data);
      }
    } else {
      return res.status(400).json({ err: "Archivo Excel válido." });
    }

    return res.status(200).json({ msg: "Succesfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: "Server error" });
  }
};

const saveDataInDb = async (data: DataProps[]) => {
  try {
    for (const element of data) {
      await Data.findOneAndUpdate({ bank: element.bank, date: element.date, value: element.value }, element, {
        upsert: true,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export { readSheet };
