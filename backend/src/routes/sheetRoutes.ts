import express from "express";
import { readSheet } from "../controllers/sheetController";
import multer from "multer";

const sheetRouter = express.Router();
const storage = multer.memoryStorage()

const upload = multer({ storage: storage });

sheetRouter.post("/upload", upload.single("sheet"), readSheet);

export default sheetRouter;
