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

export async function getAllCategories(userId: string) {
  // Show strictly only the user's own categories
  const categories = await Categories.find({
    user: userId
  }).sort({ category: 1 });
  
  // Limpieza automática “on-the-fly” de categorías del usuario
  return Promise.all(categories.map(async (cat) => {
    let needsSave = false;
    
    // 1. Limpiar tipos genéricos antiguos
    const filteredTypes = cat.types.filter(t => {
      const name = (t.name || "").toLowerCase();
      const entry = (t.entry || "").toLowerCase();
      return name !== "gasto" && entry !== "expense" && name.trim() !== "";
    });
    if (cat.types.length !== filteredTypes.length) {
      cat.types = filteredTypes as any;
      needsSave = true;
    }

    // 2. Limpiar subcategorías redundantes y agrupar en genéricas
    if (cat.subcategories && cat.subcategories.length > 0) {
      const finalSubs: ISubcategory[] = [];
      const restaurantAliases = ["restaurantes", "restaurante", "comida", "dinner", "lunch"];
      const barAliases = ["bares", "cafeterías", "café", "bar", "cafeteria", "drinks"];
      
      let targetRest = cat.subcategories.find(s => s.name && restaurantAliases.includes(s.name.toLowerCase()));
      let targetBar = cat.subcategories.find(s => s.name && barAliases.includes(s.name.toLowerCase()));

      cat.subcategories.forEach(sub => {
        const subName = (sub.name || "").trim().toLowerCase();
        if (!subName) return;

        // Detectar si el nombre de la subcategoría es un establecimiento (coincide con sus patrones)
        const isEstablishment = sub.types.some(t => {
          const p = t.trim().toLowerCase();
          return p === subName || p.includes(subName) || subName.includes(p);
        });

        // Palabras clave para detectar si es de hostelería
        const isFoodRelated = subName.includes("mcdonald") || subName.includes("burger") || subName.includes("sushi") || subName.includes("pizza") || subName.includes("steak") || subName.includes("restaurante");
        const isDrinkRelated = subName.includes("bar") || subName.includes("cafe") || subName.includes("coffee") || subName.includes("starbucks");

        if (isEstablishment || isFoodRelated || isDrinkRelated) {
          let target: any = null;
          if (isFoodRelated) target = targetRest || null;
          else if (isDrinkRelated) target = targetBar || null;

          if (target && target.name !== sub.name) {
            // Mover patrones a la subcategoría genérica
            sub.types.forEach(t => {
              if (t && !target!.types.some((p: string) => p.toLowerCase() === t.toLowerCase())) {
                target!.types.push(t);
              }
            });
            needsSave = true;
          } else if (isEstablishment) {
            // Promover a patrones raíz si no hay genérica o es un establecimiento genérico
            sub.types.forEach(t => {
              if (t && !cat.types.some(ct => (ct.entry || "").toLowerCase() === t.toLowerCase())) {
                cat.types.push({ name: t, entry: t.toLowerCase() } as any);
              }
            });
            needsSave = true;
          } else {
            finalSubs.push(sub as any);
          }
        } else {
          // Fusionar si ya existe una con el mismo nombre (case insensitive)
          const existing = finalSubs.find(s => s.name && s.name.toLowerCase() === subName);
          if (existing) {
            sub.types.forEach(t => {
              if (!existing.types.some(p => p.toLowerCase() === t.toLowerCase())) {
                existing.types.push(t);
              }
            });
            needsSave = true;
          } else {
            finalSubs.push(sub as any);
          }
        }
      });

      if (needsSave) {
        cat.subcategories = finalSubs as any;
      }
    }

    if (needsSave) {
      await cat.save().catch(err => console.error("Error al limpiar categoría persistente:", err));
    }
    
    return cat;
  }));
}

export async function getCategoryById(id: string, userId: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("ID de categoría inválido", 400);
  }

  const category = await Categories.findOne({
    _id: id,
    user: userId
  });
  if (!category) {
    throw new AppError("Categoría no encontrada", 404);
  }

  return category;
}

