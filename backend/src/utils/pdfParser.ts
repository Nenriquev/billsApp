import pdfParse from "pdf-parse";
import moment from "moment-timezone";
import Categories from "../models/Categories";
import { ICategory, ITransaction } from "../types";

interface ParsedLine {
  date: Date;
  concept: string;
  value: number;
}

const SKIP_PREFIXES = [
  "titular:",
  "cuenta santander:",
  "saldo:",
  "últimos movimientos",
  "fecha operación",
  "página ",
  "documento impreso",
];

const TWO_AMOUNTS_RE = /^(.*?)\s*(-?\d[\d.]*,\d{2})\s*EUR\s*(\d[\d.]*,?\d{2})\s*EUR\s*$/;
const SINGLE_AMOUNT_RE = /^(.+?)(-\d[\d.,]*)\s*EUR\s*$/;
const DATE_RE = /^(\d{2}\/\d{2}\/\d{4})$/;
const FECHA_VALOR_RE = /^Fecha valor:/;

function shouldSkipLine(line: string): boolean {
  const lower = line.toLowerCase();
  return SKIP_PREFIXES.some((p) => lower.startsWith(p)) || lower.includes("documento impreso");
}

function parseEurAmount(raw: string): number {
  return parseFloat(raw.replace(/\./g, "").replace(",", "."));
}

/* ────── Santander Account (cuenta corriente) ────── */

function parseSantanderAccountText(text: string): ParsedLine[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !shouldSkipLine(l) && !l.startsWith("-- "));

  const transactions: ParsedLine[] = [];
  let i = 0;

  while (i < lines.length) {
    const dateMatch = lines[i].match(DATE_RE);
    if (!dateMatch) {
      i++;
      continue;
    }

    const dateStr = dateMatch[1];
    i++;

    if (i >= lines.length || !FECHA_VALOR_RE.test(lines[i])) continue;
    i++;

    const conceptParts: string[] = [];
    let txAmount: number | null = null;

    while (i < lines.length) {
      if (lines[i].match(DATE_RE)) break;
      if (shouldSkipLine(lines[i]) || lines[i].startsWith("-- ")) {
        i++;
        continue;
      }

      const twoAmountsMatch = lines[i].match(TWO_AMOUNTS_RE);
      if (twoAmountsMatch) {
        const conceptBefore = twoAmountsMatch[1].trim();
        if (conceptBefore) conceptParts.push(conceptBefore);
        txAmount = parseEurAmount(twoAmountsMatch[2]);
        i++;
        break;
      }

      // Fallback: single amount format (e.g. "Dcasa-5,90 EUR")
      const singleAmountMatch = lines[i].match(SINGLE_AMOUNT_RE);
      if (singleAmountMatch) {
        const conceptBefore = singleAmountMatch[1].trim();
        if (conceptBefore) conceptParts.push(conceptBefore);
        txAmount = parseEurAmount(singleAmountMatch[2]);
        i++;
        break;
      }

      conceptParts.push(lines[i]);
      i++;
    }

    if (txAmount === null || isNaN(txAmount)) continue;

    if (txAmount >= 0) continue;

    const fullConcept = conceptParts.join(" ").trim();
    if (!fullConcept) continue;

    const lower = fullConcept.toLowerCase();
    if (lower.includes("tarj.") || lower.includes("tarj :") || lower.includes("tarjetas de credito")) {
      continue;
    }

    transactions.push({
      date: moment.tz(dateStr, "DD/MM/YYYY", "UTC").toDate(),
      concept: fullConcept,
      value: Math.abs(txAmount),
    });
  }

  return transactions;
}

/* ────── Categorization ────── */

function categorizeTransaction(
  concept: string,
  categories: ICategory[]
): { categoryId: string; matchedName: string | null; subcategory: string | null } {
  const lower = concept.toLowerCase();

  for (const cat of categories) {
    for (const type of cat.types) {
      if (lower.includes(type.entry)) {
        let subcategory: string | null = null;
        if (cat.subcategories?.length) {
          const sub = cat.subcategories.find((s) =>
            s.types.some((t) => lower.includes(t.toLowerCase()))
          );
          if (sub) subcategory = sub.name;
        }
        return { categoryId: cat._id.toString(), matchedName: type.name, subcategory };
      }
    }
  }

  return { categoryId: "", matchedName: null, subcategory: null };
}

/* ────── Public API ────── */

const PDF_PARSERS: Record<string, (text: string) => ParsedLine[]> = {
  "santander-cuenta-pdf": parseSantanderAccountText,
};

export async function parsePdfTransactions(
  buffer: Buffer,
  bank: string
): Promise<ITransaction[]> {
  const parserFn = PDF_PARSERS[bank];
  if (!parserFn) {
    throw new Error(`Parser de PDF no disponible para: ${bank}`);
  }

  const result = await pdfParse(buffer);
  const text = result.text;

  const parsed = parserFn(text);

  const categories = (await Categories.find({})) as unknown as ICategory[];
  const defaultCategory = categories.find((c) => c.category === "Otra categoría");
  const defaultCategoryId = defaultCategory?._id.toString() || "";

  return parsed.map((line) => {
    const { categoryId, matchedName, subcategory } = categorizeTransaction(line.concept, categories);

    return {
      concept: matchedName
        ? matchedName.charAt(0).toUpperCase() + matchedName.slice(1)
        : line.concept,
      date: line.date,
      value: line.value,
      category: categoryId || defaultCategoryId,
      bank,
      subcategory,
    };
  });
}
