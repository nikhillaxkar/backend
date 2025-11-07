import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true }, // ✅ Slug for SEO-friendly URLs
    price: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String }, // ✅ Cloudinary image URL
  },
  { timestamps: true }
);

// ✅ Generate a unique slug before saving
productSchema.pre("save", async function (next) {
  if (!this.isModified("name")) return next();

  const baseSlug = slugify(this.name, { lower: true, strict: true });
  let slug = baseSlug;
  let count = 1;

  // ✅ Ensure slug uniqueness
  while (await mongoose.models.Product.findOne({ slug })) {
    slug = `${baseSlug}-${count++}`;
  }

  this.slug = slug;
  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
