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

      // Helper para evitar que el nombre del local sea la subcategoría
      const isValidSubcategory = (concept: string, sub: string | null | undefined) => {
        if (!sub) return false;
        const c = concept.toLowerCase().trim();
        const s = sub.toLowerCase().trim();
        // Si la subcategoría es igual al concepto o muy similar, no es válida
        if (s === c || c.includes(s) || s.includes(c)) return false;
        return true;
      };

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
            tx.subcategory = isValidSubcategory(tx.concept, assignment.subcategory) ? assignment.subcategory : null;
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
      analysis.suggestedCategories.forEach((suggestion: any) => {
        let fullSuggestion = suggestionsMap.get(suggestion.category);
        
        // Verificación extra: ¿Realmente es nueva o la IA se saltó una existente?
        const existingMatch = categories.find(c => 
          c.category.toLowerCase() === suggestion.category.toLowerCase()
        );

        if (existingMatch && fullSuggestion) {
          fullSuggestion.isExisting = true;
          fullSuggestion.category = existingMatch.category;
          suggestion.category = existingMatch.category;
        }

        // El AI ahora devuelve 'items' con objetos { concept, subcategory }
        // pero mantenemos compatibilidad por si acaso con 'transactions' como array de strings
        const items = suggestion.items || (suggestion.transactions?.map((t: string) => ({ concept: t, subcategory: null })) || []);

        items.forEach((item: { concept: string, subcategory: string | null }) => {
          const tx = previewTransactions.find(
            (t) => t.concept === item.concept && !assignedTempIds.has(t.tempId!)
          );

          if (tx) {
            if (existingMatch) {
              tx.category = existingMatch._id.toString();
            } else {
              (tx as any).suggestedCategory = suggestion.category;
            }
            tx.subcategory = isValidSubcategory(tx.concept, item.subcategory) ? item.subcategory : null;
            
            assignedTempIds.add(tx.tempId!);
            if (fullSuggestion) {
              // Mantenemos transactions como array de strings para el frontend por consistencia
              if (!fullSuggestion.transactions) fullSuggestion.transactions = [];
              fullSuggestion.transactions.push(tx.concept);
              if (!fullSuggestion.tempIds) fullSuggestion.tempIds = [];
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
    console.log("--- PREVIEW OUTPUT (FRONTEND) ---");
    console.log(`Transacciones totales: ${previewTransactions.length}`);
    console.log(`Sugerencias de categorías: ${analysis.suggestedCategories.length}`);
    console.log("----------------------------------");

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
