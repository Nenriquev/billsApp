import { Request, Response, NextFunction } from "express";
import { AppError } from "../types";
import { processFile } from "../services/sheetService";

export const uploadSheet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { file, body } = req;

    if (!body.bank) {
      throw new AppError("Debe seleccionar el banco/tipo", 400);
    }

    if (!file) {
      throw new AppError("Debe adjuntar un archivo (Excel o PDF)", 400);
    }

    const result = await processFile(file, body.bank);

    return res.json({
      message: `${result.count} transacciones procesadas exitosamente`,
      count: result.count,
    });
  } catch (error) {
    next(error);
  }
};
