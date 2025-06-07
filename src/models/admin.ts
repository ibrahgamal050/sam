import mongoose, { Schema, type Document } from "mongoose"
import type { Types } from "mongoose"
import bcrypt from "bcryptjs"

export interface IAdmin extends Document {
  restaurantId: Types.ObjectId
  email: string
  passwordHash: string
  role: "owner" | "manager" | "staff"
  comparePassword: (password: string) => Promise<boolean>
  createdAt: Date
  updatedAt: Date
}

const AdminSchema: Schema = new Schema(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["owner", "manager", "staff"], default: "staff" },
  },
  { timestamps: true },
)

// Add method to compare password
AdminSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.passwordHash)
}

// Hash password before saving
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

export default mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema)
