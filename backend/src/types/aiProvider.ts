import { ITransaction, ICategory } from "./index";

export interface CategorySuggestion {
  category: string;
  description: string;
  transactions: string[];
}

export interface TransactionAssignment {
  concept: string;
  category: string;
  subcategory?: string | null;
}

export interface AIAnalysisResult {
  suggestedCategories: CategorySuggestion[];
  assignedTransactions: TransactionAssignment[];
}

export interface TestConnectionResult {
  valid: boolean;
  error?: string;
}

export interface AIProvider {
  name: string;
  suggestCategories(transactions: ITransaction[], existingCategories: ICategory[]): Promise<AIAnalysisResult>;
  testConnection(): Promise<TestConnectionResult>;
}

export interface ProviderConfig {
  provider: "mistral" | "openai" | "gemini" | "anthropic";
  name: string;
  apiKey: string;
  model?: string;
  enabled: boolean;
  isDefault?: boolean;
}
