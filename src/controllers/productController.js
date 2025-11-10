import Product from "../models/Product.js";
import cloudinary from "../config/cloudinaryConfig.js";
import fs from "fs";
import path from "path";

// ✅ Create Product (only logged-in user)
export const createProduct = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: "Name, price & category are required" });
    }

    let imageUrl = "";

    // ✅ 1️⃣ If frontend sends an image file (multipart/form-data)
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "products",
      });
      imageUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path); // delete temp file
    }

    // ✅ 2️⃣ If frontend sends image URL
    else if (req.body.imageUrl) {
      const imageResponse = await fetch(req.body.imageUrl);
      const buffer = await imageResponse.arrayBuffer();
      const tempPath = path.join("uploads", `${Date.now()}.jpg`);
      fs.writeFileSync(tempPath, Buffer.from(buffer));

      const uploadResult = await cloudinary.uploader.upload(tempPath, {
        folder: "products",
      });

      imageUrl = uploadResult.secure_url;
      fs.unlinkSync(tempPath);
    }

    // ✅ Create product document
    const product = new Product({
      name,
      price,
      category,
      description,
      imageUrl,
      creator: req.user.id, // 🔥 store the logged-in user's ID
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Get All Products (with creator info)
export const getProducts = async (req, res) => {
  try {
    // populate creator info (name + email)
    const products = await Product.find().populate("creator", "name email");
    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Get Single Product by Slug
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate(
      "creator",
      "name email"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ creator: req.user.id }).populate(
      "creator",
      "name email"
    );
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


// ✅ Delete a specific product (only if user is the creator)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check ownership
    if (product.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    await product.deleteOne();
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Delete all products created by the logged-in user
export const deleteAllMyProducts = async (req, res) => {
  try {
    const result = await Product.deleteMany({ creator: req.user.id });
    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} products successfully`,
    });
  } catch (error) {
    console.error("❌ Error deleting all products:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
