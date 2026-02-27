import { Request, Response, NextFunction } from "express";
import * as categoryService from "../services/categoryService";

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const categories = await categoryService.getAllCategories(userId);
    return res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const category = await categoryService.getCategoryById(req.params.id, userId);
    return res.json(category);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const category = await categoryService.createCategory(req.body, userId);
    return res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const category = await categoryService.updateCategory(req.params.id, userId, req.body);
    return res.json(category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    await categoryService.deleteCategory(req.params.id, userId);
    return res.json({ message: "Categoría eliminada correctamente" });
  } catch (error) {
    next(error);
  }
};
