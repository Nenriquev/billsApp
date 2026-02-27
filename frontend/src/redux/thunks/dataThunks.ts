import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { api } from "../../axios/axios";
import { AnalyticsResponse, Category, DashboardData, Transaction, PreviewTransaction, CategorySuggestion, AIProvider } from "../../types";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.response?.data?.message || error.message;
  }
  if (error instanceof Error) return error.message;
  return "Error desconocido";
}

export const fetchTransactions = createAsyncThunk<Transaction[], void, { rejectValue: string }>(
  "data/fetchTransactions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Transaction[]>("/data");
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchCategories = createAsyncThunk<Category[], void, { rejectValue: string }>(
  "data/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Category[]>("/data/categories");
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchAnalytics = createAsyncThunk<
  { category: string; result: AnalyticsResponse },
  { category: string; from: string; to: string },
  { rejectValue: string }
>(
  "data/fetchAnalytics",
  async ({ category, from, to }, { rejectWithValue }) => {
    try {
      const response = await api.get<AnalyticsResponse>("/data/analytics", {
        params: { category, from, to },
      });
      return { category, result: response.data };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchDashboard = createAsyncThunk<
  DashboardData,
  { year: number; month: number },
  { rejectValue: string }
>(
  "data/fetchDashboard",
  async ({ year, month }, { rejectWithValue }) => {
    try {
      const response = await api.get<DashboardData>("/dashboard", {
        params: { year, month },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createTransaction = createAsyncThunk<
  Transaction,
  Omit<Transaction, "_id">,
  { rejectValue: string }
>(
  "data/createTransaction",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post<Transaction>("/data", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateTransaction = createAsyncThunk<
  Transaction,
  { id: string; data: Partial<Transaction> },
  { rejectValue: string }
>(
  "data/updateTransaction",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch<Transaction>(`/data/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteTransaction = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "data/deleteTransaction",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/data/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const uploadSheet = createAsyncThunk<
  { message: string; count: number },
  FormData,
  { rejectValue: string }
>(
  "data/uploadSheet",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/sheets/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const previewSheet = createAsyncThunk<
  { transactions: PreviewTransaction[]; categorySuggestions: CategorySuggestion[] },
  FormData,
  { rejectValue: string }
>(
  "data/previewSheet",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post<{ transactions: PreviewTransaction[]; categorySuggestions: CategorySuggestion[] }>(
        "/sheets/preview",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const saveSelectedTransactions = createAsyncThunk<
  { message: string; count: number; categoriesCreated: number },
  { transactions: PreviewTransaction[]; categoryIds: string[] },
  { rejectValue: string }
>(
  "data/saveSelectedTransactions",
  async ({ transactions, categoryIds }, { rejectWithValue }) => {
    try {
      const response = await api.post("/sheets/save-selected", {
        transactions,
        categoryIds,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createCategory = createAsyncThunk<
  Category,
  Omit<Category, "_id">,
  { rejectValue: string }
>(
  "data/createCategory",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post<Category>("/categories", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateCategory = createAsyncThunk<
  Category,
  { id: string; data: Partial<Category> },
  { rejectValue: string }
>(
  "data/updateCategory",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put<Category>(`/categories/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteCategory = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "data/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchAIProviders = createAsyncThunk<
  AIProvider[],
  void,
  { rejectValue: string }
>(
  "data/fetchAIProviders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<AIProvider[]>("/ai-providers");
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createAIProvider = createAsyncThunk<
  AIProvider,
  { provider: "mistral" | "openai" | "gemini" | "anthropic"; name: string; apiKey: string; model?: string; enabled?: boolean; isDefault?: boolean },
  { rejectValue: string }
>(
  "data/createAIProvider",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post<AIProvider>("/ai-providers", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateAIProvider = createAsyncThunk<
  AIProvider,
  { id: string; data: Partial<AIProvider> },
  { rejectValue: string }
>(
  "data/updateAIProvider",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put<AIProvider>(`/ai-providers/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteAIProvider = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "data/deleteAIProvider",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/ai-providers/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const testAIProvider = createAsyncThunk<
  { valid: boolean; error?: string },
  string,
  { rejectValue: string }
>(
  "data/testAIProvider",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post<{ valid: boolean; error?: string }>(`/ai-providers/${id}/test`);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);
