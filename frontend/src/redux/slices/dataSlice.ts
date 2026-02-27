import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AnalyticsResponse, Category, DashboardData, Transaction, AIProvider } from "../../types";
import {
  fetchTransactions,
  fetchCategories,
  fetchAnalytics,
  fetchDashboard,
  updateTransaction,
  createTransaction,
  deleteTransaction,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchAIProviders,
  createAIProvider,
  updateAIProvider,
  deleteAIProvider,
} from "../thunks/dataThunks";

export interface DataState {
  transactions: Transaction[];
  categories: Category[];
  aiProviders: AIProvider[];
  selectedTransaction: Transaction | null;
  analytics: Record<string, AnalyticsResponse>;
  loadingAnalytics: Record<string, boolean>;
  dashboard: DashboardData | null;
  loading: {
    transactions: boolean;
    categories: boolean;
    dashboard: boolean;
    aiProviders: boolean;
  };
  dates: {
    from: string;
    to: string;
  };
  selectedYear: number;
  selectedMonth: number;
  error: string | null;
}

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth();

const initialState: DataState = {
  transactions: [],
  categories: [],
  aiProviders: [],
  selectedTransaction: null,
  analytics: {},
  loadingAnalytics: {},
  dashboard: null,
  loading: {
    transactions: false,
    categories: false,
    dashboard: false,
    aiProviders: false,
  },
  dates: {
    from: new Date(currentYear, 0, 1).toISOString(),
    to: new Date(currentYear, 11, 31).toISOString(),
  },
  selectedYear: currentYear,
  selectedMonth: currentMonth,
  error: null,
};

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    setDates(state, action: PayloadAction<{ from: string; to: string }>) {
      state.dates = action.payload;
    },
    setSelectedTransaction(state, action: PayloadAction<Transaction | null>) {
      state.selectedTransaction = action.payload;
    },
    setSelectedYear(state, action: PayloadAction<number>) {
      state.selectedYear = action.payload;
    },
    setSelectedMonth(state, action: PayloadAction<number>) {
      state.selectedMonth = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    resetData(state) {
      state.transactions = [];
      state.dashboard = null;
      state.analytics = {};
      state.loadingAnalytics = {};
    },
    resetAnalytics(state) {
      state.analytics = {};
      state.loadingAnalytics = {};
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading.transactions = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading.transactions = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading.transactions = false;
        state.error = action.payload || "Error al cargar transacciones";
      })

      .addCase(fetchCategories.pending, (state) => {
        state.loading.categories = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading.categories = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading.categories = false;
        state.error = action.payload || "Error al cargar categorías";
      })

      .addCase(fetchAnalytics.pending, (state, action) => {
        state.loadingAnalytics[action.meta.arg.category] = true;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        const { category, result } = action.payload;
        state.analytics[category] = result;
        state.loadingAnalytics[category] = false;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loadingAnalytics[action.meta.arg.category] = false;
      })

      .addCase(fetchDashboard.pending, (state) => {
        state.loading.dashboard = true;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading.dashboard = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading.dashboard = false;
        state.error = action.payload || "Error al cargar dashboard";
      })

      .addCase(createTransaction.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload);
      })
      
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.transactions.findIndex((t) => t._id === updated._id);
        if (index !== -1) {
          state.transactions[index] = updated;
        }
        state.selectedTransaction = null;
      })

      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter((t) => t._id !== action.payload);
        state.selectedTransaction = null;
      })

      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
        state.categories.sort((a, b) => a.category.localeCompare(b.category));
      })

      .addCase(updateCategory.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.categories.findIndex((c) => c._id === updated._id);
        if (index !== -1) {
          state.categories[index] = updated;
        }
      })

      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter((c) => c._id !== action.payload);
      })

      .addCase(fetchAIProviders.pending, (state) => {
        state.loading.aiProviders = true;
      })
      .addCase(fetchAIProviders.fulfilled, (state, action) => {
        state.loading.aiProviders = false;
        state.aiProviders = action.payload;
      })
      .addCase(fetchAIProviders.rejected, (state) => {
        state.loading.aiProviders = false;
      })

      .addCase(createAIProvider.fulfilled, (state, action) => {
        state.aiProviders.push(action.payload);
      })

      .addCase(updateAIProvider.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.aiProviders.findIndex((p) => p._id === updated._id);
        if (index !== -1) {
          state.aiProviders[index] = updated;
        }
      })

      .addCase(deleteAIProvider.fulfilled, (state, action) => {
        state.aiProviders = state.aiProviders.filter((p) => p._id !== action.payload);
      });
  },
});

export const { setDates, setSelectedTransaction, setSelectedYear, setSelectedMonth, clearError, resetData, resetAnalytics } =
  dataSlice.actions;
export const dataReducer = dataSlice.reducer;
