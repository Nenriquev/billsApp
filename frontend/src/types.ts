export interface Category {
  _id: string;
  category: string;
  types: { name: string; entry: string }[];
  subcategories: { name: string; types: string[] }[];
}

export interface Transaction {
  _id: string;
  concept: string;
  date: string;
  value: number;
  category: Category;
  bank: string;
  subcategory?: string | null;
}

export interface ChartDataset {
  legend?: Record<string, unknown>;
  dataset?: { dimensions: string[]; source: Record<string, unknown>[] };
  series: Record<string, unknown>[];
  xAxis: Record<string, unknown>;
  tooltip?: Record<string, unknown>;
  dataZoom?: Record<string, unknown>[];
}

export interface AnalyticsResponse {
  data: ChartDataset;
  total: number;
}

export interface PeriodComparison {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}

export interface CategorySummary {
  categoryId: string;
  category: string;
  total: number;
  count: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  monthIndex: number;
  year: number;
  total: number;
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

export interface ToastState {
  open: boolean;
  msg: string;
  type: "success" | "danger" | null;
}

export interface ModalState {
  transaction: boolean;
}

export interface DropdownOption {
  name: string | number;
  value: string | number;
}
