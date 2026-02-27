import { Request, Response, NextFunction } from "express";
import { AppError } from "../types";
import * as aiProviderService from "../services/aiProviderService";

export const getAllProviders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const providers = await aiProviderService.getAllProviders(userId);
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
      apiKey: p.apiKey ? `${p.apiKey.substring(0, 8)}...` : null,
    }));
    return res.json(safeProviders);
  } catch (error) {
    next(error);
  }
};

export const getProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const provider = await aiProviderService.getProviderById(req.params.id, userId);
    if (!provider) {
      throw new AppError("Proveedor no encontrado", 404);
    }

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
    const userId = (req as any).user.id;
    const { provider, name, apiKey, model, enabled, isDefault } = req.body;

    if (!provider || !name || !apiKey) {
      throw new AppError("provider, name y apiKey son requeridos", 400);
    }

    if (!["mistral", "openai", "gemini", "anthropic"].includes(provider)) {
      throw new AppError("Proveedor no soportado. Use 'mistral', 'openai', 'gemini' o 'anthropic'", 400);
    }

    const newProvider = await aiProviderService.createProvider({
      provider,
      name,
      apiKey,
      model,
      enabled: enabled !== undefined ? enabled : true,
      isDefault: isDefault !== undefined ? isDefault : false,
      userId,
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
    const userId = (req as any).user.id;
    const { name, apiKey, model, enabled, isDefault } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (apiKey !== undefined) updateData.apiKey = apiKey;
    if (model !== undefined) updateData.model = model;
    if (enabled !== undefined) updateData.enabled = enabled;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    const updatedProvider = await aiProviderService.updateProvider(req.params.id, userId, updateData);
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
    const userId = (req as any).user.id;
    const provider = await aiProviderService.deleteProvider(req.params.id, userId);
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
    const userId = (req as any).user.id;
    const result = await aiProviderService.testProvider(req.params.id, userId);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};
