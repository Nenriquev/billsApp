import Categories from "../models/Categories";
import { AppError, ICategoryType, ISubcategory } from "../types";
import { Types } from "mongoose";

export interface CreateCategoryPayload {
  category: string;
  types: ICategoryType[];
  subcategories?: ISubcategory[];
}

export interface UpdateCategoryPayload {
  category?: string;
  types?: ICategoryType[];
  subcategories?: ISubcategory[];
}

export async function getAllCategories() {
  const categories = await Categories.find({}).sort({ category: 1 });
  
  // Limpieza automática "on-the-fly" de datos antiguos genéricos (Gasto/expense)
  return Promise.all(categories.map(async (cat) => {
    const originalCount = cat.types.length;
    
    // Filtramos asegurando que name y entry existan antes de comparar
    const filteredTypes = cat.types.filter(t => {
      const name = (t.name || "").toLowerCase();
      const entry = (t.entry || "").toLowerCase();
      return name !== "gasto" && entry !== "expense";
    });

    if (originalCount !== filteredTypes.length) {
      cat.types = filteredTypes as any; // Cast controlado para evitar error de DocumentArray
      await cat.save().catch(err => console.error("Error al limpiar categoría persistente:", err));
    }
    
    return cat;
  }));
}

export async function getCategoryById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("ID de categoría inválido", 400);
  }

  const category = await Categories.findById(id);
  if (!category) {
    throw new AppError("Categoría no encontrada", 404);
  }

  return category;
}

export async function createCategory(data: CreateCategoryPayload) {
  if (!data.category?.trim()) {
    throw new AppError("El nombre de la categoría es obligatorio", 400);
  }

  const existing = await Categories.findOne({
    category: { $regex: new RegExp(`^${data.category.trim()}$`, "i") },
  });

  if (existing) {
    throw new AppError(`La categoría '${data.category}' ya existe`, 409);
  }

  // Sanitización proactiva al crear
  const cleanTypes = (data.types || []).filter(t => {
    const name = (t.name || "").toLowerCase();
    const entry = (t.entry || "").toLowerCase();
    return name !== "gasto" && entry !== "expense";
  });

  return Categories.create({
    category: data.category.trim(),
    types: cleanTypes,
    subcategories: data.subcategories || [],
  });
}

export async function updateCategory(id: string, data: UpdateCategoryPayload) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("ID de categoría inválido", 400);
  }

  if (data.category !== undefined && !data.category.trim()) {
    throw new AppError("El nombre de la categoría no puede estar vacío", 400);
  }

  if (data.category) {
    const existing = await Categories.findOne({
      _id: { $ne: id },
      category: { $regex: new RegExp(`^${data.category.trim()}$`, "i") },
    });

    if (existing) {
      throw new AppError(`La categoría '${data.category}' ya existe`, 409);
    }
  }

  const updateData: Record<string, unknown> = {};
  if (data.category !== undefined) updateData.category = data.category.trim();
  if (data.types !== undefined) {
    // Sanitización proactiva al actualizar
    updateData.types = data.types.filter(t => {
      const name = (t.name || "").toLowerCase();
      const entry = (t.entry || "").toLowerCase();
      return name !== "gasto" && entry !== "expense";
    });
  }
  if (data.subcategories !== undefined) updateData.subcategories = data.subcategories;

  const updated = await Categories.findByIdAndUpdate(id, updateData, { new: true });

  if (!updated) {
    throw new AppError("Categoría no encontrada", 404);
  }

  return updated;
}

export async function deleteCategory(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("ID de categoría inválido", 400);
  }

  const deleted = await Categories.findByIdAndDelete(id);

  if (!deleted) {
    throw new AppError("Categoría no encontrada", 404);
  }

  return deleted;
}
