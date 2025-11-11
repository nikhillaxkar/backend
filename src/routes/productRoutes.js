import express from "express";
import multer from "multer";
import {
  createProduct,
  getProducts,
  getProductBySlug,
  getMyProducts,
  deleteProduct,
  deleteAllMyProducts,
  updateProduct, // ✅ add this
} from "../controllers/productController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Memory-based storage
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Protected Routes
router.post("/", protect, upload.single("image"), createProduct);
router.get("/my-products", protect, getMyProducts);
router.put("/:id", protect, upload.single("image"), updateProduct); // ✅ NEW
router.delete("/delete-all", protect, deleteAllMyProducts);
router.delete("/:id", protect, deleteProduct);

// ✅ Public Routes
router.get("/", getProducts);
router.get("/:slug", getProductBySlug);

export default router;
