import mongoose, { Types } from "mongoose";
import Data from "../models/Data";
import Categories from "../models/Categories";
import { AppError, ChartDataset, MonthData } from "../types";
import { colors } from "../data/data";

const MONTHS: string[] = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DEFAULT_COLORS = [
  "#5470C6", "#91CC75", "#EE6666", "#FAC858", "#73C0DE",
  "#3BA272", "#FC8452", "#9A60B4", "#EA7CCC",
];

interface AnalyticsResult {
  data: ChartDataset;
  total: number;
}

function buildStackedBarChart(
  transactions: Array<{ date: Date; value: number; seriesKey: string }>,
  colorMap: Record<string, string> = {}
): ChartDataset {
  const dimensions: string[] = [];
  const monthData: MonthData = {};

  for (const tx of transactions) {
    const month = MONTHS[new Date(tx.date).getMonth()];
    if (!monthData[month]) monthData[month] = {};

    const key = tx.seriesKey;
    monthData[month][key] = (monthData[month][key] || 0) + tx.value;

    if (!dimensions.includes(key)) dimensions.push(key);
  }

  const source: Record<string, unknown>[] = [];
  for (const month of MONTHS) {
    if (!monthData[month] || Object.keys(monthData[month]).length === 0) continue;

    const entry: Record<string, unknown> = { month };
    for (const dim of dimensions) {
      entry[dim] = monthData[month][dim] ?? null;
    }
    source.push(entry);
  }

  return {
    legend: { show: true },
    dataset: { dimensions: ["month", ...dimensions], source },
    series: dimensions.map((dim) => ({
      type: "bar",
      stack: "total",
      color: colorMap[dim] || "",
    })),
    xAxis: { type: "category", data: MONTHS },
  };
}

function buildGroupedBarChart(
  transactions: Array<{ concept: string; value: number }>
): ChartDataset {
  const grouped: Record<string, number> = {};

  for (const tx of transactions) {
    grouped[tx.concept] = (grouped[tx.concept] || 0) + (tx.value ?? 0);
  }

  const concepts = Object.keys(grouped);
  const seriesData = concepts.map((concept, index) => ({
    name: concept,
    value: grouped[concept],
    itemStyle: { color: DEFAULT_COLORS[index % DEFAULT_COLORS.length] },
  }));

  return {
    legend: { show: false },
    xAxis: { type: "category", data: concepts },
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} €",
    },
    dataZoom: [{ type: "slider", show: true, start: 0, end: 100 }],
    series: [{ type: "bar", name: "Gasto", data: seriesData }],
  };
}

function buildInvoiceBarChart(
  transactions: Array<{ date: Date; value: number; concept: string }>
): ChartDataset {
  const dimensions: string[] = ["month"];
  const monthData: MonthData = {};

  for (const tx of transactions) {
    const month = MONTHS[new Date(tx.date).getMonth()];
    if (!monthData[month]) monthData[month] = {};

    const key = tx.concept;
    monthData[month][key] = (monthData[month][key] || 0) + tx.value;

    if (!dimensions.includes(key)) dimensions.push(key);
  }

  const source: Record<string, unknown>[] = [];
  for (const month of MONTHS) {
    if (!monthData[month] || Object.keys(monthData[month]).length === 0) continue;

    const entry: Record<string, unknown> = { month };
    for (const dim of dimensions) {
      if (dim !== "month") entry[dim] = monthData[month][dim] ?? null;
    }
    source.push(entry);
  }

  return {
    legend: { show: true },
    dataset: { dimensions, source },
    series: dimensions
      .filter((d) => d !== "month")
      .map((dim, i) => ({
        type: "bar" as const,
        stack: "total",
        name: dim,
        color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      })),
    xAxis: { type: "category", data: MONTHS },
  };
}

export async function getAnalytics(
  userId: string,
  categoryName: string,
  from: string,
  to: string
): Promise<AnalyticsResult> {
  if (!from || !to) {
    throw new AppError("Los parámetros 'from' y 'to' son obligatorios", 400);
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  const categoryDoc = await Categories.findOne({ 
    category: categoryName,
    $or: [{ user: userId }, { user: { $exists: false } }, { user: null }]
  });

  if (!categoryDoc) {
    throw new AppError(`Categoría '${categoryName}' no encontrada`, 404);
  }

  const query: any = {
    user: userId,
    category: categoryDoc._id,
    date: { $gte: fromDate, $lte: toDate },
  };

  const [transactions, totalAgg] = await Promise.all([
    Data.find(query).populate("category"),
    Data.aggregate([
      { $match: { ...query, user: new Types.ObjectId(userId) } },
      { $group: { _id: "$category", totalValue: { $sum: "$value" } } },
    ]),
  ]);

  const total = totalAgg.length > 0 ? Number(totalAgg[0].totalValue.toFixed(2)) : 0;

  const hasSubcategories = categoryDoc.subcategories && categoryDoc.subcategories.length > 0;
  const isUncategorized = categoryName === "Otra categoría";

  let dataset: ChartDataset;

  if (isUncategorized) {
    dataset = buildGroupedBarChart(
      transactions.map((tx) => ({
        concept: tx.concept as string,
        value: tx.value as number,
      }))
    );
  } else if (hasSubcategories) {
    dataset = buildStackedBarChart(
      transactions.map((tx) => ({
        date: tx.date as Date,
        value: tx.value as number,
        seriesKey: (tx.subcategory as string) || (tx.concept as string),
      })),
      colors
    );
  } else {
    dataset = buildInvoiceBarChart(
      transactions.map((tx) => ({
        date: tx.date as Date,
        value: tx.value as number,
        concept: tx.concept as string,
      }))
    );
  }

  return { data: dataset, total };
}
