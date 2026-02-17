import { ITransaction, ICategory } from "../types";
import { AIAnalysisResult } from "../types/aiProvider";
import { getDefaultProvider } from "./aiProviderService";

export async function suggestCategories(
  transactions: ITransaction[],
  existingCategories: ICategory[]
): Promise<AIAnalysisResult> {
  const provider = await getDefaultProvider();
  if (!provider) {
    console.warn("No hay proveedor de IA configurado o habilitado");
    return { suggestedCategories: [], assignedTransactions: [] };
  }

  return provider.suggestCategories(transactions, existingCategories);
}
