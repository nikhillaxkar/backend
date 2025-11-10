import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();

const app = express();
// ✅ Define the PORT (This was missing before!)
const PORT = process.env.PORT || 5000;

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
  res.send("Backend is live! 🚀");
});

// ✅ Start Server (Local Development)
// We use a check here so it doesn't conflict when deploying to Vercel later
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
}

// ✅ Export for Vercel
export default app;