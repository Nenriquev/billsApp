import { Request, Response, NextFunction } from "express";
import * as dataService from "../services/dataService";
import * as analyticsService from "../services/analyticsService";

export const getData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const data = await dataService.getAllTransactions(userId);
    return res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const categories = await dataService.getAllCategories(userId);
    return res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const updated = await dataService.updateTransactionById(req.params.id, userId, req.body);
    return res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    await dataService.deleteTransactionById(req.params.id, userId);
    return res.json({ message: "Transacción eliminada" });
  } catch (error) {
    next(error);
  }
};

export const getAnalyticData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { category, from, to } = req.query as { category: string; from: string; to: string };
    const result = await analyticsService.getAnalytics(userId, category, from, to);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};
