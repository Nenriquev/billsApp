import { Router } from "express";
import multer from "multer";
import { uploadSheet, previewSheet, saveSelectedTransactions } from "../controllers/sheetController";
import { verifyToken } from "../middleware/auth";

const sheetRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

sheetRouter.use(verifyToken);

sheetRouter.post("/upload", upload.single("sheet"), uploadSheet);
sheetRouter.post("/preview", upload.single("sheet"), previewSheet);
sheetRouter.post("/save-selected", saveSelectedTransactions);

export default sheetRouter;
