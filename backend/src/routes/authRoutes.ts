import express from "express";
import { register, login, getProfile, updatePassword } from "../controllers/authController";
import { verifyToken } from "../middleware/auth";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", verifyToken, getProfile);
router.put("/change-password", verifyToken, updatePassword);

export default router;
