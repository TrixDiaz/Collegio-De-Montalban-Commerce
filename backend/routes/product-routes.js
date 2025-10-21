import {Router} from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  upload,
} from "../controllers/product-controller.js";
import {authenticateToken} from "../middlewares/auth-middleware.js";

const productRouter = Router();

// Get all products
productRouter.get("/", getProducts);

// Get product by ID
productRouter.get("/:id", getProductById);

// Create product with thumbnail and multiple images
productRouter.post(
  "/",
  authenticateToken,
  upload.fields([
    {name: "thumbnail", maxCount: 1},
    {name: "images", maxCount: 10},
  ]),
  createProduct
);

// Update product with thumbnail and multiple images
productRouter.put(
  "/:id",
  authenticateToken,
  upload.fields([
    {name: "thumbnail", maxCount: 1},
    {name: "images", maxCount: 10},
  ]),
  updateProduct
);

// Delete product
productRouter.delete("/:id", authenticateToken, deleteProduct);

export {productRouter};
