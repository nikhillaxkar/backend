import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { dbName: "testdb" })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err.message));

// ✅ Routes
app.use("/api/products", productRoutes);

// ✅ Default route
app.get("/", (req, res) => {
  res.send("Backend is live on Vercel 🚀");
});

// ❌ Remove app.listen()
// ✅ Export the app for Vercel
export default app;
