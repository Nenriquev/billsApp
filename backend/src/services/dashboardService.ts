import Data from "../models/Data";
import Categories from "../models/Categories";
import { Types } from "mongoose";

interface CategorySummary {
  categoryId: string;
  category: string;
  total: number;
  count: number;
  color: string;
}

interface MonthlyTrend {
  month: string;
  monthIndex: number;
  year: number;
  total: number;
}

interface PeriodComparison {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}

export interface DashboardData {
  totalSpent: number;
  transactionCount: number;
  averageTransaction: number;
  categoryBreakdown: CategorySummary[];
  monthlyTrend: MonthlyTrend[];
  vsLastMonth: PeriodComparison;
  vsLastYear: PeriodComparison;
  topExpenses: { concept: string; total: number; count: number }[];
  monthlyByCategory: {
    months: string[];
    series: { name: string; data: number[]; color: string }[];
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  Alquiler: "#6366f1",
  Agua: "#06b6d4",
  Luz: "#f59e0b",
  Gas: "#ef4444",
  Seguro: "#8b5cf6",
  "Teléfono": "#ec4899",
  Entretenimiento: "#10b981",
  Supermercados: "#3b82f6",
  Restaurantes: "#f97316",
  Transporte: "#14b8a6",
  Salud: "#84cc16",
  Educación: "#a855f7",
  Viajes: "#0ea5e9",
  Ropa: "#e879f9",
  Coche: "#fb923c",
  "Ocio": "#22d3ee",
  "Comida": "#f97316",
  "Sin categoría": "#94a3b8",
  "Otra categoría": "#6b7280",
};

// Paleta dinámica para categorías no reconocidas
const COLOR_PALETTE = [
  "#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#14b8a6",
  "#84cc16", "#a855f7", "#0ea5e9", "#e879f9", "#fb923c",
  "#22d3ee", "#4ade80", "#fbbf24", "#f43f5e", "#38bdf8",
];

// Mapa persistente para que la misma categoría siempre tenga el mismo color
const dynamicColorCache: Record<string, string> = {};
let paletteIndex = 0;

function getCategoryColor(catName: string): string {
  if (CATEGORY_COLORS[catName]) return CATEGORY_COLORS[catName];
  if (dynamicColorCache[catName]) return dynamicColorCache[catName];
  const color = COLOR_PALETTE[paletteIndex % COLOR_PALETTE.length];
  paletteIndex++;
  dynamicColorCache[catName] = color;
  return color;
}


const MONTH_NAMES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function getMonthRange(year: number, month: number) {
  const from = new Date(Date.UTC(year, month, 1));
  const to = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
  return { from, to };
}

async function getTotalForPeriod(from: Date, to: Date, userId: string): Promise<number> {
  const result = await Data.aggregate([
    { $match: { 
      user: new Types.ObjectId(userId),
      date: { $gte: from, $lte: to } 
    } },
    { $group: { _id: null, total: { $sum: "$value" } } },
  ]);
  return result.length > 0 ? Number(result[0].total.toFixed(2)) : 0;
}

export async function getDashboard(year: number, month: number, userId: string): Promise<DashboardData> {
  const { from: currentFrom, to: currentTo } = getMonthRange(year, month);

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevMonthYear = month === 0 ? year - 1 : year;
  const { from: prevMonthFrom, to: prevMonthTo } = getMonthRange(prevMonthYear, prevMonth);

  const { from: lastYearFrom, to: lastYearTo } = getMonthRange(year - 1, month);

  const yearFrom = new Date(Date.UTC(year, 0, 1));
  const yearTo = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

  const [
    currentTotal,
    prevMonthTotal,
    lastYearTotal,
    categories,
    categoryBreakdownAgg,
    monthlyTrendAgg,
    topExpensesAgg,
    monthlyCategoryAgg,
  ] = await Promise.all([
    getTotalForPeriod(currentFrom, currentTo, userId),
    getTotalForPeriod(prevMonthFrom, prevMonthTo, userId),
    getTotalForPeriod(lastYearFrom, lastYearTo, userId),
    Categories.find({ user: userId }),
    Data.aggregate([
      { $match: { 
        user: new Types.ObjectId(userId),
        date: { $gte: yearFrom, $lte: yearTo } 
      } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$value" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]),
    Data.aggregate([
      { $match: { 
        user: new Types.ObjectId(userId),
        date: { $gte: yearFrom, $lte: yearTo } 
      } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          total: { $sum: "$value" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]),
    Data.aggregate([
      { $match: { 
        user: new Types.ObjectId(userId),
        date: { $gte: yearFrom, $lte: yearTo } 
      } },
      {
        $group: {
          _id: "$concept",
          total: { $sum: "$value" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]),
    Data.aggregate([
      { $match: { 
        user: new Types.ObjectId(userId),
        date: { $gte: yearFrom, $lte: yearTo } 
      } },
      {
        $group: {
          _id: {
            category: "$category",
            month: { $month: "$date" },
          },
          total: { $sum: "$value" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]),
  ]);

  const sampleTx = await Data.findOne({ user: userId });
  console.log(`--- DASHBOARD DEBUG (User: ${userId}) ---`);
  console.log(`Sample Transaction:`, sampleTx);
  console.log(`Period: ${year}-${month} (from ${currentFrom.toISOString()} to ${currentTo.toISOString()})`);
  console.log(`Year Range: ${yearFrom.toISOString()} to ${yearTo.toISOString()}`);
  console.log(`Current Total: ${currentTotal}`);
  console.log(`Year Total Agg (Categories): ${categoryBreakdownAgg.length}`);
  console.log("-----------------------------------------");

  const catMap = new Map(categories.map((c: any) => [c._id.toString(), c.category]));

  const categoryBreakdown: CategorySummary[] = categoryBreakdownAgg
    .filter(item => item.total > 0) // Evitar mostrar categorías vacías
    .map((item) => {
      const catName = catMap.get(item._id?.toString()) || "Sin categoría";
      return {
        categoryId: item._id?.toString() || "",
        category: catName,
        total: Number(item.total.toFixed(2)),
        count: item.count,
        color: getCategoryColor(catName),
      };
    });

  const yearTotal = categoryBreakdown.reduce((sum, c) => sum + c.total, 0);
  const yearCount = categoryBreakdown.reduce((sum, c) => sum + c.count, 0);

  const monthlyTrend: MonthlyTrend[] = [];
  for (let m = 0; m < 12; m++) {
    const found = monthlyTrendAgg.find(
      (item) => item._id.month === m + 1 && item._id.year === year
    );
    monthlyTrend.push({
      month: MONTH_NAMES[m],
      monthIndex: m,
      year,
      total: found ? Number(found.total.toFixed(2)) : 0,
    });
  }

  const monthChange = currentTotal - prevMonthTotal;
  const monthChangePercent = prevMonthTotal > 0
    ? Number(((monthChange / prevMonthTotal) * 100).toFixed(1))
    : 0;

  const yearChange = currentTotal - lastYearTotal;
  const yearChangePercent = lastYearTotal > 0
    ? Number(((yearChange / lastYearTotal) * 100).toFixed(1))
    : 0;

  const monthlyCategoryMap: Record<string, number[]> = {};
  for (const item of monthlyCategoryAgg) {
    const catName = catMap.get(item._id.category?.toString()) || "Sin categoría";
    if (!monthlyCategoryMap[catName]) {
      monthlyCategoryMap[catName] = new Array(12).fill(0);
    }
    monthlyCategoryMap[catName][item._id.month - 1] = Number(item.total.toFixed(2));
  }

  const usedMonths: string[] = [];
  for (let m = 0; m <= month; m++) {
    usedMonths.push(MONTH_NAMES[m]);
  }

  const monthlyByCategory = {
    months: usedMonths,
    series: Object.entries(monthlyCategoryMap)
      .map(([name, data]) => ({
        name,
        data: data.slice(0, month + 1),
        color: getCategoryColor(name),
      }))
      .filter((s) => s.data.some(val => val > 0)) // Solo mostrar si hay algún valor > 0
      .sort((a, b) => {
        const sumA = a.data.reduce((s, v) => s + v, 0);
        const sumB = b.data.reduce((s, v) => s + v, 0);
        return sumB - sumA;
      }),
  };

  return {
    totalSpent: Number(yearTotal.toFixed(2)),
    transactionCount: yearCount,
    averageTransaction: yearCount > 0 ? Number((yearTotal / yearCount).toFixed(2)) : 0,
    categoryBreakdown,
    monthlyTrend,
    vsLastMonth: {
      current: currentTotal,
      previous: prevMonthTotal,
      change: Number(monthChange.toFixed(2)),
      changePercent: monthChangePercent,
    },
    vsLastYear: {
      current: currentTotal,
      previous: lastYearTotal,
      change: Number(yearChange.toFixed(2)),
      changePercent: yearChangePercent,
    },
    topExpenses: topExpensesAgg.map((item) => ({
      concept: item._id,
      total: Number(item.total.toFixed(2)),
      count: item.count,
    })),
    monthlyByCategory,
  };
}
