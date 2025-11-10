import express from "express";
import multer from "multer";
import {
  createProduct,
  getProducts,
  getProductBySlug,
  getMyProducts,
  deleteProduct,
  deleteAllMyProducts,
} from "../controllers/productController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Memory-based storage (no /uploads folder)
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Protected Routes
router.post("/", protect, upload.single("image"), createProduct);
router.get("/my-products", protect, getMyProducts);
router.delete("/delete-all", protect, deleteAllMyProducts);
router.delete("/:id", protect, deleteProduct);

// ✅ Public Routes
router.get("/", getProducts);
router.get("/:slug", getProductBySlug);

export default router;
