import { Siren } from 'lucide-react';
import mongoose from 'mongoose';

const SizeSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true }, // اسم الحجم بالإنجليزية
    ar: { type: String, required: true }, // اسم الحجم بالعربية
  },
  price: { type: Number, required: false }, // سعر الحجم
});

const menuImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  altText: { type: String, required: true },
 
});
// Define the menu item subdocument schema
const menuItemSchema = new mongoose.Schema({
  name: {
    en: {
      type: String,
      required: false, // جعل الاسم باللغة الإنجليزية اختياريًا
    },
    ar: {
      type: String,
      required: false, // جعل الاسم باللغة العربية اختياريًا
    }
  },
  description: {
    en: {
      type: String,
      required: false,
    },
    ar: {
      type: String,
      required: false,
    }
  },
  price: {
    type: Number,
   
    min: [0, 'Price cannot be negative'],
  },
  image: {
    type: String,
    default: '/placeholder.svg?height=200&width=300',
  },
  sizes: [SizeSchema]
});


// Define the category schema with embedded menu items
const categorySchema = new mongoose.Schema({
  name: {
    en: {
      type: String,
      required: [true, 'Please provide a name for the category in English.'],
    },
    ar: {
      type: String,
      required: [true, 'Please provide a name for the category in Arabic.'],
    }
  },
  description: {
    en: {
      type: String,
    },
    ar: {
      type: String,
    }
  },
  image: {
    type: String,
    default: '/placeholder-category.svg?height=100&width=100',
  },
  menuItems: [menuItemSchema],
}, {
  timestamps: true,
});

// Define the restaurant schema with embedded categories
const restaurantMenuSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Please provide a restaurant ID.'],
  },
  name: {
    type: String,
    required: [true, 'Please provide a name for the restaurant.'],
    maxlength: [50, 'Restaurant name cannot be more than 50 characters'],
  },
  currency:{
    ar:{
      type: String,
      maxlength: [50, 'Restaurant name cannot be more than 50 characters'],
    },
    en:{
      type: String,
      maxlength: [50, 'Restaurant name cannot be more than 50 characters'],
    },
  },
  
  categories: [categorySchema], // Embed categories directly within the restaurant
  menuImages: [menuImageSchema], 
}, {
  timestamps: true,
});

// Create the Restaurant model
const Menu = mongoose.models.Menu || mongoose.model('Menu', restaurantMenuSchema);

export default Menu;
