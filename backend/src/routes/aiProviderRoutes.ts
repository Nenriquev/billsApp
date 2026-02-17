import { Router } from "express";
import {
  getAllProviders,
  getProvider,
  createProvider,
  updateProvider,
  deleteProvider,
  testProvider,
} from "../controllers/aiProviderController";
import { verifyToken } from "../middleware/auth";

const aiProviderRouter = Router();

aiProviderRouter.use(verifyToken);

aiProviderRouter.get("/", getAllProviders);
aiProviderRouter.get("/:id", getProvider);
aiProviderRouter.post("/", createProvider);
aiProviderRouter.put("/:id", updateProvider);
aiProviderRouter.delete("/:id", deleteProvider);
aiProviderRouter.post("/:id/test", testProvider);

export default aiProviderRouter;
