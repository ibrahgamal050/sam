import mongoose, { Schema, type Document } from "mongoose"
import { IRestaurant } from "@/types"

const BranchSchema = new Schema(
  {
    name: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    location: {
      address: {
        ar: { type: String, required: true },
        en: { type: String, required: true },
      },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    phone: { type: String },
    workingHours: { type: String },
    isMainBranch: { type: Boolean, default: false },
  },
  { timestamps: true }
);


const DomainAliasSchema = new Schema(
  {
    host: { type: String, required: true, trim: true, lowercase: true },
    redirectTo: { type: String, trim: true },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const RestaurantSchema: Schema = new Schema(
  {
    name: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    subdomain: { type: String, required: true, unique: true, trim: true, lowercase: true },
    canonicalHost: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    domainAliases: { type: [DomainAliasSchema], default: [] },
    logo: { type: String, required: true },
    coverImage: { type: String, required: true },
    description: { type: String, required: true },
    
    social: {
      facebook: { type: String },
      instagram: { type: String },
      tiktok: { type: String },
      twitter: { type: String },
    },
    branches: [BranchSchema],  // رابط الـ Branch Schema هنا
    isPublished: { type: Boolean, default: false },
    phones: [{ type: String, required: true }],
  },
  { timestamps: true }
)
// Add index for faster queries
RestaurantSchema.index({ name: "text", description: "text" })

// Add a virtual for the full URL (useful in templates)


// Add a method to get page metadata
RestaurantSchema.methods.getPageMeta = function (pageSlug: string) {
  if (!this.pages) return null
  return this.pages.find((page: any) => page.slug === pageSlug)
}

export default mongoose.models.Restaurant || mongoose.model<IRestaurant>("Restaurant", RestaurantSchema)
