import { Request, Response, NextFunction } from "express";
import { getDashboard } from "../services/dashboardService";

export const getDashboardData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
    const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth();
    const userId = (req as any).user.id;

    const data = await getDashboard(year, month, userId);
    return res.json(data);
  } catch (error) {
    next(error);
  }
};
