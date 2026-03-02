export interface CategoryTypeEntry {
  name: string;
  entry: string;
}

export interface SubcategoryEntry {
  name: string;
  types: string[];
}

export interface Category {
  _id: string;
  category: string;
  types: CategoryTypeEntry[];
  subcategories: SubcategoryEntry[];
}

export interface Transaction {
  _id: string;
  concept: string;
  date: string;
  value: number;
  category?: Category | null;
  bank: string;
  subcategory?: string | null;
  uploadDate?: string;
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

export interface PreviewTransaction {
  tempId?: string; // ID temporal para el frontend
  concept: string;
  date: string;
  value: number;
  category?: string; // Ahora es opcional
  suggestedCategory?: string;
  bank: string;
  subcategory?: string | null;
}

export interface CategorySuggestion {
  category: string;
  description: string;
  transactions: string[];
  tempIds?: string[]; // IDs temporales de las transacciones agrupadas
  isExisting?: boolean;
}

export interface AIProvider {
  _id: string;
  provider: "mistral" | "openai" | "gemini" | "anthropic";
  name: string;
  model?: string | null;
  enabled: boolean;
  isDefault: boolean;
  apiKey?: string; // Solo primeros caracteres cuando viene del backend
  createdAt?: string;
  updatedAt?: string;
}
