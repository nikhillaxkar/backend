import Product from "../models/Product.js";
import cloudinary from "../config/cloudinaryConfig.js";

/**
 * ✅ Create Product (supports direct Cloudinary upload, no fs)
 */
export const createProduct = async (req, res) => {
  try {
    const { name, price, category, description, imageUrl } = req.body;

    if (!name || !price || !category) {
      return res
        .status(400)
        .json({ message: "Name, price & category are required" });
    }

    let finalImageUrl = "";

    // ✅ 1️⃣ If frontend sent a file (multipart/form-data)
    if (req.file) {
      const fileBuffer = req.file.buffer;
      const base64 = Buffer.from(fileBuffer).toString("base64");
      const dataUri = `data:${req.file.mimetype};base64,${base64}`;

      const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: "products",
      });

      finalImageUrl = uploadResult.secure_url;
    }

    // ✅ 2️⃣ If frontend sent an image URL instead
    else if (imageUrl) {
      const uploadResult = await cloudinary.uploader.upload(imageUrl, {
        folder: "products",
      });
      finalImageUrl = uploadResult.secure_url;
    }

    // ✅ 3️⃣ Create and save product
    const product = new Product({
      name,
      price,
      category,
      description,
      imageUrl: finalImageUrl,
      creator: req.user.id,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * ✅ Get all products
 */
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("creator", "name email");
    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

/**
 * ✅ Get a single product by slug
 */
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
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

/**
 * ✅ Get all products by logged-in user
 */
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ creator: req.user.id }).populate(
      "creator",
      "name email"
    );
    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Error fetching user's products:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

/**
 * ✅ Delete a specific product (only if user owns it)
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.creator.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this product" });
    }

    await product.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

/**
 * ✅ Delete all products created by the logged-in user
 */
export const deleteAllMyProducts = async (req, res) => {
  try {
    const result = await Product.deleteMany({ creator: req.user.id });
    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} products successfully`,
    });
  } catch (error) {
    console.error("❌ Error deleting all products:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
