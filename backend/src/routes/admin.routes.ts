import { Router } from "express";
import { authenticate, checkAdmin } from "../middlewares/auth.middleware.js";
import { getPlatformStats } from "../controllers/admin.controller.js";

const router = Router();

// Only Admins can access platform analytics
router.get("/stats", authenticate, checkAdmin, getPlatformStats);

export default router;
