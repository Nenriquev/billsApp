import { Request, Response, NextFunction } from "express";
import * as dataService from "../services/dataService";
import * as analyticsService from "../services/analyticsService";

export const getData = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dataService.getAllTransactions();
    return res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await dataService.getAllCategories();
    return res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await dataService.updateTransactionById(req.params.id, req.body);
    return res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await dataService.deleteTransactionById(req.params.id);
    return res.json({ message: "Transacción eliminada" });
  } catch (error) {
    next(error);
  }
};

export const getAnalyticData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, from, to } = req.query as { category: string; from: string; to: string };
    const result = await analyticsService.getAnalytics(category, from, to);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};
