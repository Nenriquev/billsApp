import { Router } from "express";
import {
  getData,
  getCategories,
  getAnalyticData,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controllers/dataController";
import { verifyToken } from "../middleware/auth";

const dataRouter = Router();

dataRouter.use(verifyToken);

dataRouter.get("/", getData);
dataRouter.post("/", createTransaction);
dataRouter.get("/categories", getCategories);
dataRouter.get("/analytics", getAnalyticData);
dataRouter.patch("/:id", updateTransaction);
dataRouter.delete("/:id", deleteTransaction);

export default dataRouter;
