import { Request, Response, NextFunction } from "express";
import { AppError } from "../types";
import { processFile, previewFile } from "../services/sheetService";
import { suggestCategories } from "../services/mistralService";
import Categories from "../models/Categories";
import { ICategory } from "../types";

export const uploadSheet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { file, body } = req;
    const userId = (req as any).user.id;

    if (!body.bank) {
      throw new AppError("Debe seleccionar el banco/tipo", 400);
    }

    if (!file) {
      throw new AppError("Debe adjuntar un archivo (Excel o PDF)", 400);
    }

    const result = await processFile(file, body.bank, userId);

    return res.json({
      message: `${result.count} transacciones procesadas exitosamente`,
      count: result.count,
    });
  } catch (error) {
    next(error);
  }
};

export const previewSheet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { file, body } = req;
    const userId = (req as any).user.id;

    if (!body.bank) {
      throw new AppError("Debe seleccionar el banco/tipo", 400);
    }

    if (!file) {
      throw new AppError("Debe adjuntar un archivo (Excel o PDF)", 400);
    }

    // Procesar archivo sin guardar
    const transactions = await previewFile(file, body.bank, userId);

    // Obtener categorías (propias + globales)
    const categories = (await Categories.find({
      $or: [{ user: userId }, { user: { $exists: false } }, { user: null }]
    })) as unknown as ICategory[];

    // Obtener análisis de IA (asignaciones + sugerencias nuevas)
    const analysis = await suggestCategories(transactions, categories);

    // (Logic for applying AI assignments remains same...)
    if (analysis.assignedTransactions && analysis.assignedTransactions.length > 0) {
      const assignmentMap = new Map(
        analysis.assignedTransactions.map((a) => [a.concept, a])
      );

      const suggestionsMap = new Map<string, any>();
      analysis.suggestedCategories.forEach((s) => {
        suggestionsMap.set(s.category, s);
      });

      transactions.forEach((tx) => {
        const assignment = assignmentMap.get(tx.concept);
        if (assignment) {
          const matchedCategory = categories.find(
            (c) => c.category === assignment.category
          );
          if (matchedCategory) {
            tx.category = matchedCategory._id.toString();
            tx.subcategory = assignment.subcategory || null;

            let suggestion = suggestionsMap.get(assignment.category);
            if (!suggestion) {
              suggestion = {
                category: assignment.category,
                description: "Categoría existente identificada",
                transactions: [],
                isExisting: true,
              };
              analysis.suggestedCategories.push(suggestion);
              suggestionsMap.set(assignment.category, suggestion);
            }

            if (!suggestion.transactions.includes(tx.concept)) {
              suggestion.transactions.push(tx.concept);
            }
          } else {
            (tx as any).suggestedCategory = assignment.category;
            if (assignment.subcategory) {
               (tx as any).suggestedSubcategory = assignment.subcategory;
            }

            let suggestion = suggestionsMap.get(assignment.category);
            if (!suggestion) {
              suggestion = {
                category: assignment.category,
                description: "Categoría sugerida basada en análisis de IA",
                transactions: [],
              };
              analysis.suggestedCategories.push(suggestion);
              suggestionsMap.set(assignment.category, suggestion);
            }

            if (!suggestion.transactions.includes(tx.concept)) {
              suggestion.transactions.push(tx.concept);
            }
          }
        }
      });

      analysis.suggestedCategories.forEach((suggestion) => {
        suggestion.transactions.forEach((conceptName) => {
          const tx = transactions.find((t) => t.concept === conceptName);
          if (tx && !tx.category && !((tx as any).suggestedCategory)) {
             (tx as any).suggestedCategory = suggestion.category;
          }
        });
      });
    }

    return res.json({
      transactions,
      categorySuggestions: analysis.suggestedCategories,
    });
  } catch (error) {
    next(error);
  }
};

export const saveSelectedTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { transactions, categoryIds } = req.body;
    const userId = (req as any).user.id;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      throw new AppError("Debe proporcionar al menos una transacción para guardar", 400);
    }

    // Guardar transacciones seleccionadas
    const { saveTransactions } = require("../services/sheetService");
    await saveTransactions(transactions, userId);

    return res.json({
      message: `${transactions.length} transacciones guardadas exitosamente`,
      count: transactions.length,
      categoriesCreated: categoryIds?.length || 0,
    });
  } catch (error) {
    next(error);
  }
};
