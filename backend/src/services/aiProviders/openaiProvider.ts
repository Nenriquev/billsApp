import OpenAI from "openai";
import { AIProvider, AIAnalysisResult, ProviderConfig } from "../../types/aiProvider";
import { ITransaction, ICategory } from "../../types";

export class OpenAIProvider implements AIProvider {
  name = "OpenAI";
  private client: OpenAI | null = null;
  private config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
    if (config.apiKey) {
      this.client = new OpenAI({
        apiKey: config.apiKey,
      });
    }
  }

  async suggestCategories(
    transactions: ITransaction[],
    existingCategories: ICategory[]
  ): Promise<AIAnalysisResult> {
    if (!this.client) {
      console.warn("OpenAI: Cliente no inicializado");
      return { suggestedCategories: [], assignedTransactions: [] };
    }

    const transactionsSummary = transactions.slice(0, 50).map((tx) => ({
      concept: tx.concept,
      value: tx.value,
    }));

    const simplifiedCategories = existingCategories.map((c) => ({
      category: c.category,
      subcategories: c.subcategories.map((s) => s.name),
    }));

    const prompt = `Actúa como un analista financiero experto. Tu tarea es organizar TODAS las transacciones bancarias proporcionadas.

CONTEXTO:
Aquí están las CATEGORÍAS EXISTENTES del usuario:
${JSON.stringify(simplifiedCategories, null, 2)}

Aquí están las NUEVAS TRANSACCIONES a organizar (${transactionsSummary.length} en total):
${JSON.stringify(transactionsSummary, null, 2)}

INSTRUCCIONES CRÍTICAS:
1. Debes clasificar TODAS Y CADA UNA de las ${transactionsSummary.length} transacciones. No puedes dejar ninguna sin asignar.
2. Para cada transacción:
   - Primero, busca una coincidencia lógica en "CATEGORÍAS EXISTENTES".
   - Si existe una coincidencia clara, agrégala a la lista "assigned".
   - Si NO existe ninguna categoría adecuada, debes sugerir una "NUEVA CATEGORÍA" y agregar la transacción a la lista "new_categories" bajo esa sugerencia.
3. Puedes agrupar múltiples transacciones bajo una misma "Nueva Categoría".
4. El output debe ser estrictamente JSON válido.

FORMATO DE RESPUESTA JSON:
{
  "assigned": [
    { "concept": "Concepto exacto", "category": "Categoría existente", "subcategory": "Subcategoría o null" }
  ],
  "new_categories": [
    {
      "category": "Nombre Nueva Categoría",
      "description": "Razón de la sugerencia",
      "transactions": ["concepto exacto 1", "concepto exacto 2"]
    }
  ]
}`;

    try {
      const model = this.config.model || "gpt-4o-mini";
      const completion = await this.client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: "Eres un asistente financiero experto. Responde siempre con JSON válido." },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        return { suggestedCategories: [], assignedTransactions: [] };
      }

      let parsed: { assigned?: any[]; new_categories?: any[] };
      try {
        parsed = JSON.parse(responseContent);
      } catch (e) {
        console.error("Error parseando respuesta de OpenAI:", e);
        return { suggestedCategories: [], assignedTransactions: [] };
      }

      return {
        assignedTransactions: parsed.assigned || [],
        suggestedCategories: parsed.new_categories || [],
      };
    } catch (error: any) {
      console.error("Error llamando a OpenAI:", error?.message || error);
      return { suggestedCategories: [], assignedTransactions: [] };
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.client) return false;
    try {
      await this.client.chat.completions.create({
        model: this.config.model || "gpt-4o-mini",
        messages: [{ role: "user", content: "test" }],
        max_tokens: 5,
      });
      return true;
    } catch (error: any) {
      if (error?.status === 401) {
        return false; // API key inválida
      }
      return true; // Otros errores pueden ser temporales
    }
  }
}
