import Data from "../models/Data";
import Categories from "../models/Categories";
import { AppError, ITransaction } from "../types";
import { Types } from "mongoose";

export async function getAllTransactions(userId: string) {
  return Data.find({ user: userId }).populate("category").sort({ date: -1 });
}

export async function createTransaction(userId: string, data: Partial<ITransaction>) {
  const transaction = new Data({
    ...data,
    user: userId,
    uploadDate: data.uploadDate || new Date(),
  });
  await transaction.save();
  return transaction.populate("category");
}

export async function getAllCategories(userId: string) {
  return Categories.find({ 
    $or: [{ user: userId }, { user: { $exists: false } }, { user: null }] 
  });
}

export async function updateTransactionById(
  id: string,
  userId: string,
  data: Partial<ITransaction>
) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("ID de transacción inválido", 400);
  }

  const updated = await Data.findOneAndUpdate(
    { _id: id, user: userId }, 
    data, 
    { new: true }
  ).populate("category");

  if (!updated) {
    throw new AppError("Transacción no encontrada o no pertenece al usuario", 404);
  }

  return updated;
}

export async function deleteTransactionById(id: string, userId: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("ID de transacción inválido", 400);
  }

  const deleted = await Data.findOneAndDelete({ _id: id, user: userId });

  if (!deleted) {
    throw new AppError("Transacción no encontrada o no pertenece al usuario", 404);
  }

  return deleted;
}
