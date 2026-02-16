import { Request, Response, NextFunction } from "express";
import { getDashboard } from "../services/dashboardService";

export const getDashboardData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = parseInt(req.query.month as string) ?? new Date().getMonth();

    const data = await getDashboard(year, month);
    return res.json(data);
  } catch (error) {
    next(error);
  }
};
