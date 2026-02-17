import { Request, Response, NextFunction } from "express";
import { AppError } from "../types";
import { processFile, previewFile } from "../services/sheetService";
import { suggestCategories } from "../services/mistralService";
import Categories from "../models/Categories";
import { ICategory } from "../types";

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

export const previewSheet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { file, body } = req;

    if (!body.bank) {
      throw new AppError("Debe seleccionar el banco/tipo", 400);
    }

    if (!file) {
      throw new AppError("Debe adjuntar un archivo (Excel o PDF)", 400);
    }

    // Procesar archivo sin guardar
    const transactions = await previewFile(file, body.bank);

    // Obtener categorías existentes
    const categories = (await Categories.find({})) as unknown as ICategory[];

    // Obtener análisis de IA (asignaciones + sugerencias nuevas)
    const analysis = await suggestCategories(transactions, categories);

    // Aplicar asignaciones de la IA a las transacciones
    if (analysis.assignedTransactions && analysis.assignedTransactions.length > 0) {
      const assignmentMap = new Map(
        analysis.assignedTransactions.map((a) => [a.concept, a])
      );

      // Crear mapa de sugerencias existentes para actualizar
      const suggestionsMap = new Map<string, any>();
      analysis.suggestedCategories.forEach((s) => {
        suggestionsMap.set(s.category, s);
      });

      transactions.forEach((tx) => {
        const assignment = assignmentMap.get(tx.concept);
        if (assignment) {
          // Buscar la categoría por nombre para obtener su ID
          const matchedCategory = categories.find(
            (c) => c.category === assignment.category
          );
          if (matchedCategory) {
            tx.category = matchedCategory._id.toString();
            tx.subcategory = assignment.subcategory || null;

            // También agregar a la lista de SUGERENCIAS (como existente) para que el usuario pueda validarla
            let suggestion = suggestionsMap.get(assignment.category);
            if (!suggestion) {
              suggestion = {
                category: assignment.category,
                description: "Categoría existente identificada",
                transactions: [],
                isExisting: true, // Flag para indicar que NO se debe crear
              };
              analysis.suggestedCategories.push(suggestion);
              suggestionsMap.set(assignment.category, suggestion);
            }

            // Agregar transacción a la lista
            if (!suggestion.transactions.includes(tx.concept)) {
              suggestion.transactions.push(tx.concept);
            }
          } else {
            // Si la categoría asignada NO existe en la BD:
            
            // 1. Guardar como sugerencia de texto en la transacción
            (tx as any).suggestedCategory = assignment.category;
            if (assignment.subcategory) {
               (tx as any).suggestedSubcategory = assignment.subcategory;
            }

            // 2. Agregar a la lista de SUGERENCIAS para que el usuario pueda crearla
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

            // Agregar transacción a la lista
            if (!suggestion.transactions.includes(tx.concept)) {
              suggestion.transactions.push(tx.concept);
            }
          }
        }
      });

      // PASO ADICIONAL CRÍTICO:
      // Recorrer las sugerencias de categorías NUEVAS para asegurar que las transacciones
      // listadas allí también tengan su 'suggestedCategory' rellenado en la lista principal.
      analysis.suggestedCategories.forEach((suggestion) => {
        suggestion.transactions.forEach((conceptName) => {
          // Buscar la transacción correspondiente por concepto
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

    if (!Array.isArray(transactions) || transactions.length === 0) {
      throw new AppError("Debe proporcionar al menos una transacción para guardar", 400);
    }

    // Guardar transacciones seleccionadas
    const { saveTransactions } = require("../services/sheetService");
    await saveTransactions(transactions);

    return res.json({
      message: `${transactions.length} transacciones guardadas exitosamente`,
      count: transactions.length,
      categoriesCreated: categoryIds?.length || 0,
    });
  } catch (error) {
    next(error);
  }
};
