import { Types } from "mongoose";

export interface ITransaction {
  concept: string;
  date: Date;
  value: number;
  category: Types.ObjectId | string | null;
  bank: string;
  subcategory?: string | null;
}

export interface ICategoryType {
  name: string;
  entry: string;
}

export interface ISubcategory {
  name: string;
  types: string[];
}

export interface ICategory {
  _id: Types.ObjectId;
  types: ICategoryType[];
  category: string;
  subcategories: ISubcategory[];
}

export interface AnalyticsQuery {
  category: string;
  from: string;
  to: string;
}

export interface MonthData {
  [month: string]: { [seriesName: string]: number };
}

export interface ChartDataset {
  legend?: { show: boolean; type?: string; orient?: string; top?: number; data?: string[] };
  dataset?: { dimensions: string[]; source: Record<string, unknown>[] };
  series: Record<string, unknown>[];
  xAxis: { type: string; data: string[] };
  tooltip?: Record<string, unknown>;
  dataZoom?: Record<string, unknown>[];
}

export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}
