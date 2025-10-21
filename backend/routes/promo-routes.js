import { Router } from "express";
import {
  getPromoCodes,
  getPromoCodeById,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  getActivePromoCodes,
  validatePromoCode,
  incrementPromoCodeUsage,
} from "../controllers/promo-controller.js";
import { authenticateToken } from "../middlewares/auth-middleware.js";

const promoRouter = Router();

// Public routes (before authentication)
promoRouter.post("/validate", validatePromoCode);
promoRouter.post("/increment", incrementPromoCodeUsage);

// All other routes require authentication
promoRouter.use(authenticateToken);

// Promo code routes
promoRouter.get("/", getPromoCodes);
promoRouter.get("/active", getActivePromoCodes);
promoRouter.get("/:id", getPromoCodeById);
promoRouter.post("/", createPromoCode);
promoRouter.put("/:id", updatePromoCode);
promoRouter.delete("/:id", deletePromoCode);

export default promoRouter;
