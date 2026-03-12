import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

const TOKEN_SECRET = process.env.TOKEN_SECRET || "default_token_secret";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "El usuario ya existe" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    // Create default category
    const Categories = require("../models/Categories").default;
    await Categories.create({
      category: "Otros",
      user: savedUser._id,
      types: [],
      subcategories: []
    });
    
    res.status(201).json({ 
      message: "Usuario registrado correctamente. Ahora puede iniciar sesión."
    });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar el usuario" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Usuario y/o contraseña incorrectos" });

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) return res.status(400).json({ message: "Usuario y/o contraseña incorrectos" });

    const token = jwt.sign({ id: user._id }, TOKEN_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        notificationsEnabled: user.notificationsEnabled,
        createdAt: user.createdAt
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
};

export const getProfile = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el perfil" });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim() },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating profile" });
  }
};

export const updatePassword = async (req: any, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        const isMatch = await bcrypt.compare(currentPassword, user.password || "");
        if (!isMatch) return res.status(400).json({ message: "Contraseña actual incorrecta" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la contraseña" });
    }
}

export const updateNotifications = async (req: any, res: Response) => {
  try {
    const { notificationsEnabled } = req.body;

    if (typeof notificationsEnabled !== "boolean") {
      return res.status(400).json({ message: "notificationsEnabled debe ser un booleano" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { notificationsEnabled },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar las notificaciones" });
  }
};
