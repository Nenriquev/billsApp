import XLSX from "xlsx";
import Data from "../models/Data";
import bankData from "../data/bank.json";
import { AppError, ITransaction } from "../types";
import { parseBankTransactions } from "../utils/bankParsers";
import { parsePdfTransactions } from "../utils/pdfParser";

const EXCEL_MIMES = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const PDF_MIMES = ["application/pdf"];

export async function processFile(
  file: Express.Multer.File,
  bank: string
): Promise<{ count: number }> {
  const isPdf = PDF_MIMES.includes(file.mimetype);
  const isExcel = EXCEL_MIMES.includes(file.mimetype);

  if (!isPdf && !isExcel) {
    throw new AppError("Formato de archivo no soportado. Use Excel (.xls, .xlsx) o PDF.", 400);
  }

  let transactions: ITransaction[];

  if (isPdf) {
    transactions = await parsePdfTransactions(file.buffer, bank);
  } else {
    transactions = await processExcel(file.buffer, bank);
  }

  if (transactions.length > 0) {
    await saveTransactions(transactions);
  }

  return { count: transactions.length };
}

async function processExcel(buffer: Buffer, bank: string): Promise<ITransaction[]> {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const sheetData = XLSX.utils.sheet_to_json(sheet, { raw: false }) as Record<string, string>[];
  const headers = (XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] as string[]) || [];

  const matchedBank = bankData.find(
    (b) => b.headers.every((h) => headers.includes(h)) && b.bank === bank
  );

  if (!matchedBank) {
    throw new AppError(
      "El archivo tiene un formato inválido para el banco seleccionado",
      400
    );
  }

  return parseBankTransactions(sheetData, bank as "santander" | "bbva");
}

async function saveTransactions(transactions: ITransaction[]): Promise<void> {
  const operations = transactions.map((tx) => ({
    updateOne: {
      filter: { concept: tx.concept, date: tx.date, value: tx.value },
      update: { $setOnInsert: tx },
      upsert: true,
    },
  }));

  await Data.bulkWrite(operations);
}
