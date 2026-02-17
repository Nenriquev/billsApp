import moment from "moment-timezone";
import Categories from "../models/Categories";
import { ICategory, ITransaction } from "../types";

interface BankParser {
  getDate(row: Record<string, string>): Date;
  getAmount(row: Record<string, string>): number;
  getConcept(row: Record<string, string>): string;
  isExpense(row: Record<string, string>): boolean;
}

const santanderParser: BankParser = {
  getDate(row) {
    return moment.tz(row["FECHA OPERACIÓN"], "DD/MM/YYYY", "UTC").toDate();
  },
  getAmount(row) {
    return Math.abs(parseFloat(row["IMPORTE EUR"]));
  },
  getConcept(row) {
    return row["CONCEPTO"];
  },
  isExpense(row) {
    return parseFloat(row["IMPORTE EUR"]) < 0;
  },
};

const bbvaParser: BankParser = {
  getDate(row) {
    const fecha = row["Fecha"];
    const numericDate = Number(fecha);

    if (!isNaN(numericDate)) {
      const baseDate = new Date(Date.UTC(1900, 0, 1));
      const days = Math.floor(numericDate) - 2;
      const result = new Date(baseDate.getTime() + days * 86400000);
      result.setUTCHours(0, 0, 0, 0);
      return result;
    }

    const [day, month, year] = fecha.split("/");
    return new Date(`${year}-${month}-${day}`);
  },
  getAmount(row) {
    return Math.abs(parseFloat(row["Importe"]));
  },
  getConcept(row) {
    return row["Concepto"];
  },
  isExpense(row) {
    return parseFloat(row["Importe"]) < 0;
  },
};

const parsers: Record<string, BankParser> = {
  santander: santanderParser,
  bbva: bbvaParser,
};

function categorizeTransaction(
  concept: string,
  categories: ICategory[]
): { categoryId: string; matchedName: string | null; subcategory: string | null } {
  const lowerConcept = concept.toLowerCase();

  for (const cat of categories) {
    for (const type of cat.types) {
      if (lowerConcept.includes(type.entry)) {
        let subcategory: string | null = null;

        if (cat.subcategories?.length) {
          const subMatch = cat.subcategories.find((sub) =>
            sub.types.some((t) => lowerConcept.includes(t.toLowerCase()))
          );
          if (subMatch) subcategory = subMatch.name;
        }

        return {
          categoryId: cat._id.toString(),
          matchedName: type.name,
          subcategory,
        };
      }
    }
  }

  return { categoryId: "", matchedName: null, subcategory: null };
}

export async function parseBankTransactions(
  sheetData: Record<string, string>[],
  bank: "santander" | "bbva"
): Promise<ITransaction[]> {
  const parser = parsers[bank];
  if (!parser) {
    throw new Error(`Parser no disponible para el banco: ${bank}`);
  }

  const categories = await Categories.find({}) as unknown as ICategory[];

  const defaultCategory = categories.find((c) => c.category === "Otros");
  const defaultCategoryId = defaultCategory?._id.toString() || "";

  return sheetData
    .filter((row) => parser.isExpense(row))
    .map((row) => {
      const concept = parser.getConcept(row);
      const { categoryId, matchedName, subcategory } = categorizeTransaction(concept, categories);

      return {
        concept: matchedName
          ? matchedName.charAt(0).toUpperCase() + matchedName.slice(1)
          : concept,
        date: parser.getDate(row),
        value: parser.getAmount(row),
        category: categoryId || defaultCategoryId,
        bank,
        subcategory,
      };
    });
}
