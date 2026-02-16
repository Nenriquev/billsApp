import { Router } from "express";
import multer from "multer";
import { uploadSheet } from "../controllers/sheetController";

const sheetRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

sheetRouter.post("/upload", upload.single("sheet"), uploadSheet);

export default sheetRouter;
