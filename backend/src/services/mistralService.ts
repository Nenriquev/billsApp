import { ITransaction, ICategory } from "../types";
import { AIAnalysisResult } from "../types/aiProvider";
import { getDefaultProvider } from "./aiProviderService";

export async function suggestCategories(
  transactions: ITransaction[],
  existingCategories: ICategory[],
  userId: string
): Promise<AIAnalysisResult> {
  const provider = await getDefaultProvider(userId);
  if (!provider) {
    console.warn("No hay proveedor de IA configurado o habilitado");
    return { suggestedCategories: [], assignedTransactions: [] };
  }

  return provider.suggestCategories(transactions, existingCategories);
}
