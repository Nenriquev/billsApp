import { Request, Response, NextFunction } from "express";
import { AppError } from "../types";
import * as aiProviderService from "../services/aiProviderService";

export const getAllProviders = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const providers = await aiProviderService.getAllProviders();
    // No exponer las API keys completas por seguridad
    const safeProviders = providers.map((p) => ({
      _id: p._id,
      provider: p.provider,
      name: p.name,
      model: p.model,
      enabled: p.enabled,
      isDefault: p.isDefault,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      apiKey: p.apiKey ? `${p.apiKey.substring(0, 8)}...` : null, // Solo mostrar primeros caracteres
    }));
    return res.json(safeProviders);
  } catch (error) {
    next(error);
  }
};

export const getProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const provider = await aiProviderService.getProviderById(req.params.id);
    if (!provider) {
      throw new AppError("Proveedor no encontrado", 404);
    }

    // No exponer la API key completa
    const safeProvider = {
      ...provider.toObject(),
      apiKey: provider.apiKey ? `${provider.apiKey.substring(0, 8)}...` : null,
    };

    return res.json(safeProvider);
  } catch (error) {
    next(error);
  }
};

export const createProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { provider, name, apiKey, model, enabled, isDefault } = req.body;

    if (!provider || !name || !apiKey) {
      throw new AppError("provider, name y apiKey son requeridos", 400);
    }

    if (!["mistral", "openai"].includes(provider)) {
      throw new AppError("Proveedor no soportado. Use 'mistral' u 'openai'", 400);
    }

    const newProvider = await aiProviderService.createProvider({
      provider,
      name,
      apiKey,
      model,
      enabled: enabled !== undefined ? enabled : true,
      isDefault: isDefault !== undefined ? isDefault : false,
    });

    const safeProvider = {
      ...newProvider.toObject(),
      apiKey: `${newProvider.apiKey.substring(0, 8)}...`,
    };

    return res.status(201).json(safeProvider);
  } catch (error) {
    next(error);
  }
};

export const updateProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, apiKey, model, enabled, isDefault } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (apiKey !== undefined) updateData.apiKey = apiKey;
    if (model !== undefined) updateData.model = model;
    if (enabled !== undefined) updateData.enabled = enabled;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    const updatedProvider = await aiProviderService.updateProvider(req.params.id, updateData);
    if (!updatedProvider) {
      throw new AppError("Proveedor no encontrado", 404);
    }

    const safeProvider = {
      ...updatedProvider.toObject(),
      apiKey: `${updatedProvider.apiKey.substring(0, 8)}...`,
    };

    return res.json(safeProvider);
  } catch (error) {
    next(error);
  }
};

export const deleteProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const provider = await aiProviderService.deleteProvider(req.params.id);
    if (!provider) {
      throw new AppError("Proveedor no encontrado", 404);
    }

    return res.json({ message: "Proveedor eliminado exitosamente" });
  } catch (error) {
    next(error);
  }
};

export const testProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isValid = await aiProviderService.testProvider(req.params.id);
    return res.json({ valid: isValid });
  } catch (error) {
    next(error);
  }
};
