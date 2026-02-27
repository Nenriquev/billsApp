import AIProviderModel from "../models/AIProvider";
import { AIProvider, ProviderConfig } from "../types/aiProvider";
import { MistralProvider } from "./aiProviders/mistralProvider";
import { OpenAIProvider } from "./aiProviders/openaiProvider";
import { GeminiProvider } from "./aiProviders/geminiProvider";
import { AnthropicProvider } from "./aiProviders/anthropicProvider";

const PROVIDER_FACTORIES: Record<string, (config: ProviderConfig) => AIProvider> = {
  mistral: (config) => new MistralProvider(config),
  openai: (config) => new OpenAIProvider(config),
  gemini: (config) => new GeminiProvider(config),
  anthropic: (config) => new AnthropicProvider(config),
};

export async function getDefaultProvider(userId: string): Promise<AIProvider | null> {
  const providerDoc = await AIProviderModel.findOne({ user: userId, isDefault: true, enabled: true });
  if (!providerDoc) {
    return null;
  }

  const factory = PROVIDER_FACTORIES[providerDoc.provider];
  if (!factory) {
    console.error(`Proveedor desconocido: ${providerDoc.provider}`);
    return null;
  }

  const config: ProviderConfig = {
    provider: providerDoc.provider as ProviderConfig["provider"],
    name: providerDoc.name,
    apiKey: providerDoc.apiKey,
    model: providerDoc.model || undefined,
    enabled: providerDoc.enabled,
    isDefault: providerDoc.isDefault,
  };

  return factory(config);
}

export async function getAllProviders(userId: string) {
  return AIProviderModel.find({ user: userId }).sort({ createdAt: -1 });
}

export async function getProviderById(id: string, userId: string) {
  return AIProviderModel.findOne({ _id: id, user: userId });
}

export async function createProvider(data: {
  provider: ProviderConfig["provider"];
  name: string;
  apiKey: string;
  model?: string;
  enabled?: boolean;
  isDefault?: boolean;
  userId: string;
}) {
  // Si se marca como default, quitar el default de los demás del mismo usuario
  if (data.isDefault) {
    await AIProviderModel.updateMany({ user: data.userId }, { $set: { isDefault: false } });
  }

  const provider = new AIProviderModel({ ...data, user: data.userId });
  return provider.save();
}

export async function updateProvider(
  id: string,
  userId: string,
  data: Partial<{
    name: string;
    apiKey: string;
    model: string;
    enabled: boolean;
    isDefault: boolean;
  }>
) {
  // Si se marca como default, quitar el default de los demás del mismo usuario
  if (data.isDefault) {
    await AIProviderModel.updateMany({ _id: { $ne: id }, user: userId }, { $set: { isDefault: false } });
  }

  return AIProviderModel.findOneAndUpdate({ _id: id, user: userId }, { $set: data }, { new: true });
}

export async function deleteProvider(id: string, userId: string) {
  return AIProviderModel.findOneAndDelete({ _id: id, user: userId });
}

export async function testProvider(id: string, userId: string) {
  const providerDoc = await AIProviderModel.findOne({ _id: id, user: userId });
  if (!providerDoc) {
    return { valid: false, error: "Proveedor no encontrado." };
  }

  const factory = PROVIDER_FACTORIES[providerDoc.provider];
  if (!factory) {
    return { valid: false, error: `Tipo de proveedor "${providerDoc.provider}" no soportado.` };
  }

  const config: ProviderConfig = {
    provider: providerDoc.provider as ProviderConfig["provider"],
    name: providerDoc.name,
    apiKey: providerDoc.apiKey,
    model: providerDoc.model || undefined,
    enabled: providerDoc.enabled,
    isDefault: providerDoc.isDefault,
  };

  const provider = factory(config);
  return provider.testConnection();
}
