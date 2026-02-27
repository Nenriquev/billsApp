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

function cleanConceptText(raw: string): string {
  let c = raw;

  // "Pago Movil En Mcdonalds Glori, Barcelona Es, Tarj. :*484482" → "McDonald's"
  // "Compra En Mercadona S.a. Barcelona" → "Mercadona"
  // "Adeudo Sepa De Netflix" → "Netflix"
  // "Recibo Endesa Energia S.a., Concepto: ..." → "Endesa"
  // "Dia 9997" → "Dia"

  const prefixes = [
    /^pago\s+(?:movil|tarjeta)\s+en\s+/i,
    /^compra\s+en\s+/i,
    /^adeudo\s+sepa\s+de\s+/i,
    /^recibo\s+/i,
    /^pago\s+en\s+/i,
  ];
  for (const re of prefixes) c = c.replace(re, "");

  // Remove trailing location info: ", Barcelona Es, Tarj. :*484482"
  c = c.replace(/,\s*tarj\.?\s*:\s*\*\d+/i, "");
  c = c.replace(/,\s*[a-z\s]+\b(es|esp|españa)\b.*$/i, "");

  // Remove ", Concepto: ..." suffixes
  c = c.replace(/,?\s*concepto:.*$/i, "");

  // Remove S.A., S.L., S.A.U. etc.
  c = c.replace(/\s+s\.?a\.?u?\.?/gi, "").replace(/\s+s\.?l\.?/gi, "");

  // Remove store codes: "Dia 9997" → "Dia", "Lidl 1234" → "Lidl"
  c = c.replace(/\s+\d{3,}$/i, "");

  // Trim and capitalize first letter of each word
  c = c.trim().replace(/\s+/g, " ");
  if (!c) return raw;

  c = c.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

  return c;
}

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

    // ── Server-side pattern matching (deterministic, runs first) ──
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const wordMatch = (text: string, pattern: string): boolean => {
      const re = new RegExp(`(?:^|\\b|\\s)${escapeRegex(pattern.toLowerCase())}(?:\\b|\\s|$)`, "i");
      return re.test(text);
    };

    const matchByPatterns = (concept: string): { category: ICategory; subcategory: string | null } | null => {
      const lower = concept.toLowerCase();
      for (const cat of categories) {
        const catMatch = cat.types.some((t) => wordMatch(lower, t.entry));
        if (catMatch) {
          let subName: string | null = null;
          for (const sub of cat.subcategories) {
            if (sub.types.some((p) => wordMatch(lower, p))) {
              subName = sub.name;
              break;
            }
          }
          return { category: cat, subcategory: subName };
        }
      }
      return null;
    };

    const assignedTempIds = new Set<string>();
    const suggestionsMap = new Map<string, any>();

    // Phase 1: deterministic pattern matching
    const unmatchedTransactions: typeof previewTransactions = [];

    for (const tx of previewTransactions) {
      const match = matchByPatterns(tx.concept);
      if (match) {
        tx.concept = cleanConceptText(tx.concept);
        tx.category = match.category._id.toString();
        tx.subcategory = match.subcategory;
        assignedTempIds.add(tx.tempId!);

        const catName = match.category.category;
        let suggestion = suggestionsMap.get(catName);
        if (!suggestion) {
          suggestion = { category: catName, description: "Pattern match", transactions: [], tempIds: [], isExisting: true };
          suggestionsMap.set(catName, suggestion);
        }
        suggestion.transactions.push(tx.concept);
        suggestion.tempIds.push(tx.tempId);
      } else {
        unmatchedTransactions.push(tx);
      }
    }

    // Phase 2: AI classification for unmatched transactions
    if (unmatchedTransactions.length > 0) {
      const analysis = await suggestCategories(unmatchedTransactions, categories);

      const isValidSubcategory = (concept: string, sub: string | null | undefined) => {
        if (!sub) return false;
        const c = concept.toLowerCase().trim();
        const s = sub.toLowerCase().trim();
        if (s === c || c.includes(s) || s.includes(c)) return false;
        return true;
      };

      // Process AI "assigned" (existing categories) — match by idx
      const aiAssigned = analysis.assignedTransactions || [];
      for (const assignment of aiAssigned as any[]) {
        const idx = assignment.idx;
        if (idx === undefined || idx === null || idx < 0 || idx >= unmatchedTransactions.length) continue;

        const tx = unmatchedTransactions[idx];
        if (!tx || assignedTempIds.has(tx.tempId!)) continue;

        tx.concept = assignment.cleanConcept || cleanConceptText(tx.concept);

        const matchedCategory = categories.find((c) =>
          c.category.toLowerCase() === assignment.category.toLowerCase()
        );

        if (matchedCategory) {
          tx.category = matchedCategory._id.toString();
          tx.subcategory = isValidSubcategory(tx.concept, assignment.subcategory) ? assignment.subcategory : null;
          assignedTempIds.add(tx.tempId!);

          let suggestion = suggestionsMap.get(matchedCategory.category);
          if (!suggestion) {
            suggestion = { category: matchedCategory.category, description: "AI classification", transactions: [], tempIds: [], isExisting: true };
            suggestionsMap.set(matchedCategory.category, suggestion);
          }
          suggestion.transactions.push(tx.concept);
          suggestion.tempIds.push(tx.tempId);
        } else {
          // AI assigned to a category that doesn't exist → treat as new category
          const catName = assignment.category;
          (tx as any).suggestedCategory = catName;
          tx.subcategory = isValidSubcategory(tx.concept, assignment.subcategory) ? assignment.subcategory : null;
          assignedTempIds.add(tx.tempId!);

          let suggestion = suggestionsMap.get(catName);
          if (!suggestion) {
            suggestion = { category: catName, description: "AI suggested", transactions: [], tempIds: [], isExisting: false };
            suggestionsMap.set(catName, suggestion);
          }
          suggestion.transactions.push(tx.concept);
          suggestion.tempIds.push(tx.tempId);
        }
      }

      // Process AI "new_categories" — match by idx
      const aiNewCategories = analysis.suggestedCategories || [];
      for (const suggestion of aiNewCategories as any[]) {
        const existingMatch = categories.find(c =>
          c.category.toLowerCase() === suggestion.category.toLowerCase()
        );

        let fullSuggestion = suggestionsMap.get(suggestion.category);
        if (!fullSuggestion) {
          fullSuggestion = {
            category: suggestion.category,
            description: suggestion.description || "",
            transactions: [],
            tempIds: [],
            isExisting: !!existingMatch,
          };
          suggestionsMap.set(suggestion.category, fullSuggestion);
        }

        if (existingMatch) {
          fullSuggestion.isExisting = true;
          fullSuggestion.category = existingMatch.category;
        }

        const items = suggestion.items || [];
        for (const item of items) {
          const idx = item.idx;
          if (idx === undefined || idx === null || idx < 0 || idx >= unmatchedTransactions.length) continue;

          const tx = unmatchedTransactions[idx];
          if (!tx || assignedTempIds.has(tx.tempId!)) continue;

          tx.concept = item.cleanConcept || cleanConceptText(tx.concept);

          if (existingMatch) {
            tx.category = existingMatch._id.toString();
          } else {
            (tx as any).suggestedCategory = suggestion.category;
          }
          tx.subcategory = isValidSubcategory(tx.concept, item.subcategory) ? item.subcategory : null;

          assignedTempIds.add(tx.tempId!);
          fullSuggestion.transactions.push(tx.concept);
          fullSuggestion.tempIds.push(tx.tempId);
        }
      }
    }

    // Clean up remaining unassigned transaction concepts
    for (const tx of previewTransactions) {
      if (!assignedTempIds.has(tx.tempId!)) {
        tx.concept = cleanConceptText(tx.concept);
      }
    }

    const finalSuggestions = Array.from(suggestionsMap.values()).filter(
      (s) => s.transactions.length > 0
    );

    const patternMatched = previewTransactions.length - unmatchedTransactions.length;
    console.log(`[Preview] Total: ${previewTransactions.length}, Pattern-matched: ${patternMatched}, Sent to AI: ${unmatchedTransactions.length}, Unassigned: ${previewTransactions.length - assignedTempIds.size}`);

    return res.json({
      transactions: previewTransactions,
      categorySuggestions: finalSuggestions,
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
