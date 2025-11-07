import Product from "../models/Product.js";
import cloudinary from "../config/cloudinaryConfig.js";
import axios from "axios";
import fs from "fs";
import path from "path";

// ✅ Helper: upload image to Cloudinary from a URL
const uploadToCloudinary = async (imageUrl) => {
  try {
    const response = await axios({
      url: imageUrl,
      responseType: "arraybuffer",
    });

    // Ensure temp folder exists
    const tempDir = path.join("temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const filePath = path.join(tempDir, `image-${Date.now()}.jpg`);
    fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: "products",
    });

    fs.unlinkSync(filePath); // delete temp file
    return uploadResult.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);
    return null;
  }
};

// ✅ Create Product
export const createProduct = async (req, res) => {
  try {
    const { name, price, category, description, imageUrl } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, price and category are required",
      });
    }

    let finalImageUrl = imageUrl;

    // ✅ If imageUrl provided, upload to Cloudinary
    if (imageUrl) {
      const uploadedUrl = await uploadToCloudinary(imageUrl);
      if (uploadedUrl) finalImageUrl = uploadedUrl;
    }

    const newProduct = new Product({
      name,
      price,
      category,
      description,
      imageUrl: finalImageUrl,
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "✅ Product created successfully and image uploaded to Cloudinary",
      data: newProduct,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get All Products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get Product by Slug
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
