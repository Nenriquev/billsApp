import express from "express";
import { register, login, getProfile, updateProfile, updatePassword, updateNotifications } from "../controllers/authController";
import { verifyToken } from "../middleware/auth";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.put("/change-password", verifyToken, updatePassword);
router.put("/notifications", verifyToken, updateNotifications);

export default router;
