import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider, AIAnalysisResult, ProviderConfig } from "../../types/aiProvider";
import { ITransaction, ICategory } from "../../types";

export class GeminiProvider implements AIProvider {
  name = "Gemini";
  private client: GoogleGenerativeAI | null = null;
  private config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
    if (config.apiKey) {
      this.client = new GoogleGenerativeAI(config.apiKey);
    }
  }

  async suggestCategories(
    transactions: ITransaction[],
    existingCategories: ICategory[]
  ): Promise<AIAnalysisResult> {
    if (!this.client) {
      console.warn("Gemini: Cliente no inicializado");
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
   - Endesa, Iberdrola, Naturgy → electricity/energy
   - Mercadona, Lidl, Carrefour, Dia → supermarkets
   - Vodafone, Movistar, Orange → telecom
   - Netflix, Spotify, HBO → subscriptions
   - Bizum, Transferencia → personal transfers

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
      const model = this.client.getGenerativeModel({
        model: this.config.model || "gemini-2.5-flash",
      });

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        systemInstruction: "You are an expert financial assistant specialized in classifying bank transactions. Always respond with valid JSON only. No markdown, no explanation.",
        generationConfig: { temperature: 0.1 },
      });

      const responseContent = result.response.text();

      if (!responseContent) {
        return { suggestedCategories: [], assignedTransactions: [] };
      }

      let parsed: { assigned?: any[]; new_categories?: any[] };
      try {
        const cleaned = responseContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        parsed = JSON.parse(cleaned);
        console.log("--- AI RESPONSE (GEMINI) ---");
        console.log(JSON.stringify(parsed, null, 2));
        console.log("----------------------------");
      } catch (e) {
        console.error("Error parseando respuesta de Gemini:", e);
        return { suggestedCategories: [], assignedTransactions: [] };
      }

      return {
        assignedTransactions: parsed.assigned || [],
        suggestedCategories: parsed.new_categories || [],
      };
    } catch (error: any) {
      console.error("Error llamando a Gemini:", error?.message || error);
      return { suggestedCategories: [], assignedTransactions: [] };
    }
  }

  async testConnection() {
    if (!this.client) return { valid: false, error: "Cliente no inicializado. Verifica la API Key." };
    try {
      const model = this.client.getGenerativeModel({
        model: this.config.model || "gemini-2.5-flash",
      });
      await model.generateContent("Responde OK");
      return { valid: true };
    } catch (error: any) {
      const msg = error?.message || "";
      const status = error?.status || error?.httpStatusCode;
      console.error("[Gemini Test] Status:", status, "Message:", msg);

      if (status === 400 && msg.includes("API_KEY_INVALID")) {
        return { valid: false, error: "API Key inválida. Verifica que sea correcta." };
      }
      if (status === 403) {
        return { valid: false, error: "Acceso denegado. Verifica que la API 'Generative Language' esté habilitada en tu proyecto de Google Cloud." };
      }
      if (status === 404 || msg.includes("not found")) {
        return { valid: false, error: `Modelo "${this.config.model || "gemini-2.5-flash"}" no disponible. Prueba con otro modelo.` };
      }
      if (status === 429) {
        return { valid: false, error: "Límite de peticiones excedido. Espera un momento e intenta de nuevo." };
      }
      return { valid: false, error: msg || "Error desconocido al conectar con Gemini." };
    }
  }
}
