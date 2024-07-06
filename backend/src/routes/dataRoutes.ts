import express from "express";
import { getAnalyticData, getCategories, getData, updateTransaction } from "../controllers/dataController";

const dataRouter = express.Router();

dataRouter.get("/", getData);
dataRouter.get("/categories", getCategories);
dataRouter.get("/analytics", getAnalyticData);
dataRouter.post("/update/:id", updateTransaction);

export default dataRouter;
