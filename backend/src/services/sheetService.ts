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
  bank: string,
  userId: string
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
    await saveTransactions(transactions, userId);
  }

  return { count: transactions.length };
}

export async function previewFile(
  file: Express.Multer.File,
  bank: string,
  userId: string
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

  if (transactions.length === 0) return transactions;

  const dates = transactions.map((tx) => tx.date);
  const minDate = new Date(Math.min(...dates.map((d) => new Date(d).getTime())));
  const maxDate = new Date(Math.max(...dates.map((d) => new Date(d).getTime())));

  const existingTransactions = await Data.find({
    user: userId,
    date: { $gte: minDate, $lte: maxDate },
  }).lean();

  const existingMap = new Map<string, number[]>();
  
  for (const tx of existingTransactions) {
    if (!tx.date) continue;
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
      const valueIndex = valuesOnDate.indexOf(tx.value);
      if (valueIndex !== -1) {
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

export async function saveTransactions(transactions: ITransaction[], userId: string): Promise<void> {
  const Categories = require("../models/Categories").default;
  
  // Find the 'Otros' category for this user
  let defaultCategory = await Categories.findOne({ category: "Otros", user: userId });
  
  // Safety check: if for some reason 'Otros' doesn't exist, use any category or create it
  if (!defaultCategory) {
    defaultCategory = await Categories.findOne({ user: userId }) || await Categories.findOne({ category: "Otros" });
  }

  const defaultCategoryId = defaultCategory?._id;

  const operations = transactions.map((tx) => {
    const cleanedTx = { ...tx };
    
    // Limpieza final de subcategoría redundante
    if (cleanedTx.subcategory && cleanedTx.concept) {
      const c = cleanedTx.concept.toLowerCase();
      const s = cleanedTx.subcategory.toLowerCase();
      if (s === c || c.includes(s) || s.includes(c)) {
        cleanedTx.subcategory = null;
      }
    }

    // If category is empty, null or undefined, use the default one
    if (!cleanedTx.category || cleanedTx.category === "") {
      cleanedTx.category = defaultCategoryId;
    }

    // Strip frontend-only fields that are not in the Mongoose schema
    delete (cleanedTx as any).suggestedCategory;
    delete (cleanedTx as any).suggestedSubcategory;
    delete (cleanedTx as any).isDuplicate; // If present from preview

    return {
      updateOne: {
        filter: { concept: cleanedTx.concept, date: cleanedTx.date, value: cleanedTx.value, user: userId },
        update: { $setOnInsert: { ...cleanedTx, user: userId } },
        upsert: true,
      },
    };
  });

  console.log(`--- SAVING ${operations.length} TRANSACTIONS ---`);
  const summary = operations.slice(0, 5).map(op => ({
    concept: (op.updateOne.filter as any).concept,
    cat: (op.updateOne.update as any).$setOnInsert.category,
    sub: (op.updateOne.update as any).$setOnInsert.subcategory
  }));
  console.log("Muestra de datos a guardar:", summary);
  if (operations.length > 5) console.log(`... y ${operations.length - 5} más.`);
  console.log("------------------------------------------");

  await Data.bulkWrite(operations);
}
