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

// ✅ Setup multer to handle temporary uploads
const upload = multer({ dest: "uploads/" });

// ✅ Protected routes
router.post("/", protect, upload.single("image"), createProduct); // ✅ <--- important
router.get("/my-products", protect, getMyProducts);
router.delete("/delete-all", protect, deleteAllMyProducts);
router.delete("/:id", protect, deleteProduct);

// ✅ Public routes
router.get("/", getProducts);
router.get("/:slug", getProductBySlug);

export default router;
