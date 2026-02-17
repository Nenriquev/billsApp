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

export async function previewFile(
  file: Express.Multer.File,
  bank: string
): Promise<ITransaction[]> {
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

  // Filter out transactions that already exist in the database.
  // Match by date + value + bank (not concept, since the user may have renamed it).
  // Handle duplicates: if the PDF has 2 transactions with the same date+value,
  // and the DB already has 1, only 1 should be shown as new.
  if (transactions.length === 0) return transactions;

  const dates = transactions.map((tx) => tx.date);
  const minDate = new Date(Math.min(...dates.map((d) => new Date(d).getTime())));
  const maxDate = new Date(Math.max(...dates.map((d) => new Date(d).getTime())));

  // Optimize query: find unmatched transactions in DB by date range ONLY.
  // We ignore bank to prevent duplicates if user uploads same data with different bank selection.
  const existingTransactions = await Data.find({
    date: { $gte: minDate, $lte: maxDate },
  }).lean();

  // Create a fast lookup map for existing transactions: Date -> Array of values
  // We use stringified date to ensure consistency
  const existingMap = new Map<string, number[]>();
  
  for (const tx of existingTransactions) {
    if (!tx.date) continue;
    // Normalize date to ISO string (YYYY-MM-DDTHH:mm:ss.sssZ) for comparison
    const txDate = new Date(tx.date).toISOString();

    if (!existingMap.has(txDate)) {
      existingMap.set(txDate, []);
    }
    if (tx.value !== undefined && tx.value !== null) {
      existingMap.get(txDate)?.push(tx.value);
    }
  }

  const newTransactions: ITransaction[] = [];

  for (const tx of transactions) {
    const txDate = new Date(tx.date).toISOString();
    const valuesOnDate = existingMap.get(txDate);

    let isDuplicate = false;

    if (valuesOnDate) {
      // Check if this specific value exists for this date
      const valueIndex = valuesOnDate.indexOf(tx.value);
      if (valueIndex !== -1) {
        // It's a match/duplicate!
        // Remove it from the list to handle multiple transactions with same amount on same day
        valuesOnDate.splice(valueIndex, 1);
        isDuplicate = true;
      }
    }

    if (!isDuplicate) {
      newTransactions.push(tx);
    }
  }

  return newTransactions;
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

export async function saveTransactions(transactions: ITransaction[]): Promise<void> {
  const operations = transactions.map((tx) => ({
    updateOne: {
      filter: { concept: tx.concept, date: tx.date, value: tx.value },
      update: { $setOnInsert: tx },
      upsert: true,
    },
  }));

  await Data.bulkWrite(operations);
}
