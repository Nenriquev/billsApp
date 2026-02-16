import { Router } from "express";
import { getDashboardData } from "../controllers/dashboardController";

const dashboardRouter = Router();

dashboardRouter.get("/", getDashboardData);

export default dashboardRouter;
