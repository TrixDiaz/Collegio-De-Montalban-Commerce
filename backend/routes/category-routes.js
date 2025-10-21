import {Router} from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category-controller.js";
import {authenticateToken} from "../middlewares/auth-middleware.js";

const categoryRouter = Router();

// Get all categories
categoryRouter.get("/", getCategories);

// Get category by ID
categoryRouter.get("/:id", getCategoryById);

// Create category
categoryRouter.post("/", authenticateToken, createCategory);

// Update category
categoryRouter.put("/:id", authenticateToken, updateCategory);

// Delete category
categoryRouter.delete("/:id", authenticateToken, deleteCategory);

export {categoryRouter};
