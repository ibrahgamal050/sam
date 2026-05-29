import mongoose from "mongoose";

const SizeSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
    ru: { type: String, required: true }, // روسي
  },
  price: { type: Number, required: true },
});

const menuImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  altText: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
    ru: { type: String, required: true }, // روسي
  },
});

// ================= MENU ITEM =================
const menuItemSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: false, maxlength: 120 },
    ar: { type: String, required: false, maxlength: 120 },
    ru: { type: String, required: false, maxlength: 120 }, // روسي
  },

  description: {
    en: { type: String, required: false, maxlength: 500 },
    ar: { type: String, required: false, maxlength: 500 },
    ru: { type: String, required: false, maxlength: 500 }, // روسي
  },

  price: {
    type: Number,
    min: [0, "Price cannot be negative"],
  },

  image: {
    type: String,
    default: "/placeholder.svg?height=200&width=300",
  },

  sizes: [SizeSchema],

  isAvailable: {
    type: Boolean,
    default: true,
  },

  stock: {
    type: Number,
    min: [0, "Stock cannot be negative"],
    default: null,
  },
});

// ================= CATEGORY =================
const categorySchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true, maxlength: 100 },
      ar: { type: String, required: true, maxlength: 100 },
      ru: { type: String, required: true, maxlength: 100 }, // روسي
    },

    description: {
      en: { type: String, maxlength: 100 },
      ar: { type: String, maxlength: 100 },
      ru: { type: String, maxlength: 100 }, // روسي
    },

    image: {
      type: String,
      default: "/placeholder-category.svg?height=100&width=100",
    },

    menuItems: [menuItemSchema],
  },
  {
    timestamps: true,
  }
);

// ================= RESTAURANT MENU =================
const restaurantMenuSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    name: {
      type: String,
      required: true,
      maxlength: 50,
    },

    categories: [categorySchema],
    menuImages: [menuImageSchema],
  },
  {
    timestamps: true,
  }
);

const Menu =
  mongoose.models.Menu || mongoose.model("Menu", restaurantMenuSchema);

export default Menu;