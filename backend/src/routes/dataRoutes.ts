import express from "express";
import { getAnalyticData, getData } from "../controllers/dataController";

const dataRouter = express.Router();

dataRouter.get("/", getData);
dataRouter.get("/analytics", getAnalyticData);

export default dataRouter;
