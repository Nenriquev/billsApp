import Data from "../models/Data";
import Categories from "../models/Categories";
import { AppError, ITransaction } from "../types";
import { Types } from "mongoose";

export async function getAllTransactions() {
  return Data.find({}).populate("category").sort({ date: -1 });
}

export async function getAllCategories() {
  return Categories.find({});
}

export async function updateTransactionById(
  id: string,
  data: Partial<ITransaction>
) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("ID de transacción inválido", 400);
  }

  const updated = await Data.findByIdAndUpdate(id, data, { new: true }).populate("category");

  if (!updated) {
    throw new AppError("Transacción no encontrada", 404);
  }

  return updated;
}

export async function deleteTransactionById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("ID de transacción inválido", 400);
  }

  const deleted = await Data.findByIdAndDelete(id);

  if (!deleted) {
    throw new AppError("Transacción no encontrada", 404);
  }

  return deleted;
}
