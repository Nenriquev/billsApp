import Anthropic from "@anthropic-ai/sdk";
import { AIProvider, AIAnalysisResult, ProviderConfig } from "../../types/aiProvider";
import { ITransaction, ICategory } from "../../types";

export class AnthropicProvider implements AIProvider {
  name = "Anthropic";
  private client: Anthropic | null = null;
  private config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
    if (config.apiKey) {
      this.client = new Anthropic({ apiKey: config.apiKey });
    }
  }

  async suggestCategories(
    transactions: ITransaction[],
    existingCategories: ICategory[]
  ): Promise<AIAnalysisResult> {
    if (!this.client) {
      console.warn("Anthropic: Cliente no inicializado");
      return { suggestedCategories: [], assignedTransactions: [] };
    }

    const transactionsSummary = transactions.slice(0, 50).map((tx, idx) => ({
      idx,
      concept: tx.concept,
      value: tx.value,
    }));

    const simplifiedCategories = existingCategories.map((c) => ({
      category: c.category,
      patterns: c.types.map((t) => t.entry),
      subcategories: c.subcategories.map((s) => ({
        name: s.name,
        patterns: s.types,
      })),
    }));

    const prompt = `You are an expert financial analyst specializing in Spanish banking. Classify ALL transactions and clean their concept names.

EXISTING CATEGORIES:
${JSON.stringify(simplifiedCategories, null, 2)}

TRANSACTIONS (each has a unique "idx"):
${JSON.stringify(transactionsSummary, null, 2)}

INSTRUCTIONS:

1. CONCEPT CLEANING — "cleanConcept" field:
   Extract ONLY the recognizable brand/person name from raw bank text.
   - "Pago Movil En Mcdonalds Glori, Barcelona Es, Tarj. :*484482" → "McDonald's"
   - "Dia 9997" → "Dia"
   - "Recibo Endesa Energia S.a., Concepto: Endesa Energia S.a. Factura De Electricidad..." → "Endesa"
   - "Bizum A Favor De Maria Garcia Concepto: Sin Concepto" → "Bizum a Maria Garcia"
   - "Adeudo Sepa De Netflix" → "Netflix"

2. CLASSIFICATION — Use your knowledge of Spanish businesses:
   - Endesa, Iberdrola, Naturgy, etc. → electricity/energy
   - Mercadona, Lidl, Carrefour, Dia, etc. → supermarkets
   - Vodafone, Movistar, Orange, etc. → telecom
   - Netflix, Spotify, HBO, etc. → subscriptions
   - Bizum, Transferencia, etc. → personal transfers

   Priority:
   a. If concept matches a pattern in existing categories → put in "assigned"
   b. If concept SEMANTICALLY fits an existing category (by name/subcategories meaning) even without pattern → put in "assigned"
   c. If NO existing category fits → create a NEW descriptive category in "new_categories"
   d. NEVER use "Otros" or generic names. Be specific: "Suministros", "Transferencias", etc.

3. SUBCATEGORIES: Must be generic groups (Restaurantes, Supermercados, Electricidad, Transporte), never business names.

4. You MUST classify EVERY transaction. Return ALL ${transactionsSummary.length} idx values across assigned + new_categories.

RESPONSE FORMAT (strict JSON) — use "idx" to identify transactions, NOT the concept string:
{
  "assigned": [
    { "idx": 0, "cleanConcept": "Brand Name", "category": "Existing category name", "subcategory": "Group or null" }
  ],
  "new_categories": [
    {
      "category": "Descriptive Name",
      "description": "Reason",
      "items": [
        { "idx": 1, "cleanConcept": "Brand Name", "subcategory": "Group or null" }
      ]
    }
  ]
}`;

    try {
      const model = this.config.model || "claude-sonnet-4-20250514";
      const message = await this.client.messages.create({
        model,
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
        system: "You are an expert financial assistant specialized in classifying bank transactions. Always respond with valid JSON only. No markdown, no explanation.",
        temperature: 0.1,
      });

      const textBlock = message.content.find((b): b is Anthropic.TextBlock => b.type === "text");
      const responseContent = textBlock?.text || "";

      if (!responseContent) {
        return { suggestedCategories: [], assignedTransactions: [] };
      }

      let parsed: { assigned?: any[]; new_categories?: any[] };
      try {
        parsed = JSON.parse(responseContent);
        console.log("--- AI RESPONSE (ANTHROPIC) ---");
        console.log(JSON.stringify(parsed, null, 2));
        console.log("-------------------------------");
      } catch (e) {
        console.error("Error parseando respuesta de Anthropic:", e);
        return { suggestedCategories: [], assignedTransactions: [] };
      }

      return {
        assignedTransactions: parsed.assigned || [],
        suggestedCategories: parsed.new_categories || [],
      };
    } catch (error: any) {
      console.error("Error llamando a Anthropic:", error?.message || error);
      return { suggestedCategories: [], assignedTransactions: [] };
    }
  }

  async testConnection() {
    if (!this.client) return { valid: false, error: "Cliente no inicializado. Verifica la API Key." };
    try {
      await this.client.messages.create({
        model: this.config.model || "claude-sonnet-4-20250514",
        max_tokens: 10,
        messages: [{ role: "user", content: "Responde OK" }],
      });
      return { valid: true };
    } catch (error: any) {
      const status = error?.status;
      const msg = error?.message || "";
      console.error("[Anthropic Test] Status:", status, "Message:", msg);

      if (status === 401) {
        return { valid: false, error: "API Key inválida. Verifica que sea correcta." };
      }
      if (status === 403) {
        return { valid: false, error: "Acceso denegado. Tu API Key no tiene permisos suficientes." };
      }
      if (status === 404) {
        return { valid: false, error: `Modelo "${this.config.model || "claude-sonnet-4-20250514"}" no disponible. Prueba con otro modelo.` };
      }
      if (status === 429) {
        return { valid: false, error: "Límite de peticiones excedido. Espera un momento e intenta de nuevo." };
      }
      return { valid: false, error: msg || "Error desconocido al conectar con Anthropic." };
    }
  }
}
