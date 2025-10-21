import {Router} from "express";
import {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brand-controller.js";
import {authenticateToken} from "../middlewares/auth-middleware.js";

const brandRouter = Router();

// Get all brands
brandRouter.get("/", getBrands);

// Get brand by ID
brandRouter.get("/:id", getBrandById);

// Create brand
brandRouter.post("/", authenticateToken, createBrand);

// Update brand
brandRouter.put("/:id", authenticateToken, updateBrand);

// Delete brand
brandRouter.delete("/:id", authenticateToken, deleteBrand);

export {brandRouter};
