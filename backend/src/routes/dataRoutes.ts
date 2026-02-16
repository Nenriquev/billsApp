import { Router } from "express";
import {
  getData,
  getCategories,
  getAnalyticData,
  updateTransaction,
  deleteTransaction,
} from "../controllers/dataController";

const dataRouter = Router();

dataRouter.get("/", getData);
dataRouter.get("/categories", getCategories);
dataRouter.get("/analytics", getAnalyticData);
dataRouter.patch("/:id", updateTransaction);
dataRouter.delete("/:id", deleteTransaction);

export default dataRouter;
