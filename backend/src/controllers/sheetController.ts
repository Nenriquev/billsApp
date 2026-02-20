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

    // Añadir tempId único para manejo en el frontend
    const previewTransactions = transactions.map((tx, idx) => ({
      ...tx,
      tempId: `tx_${Date.now()}_${idx}`
    }));

    // Obtener categorías (propias + globales)
    const categories = (await Categories.find({
      $or: [{ user: userId }, { user: { $exists: false } }, { user: null }]
    })) as unknown as ICategory[];

    // Obtener análisis de IA (asignaciones + sugerencias nuevas)
    const analysis = await suggestCategories(previewTransactions, categories);

    if (analysis.assignedTransactions && analysis.assignedTransactions.length > 0) {
      const assignedTempIds = new Set<string>();
      
      const suggestionsMap = new Map<string, any>();
      analysis.suggestedCategories.forEach((s) => {
        suggestionsMap.set(s.category, { ...s, transactions: [], tempIds: [] });
      });

      // 1. Procesar asignaciones a categorías EXISTENTES
      analysis.assignedTransactions.forEach((assignment) => {
        // Encontrar la transacción por concepto (limitación: el concepto podría repetirse)
        // Buscamos una que no haya sido asignada aún
        const tx = previewTransactions.find(
          (t) => t.concept === assignment.concept && !assignedTempIds.has(t.tempId!)
        );

        if (tx) {
          const matchedCategory = categories.find((c) => c.category === assignment.category);
          if (matchedCategory) {
            tx.category = matchedCategory._id.toString();
            tx.subcategory = assignment.subcategory || null;
            assignedTempIds.add(tx.tempId!);

            let suggestion = suggestionsMap.get(assignment.category);
            if (!suggestion) {
              suggestion = {
                category: assignment.category,
                description: "Categoría existente identificada",
                transactions: [],
                tempIds: [],
                isExisting: true,
              };
              suggestionsMap.set(assignment.category, suggestion);
            }
            suggestion.transactions.push(tx.concept);
            suggestion.tempIds.push(tx.tempId);
          }
        }
      });

      // 2. Procesar asignaciones a categorías NUEVAS
      analysis.suggestedCategories.forEach((suggestion) => {
        let fullSuggestion = suggestionsMap.get(suggestion.category);
        
        // Verificación extra: ¿Realmente es nueva o la IA se saltó una existente?
        const existingMatch = categories.find(c => 
          c.category.toLowerCase() === suggestion.category.toLowerCase()
        );

        if (existingMatch && fullSuggestion) {
          fullSuggestion.isExisting = true;
          // Actualizamos el nombre al oficial de la DB para evitar discrepancias de mayúsculas
          fullSuggestion.category = existingMatch.category;
          suggestion.category = existingMatch.category;
        }

        suggestion.transactions.forEach((concept) => {
          const tx = previewTransactions.find(
            (t) => t.concept === concept && !assignedTempIds.has(t.tempId!)
          );

          if (tx) {
            // Si existe en la DB, asignamos directamente el ID
            if (existingMatch) {
              tx.category = existingMatch._id.toString();
            } else {
              (tx as any).suggestedCategory = suggestion.category;
            }
            
            assignedTempIds.add(tx.tempId!);
            if (fullSuggestion) {
              fullSuggestion.transactions.push(tx.concept);
              fullSuggestion.tempIds.push(tx.tempId);
            }
          }
        });
      });

      // Actualizar la lista final de sugerencias con las filtradas
      analysis.suggestedCategories = Array.from(suggestionsMap.values()).filter(
        (s) => s.transactions.length > 0
      );
    }

    return res.json({
      transactions: previewTransactions,
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
