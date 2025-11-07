import express from "express";
import {
  createProduct,
  getProducts,
  getProductBySlug,
} from "../controllers/productController.js";

const router = express.Router();

// ✅ Routes
router.post("/", createProduct);
router.get("/", getProducts);
router.get("/:slug", getProductBySlug);

export default router;
