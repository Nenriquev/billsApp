import AIProviderModel from "../models/AIProvider";
import { AIProvider, ProviderConfig } from "../types/aiProvider";
import { MistralProvider } from "./aiProviders/mistralProvider";
import { OpenAIProvider } from "./aiProviders/openaiProvider";

const PROVIDER_FACTORIES: Record<string, (config: ProviderConfig) => AIProvider> = {
  mistral: (config) => new MistralProvider(config),
  openai: (config) => new OpenAIProvider(config),
};

export async function getDefaultProvider(): Promise<AIProvider | null> {
  const providerDoc = await AIProviderModel.findOne({ isDefault: true, enabled: true });
  if (!providerDoc) {
    return null;
  }

  const factory = PROVIDER_FACTORIES[providerDoc.provider];
  if (!factory) {
    console.error(`Proveedor desconocido: ${providerDoc.provider}`);
    return null;
  }

  const config: ProviderConfig = {
    provider: providerDoc.provider as "mistral" | "openai",
    name: providerDoc.name,
    apiKey: providerDoc.apiKey,
    model: providerDoc.model || undefined,
    enabled: providerDoc.enabled,
    isDefault: providerDoc.isDefault,
  };

  return factory(config);
}

export async function getAllProviders() {
  return AIProviderModel.find({}).sort({ createdAt: -1 });
}

export async function getProviderById(id: string) {
  return AIProviderModel.findById(id);
}

export async function createProvider(data: {
  provider: "mistral" | "openai";
  name: string;
  apiKey: string;
  model?: string;
  enabled?: boolean;
  isDefault?: boolean;
}) {
  // Si se marca como default, quitar el default de los demás
  if (data.isDefault) {
    await AIProviderModel.updateMany({}, { $set: { isDefault: false } });
  }

  const provider = new AIProviderModel(data);
  return provider.save();
}

export async function updateProvider(
  id: string,
  data: Partial<{
    name: string;
    apiKey: string;
    model: string;
    enabled: boolean;
    isDefault: boolean;
  }>
) {
  // Si se marca como default, quitar el default de los demás
  if (data.isDefault) {
    await AIProviderModel.updateMany({ _id: { $ne: id } }, { $set: { isDefault: false } });
  }

  return AIProviderModel.findByIdAndUpdate(id, { $set: data }, { new: true });
}

export async function deleteProvider(id: string) {
  return AIProviderModel.findByIdAndDelete(id);
}

export async function testProvider(id: string): Promise<boolean> {
  const providerDoc = await AIProviderModel.findById(id);
  if (!providerDoc) {
    return false;
  }

  const factory = PROVIDER_FACTORIES[providerDoc.provider];
  if (!factory) {
    return false;
  }

  const config: ProviderConfig = {
    provider: providerDoc.provider as "mistral" | "openai",
    name: providerDoc.name,
    apiKey: providerDoc.apiKey,
    model: providerDoc.model || undefined,
    enabled: providerDoc.enabled,
    isDefault: providerDoc.isDefault,
  };

  const provider = factory(config);
  return provider.testConnection();
}