export async function createCategory(data: CreateCategoryPayload, userId: string) {
  if (!data.category?.trim()) {
    throw new AppError("El nombre de la categoría es obligatorio", 400);
  }

  // Check uniqueness within this user's scope
  const existing = await Categories.findOne({
    category: { $regex: new RegExp(`^${data.category.trim()}$`, "i") },
    user: userId
  });

  if (existing) {
    throw new AppError(`La categoría '${data.category}' ya existe`, 409);
  }

  // Sanitización proactiva al crear
  let cleanTypes = (data.types || []).filter(t => {
    const name = (t.name || "").toLowerCase();
    const entry = (t.entry || "").toLowerCase();
    return name !== "gasto" && entry !== "expense" && name.trim() !== "";
  });

  // Limpieza de subcategorías redundantes
  const subcategories: ISubcategory[] = [];
  if (data.subcategories) {
    data.subcategories.forEach(sub => {
      const subName = (sub.name || "").trim().toLowerCase();
      if (!subName) return;

      // Si la subcategoría tiene el mismo nombre que uno de sus patrones, o viceversa
      const isRedundant = sub.types.some(t => {
        const pattern = t.trim().toLowerCase();
        return pattern === subName || pattern.includes(subName) || subName.includes(pattern);
      });

      if (isRedundant) {
        // Promovemos los patrones a la categoría raíz
        sub.types.forEach(t => {
          if (t && !cleanTypes.some(ct => ct.entry.toLowerCase() === t.toLowerCase())) {
            cleanTypes.push({ name: t, entry: t.toLowerCase() });
          }
        });
      } else {
        subcategories.push(sub);
      }
    });
  }

  return Categories.create({
    category: data.category.trim(),
    types: cleanTypes,
    subcategories: subcategories,
    user: userId,
  });
}

export async function updateCategory(id: string, userId: string, data: UpdateCategoryPayload) {
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
      user: userId
    });

    if (existing) {
      throw new AppError(`La categoría '${data.category}' ya existe`, 409);
    }
  }

  const updateData: Record<string, unknown> = {};
  if (data.category !== undefined) updateData.category = data.category.trim();
  
  let currentTypes = data.types || [];
  let currentSubs = data.subcategories || [];

  if (data.types !== undefined || data.subcategories !== undefined) {
    // Sanitización profunda
    const cleanTypes = currentTypes.filter(t => {
      const name = (t.name || "").toLowerCase();
      const entry = (t.entry || "").toLowerCase();
      return name !== "gasto" && entry !== "expense" && name.trim() !== "";
    });

    const finalSubs: ISubcategory[] = [];
    currentSubs.forEach(sub => {
      const subName = (sub.name || "").trim().toLowerCase();
      if (!subName) return;

      const isRedundant = sub.types.some(t => {
        const pattern = t.trim().toLowerCase();
        return pattern === subName || pattern.includes(subName) || subName.includes(pattern);
      });

      if (isRedundant) {
        sub.types.forEach(t => {
          if (t && !cleanTypes.some(ct => ct.entry.toLowerCase() === t.toLowerCase())) {
            cleanTypes.push({ name: t, entry: t.toLowerCase() });
          }
        });
      } else {
        finalSubs.push(sub);
      }
    });

    updateData.types = cleanTypes;
    updateData.subcategories = finalSubs;
  }

  const updated = await Categories.findOneAndUpdate(
    { _id: id, user: userId },
    updateData,
    { new: true }
  );

  if (!updated) {
    throw new AppError("Categoría no encontrada", 404);
  }

  return updated;
}

export async function deleteCategory(id: string, userId: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("ID de categoría inválido", 400);
  }

  // Only allow deleting own categories, not global ones
  const deleted = await Categories.findOneAndDelete({ _id: id, user: userId });

  if (!deleted) {
    throw new AppError("Categoría no encontrada o no tienes permiso para eliminarla", 404);
  }

  return deleted;
}
