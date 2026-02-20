import { Router } from "express";
import { getDashboardData } from "../controllers/dashboardController";
import { verifyToken } from "../middleware/auth";

const dashboardRouter = Router();

dashboardRouter.use(verifyToken);
dashboardRouter.get("/", getDashboardData);

export default dashboardRouter;
