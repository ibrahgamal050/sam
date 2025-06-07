import mongoose, { Schema } from "mongoose"
import bcrypt from "bcryptjs"

export interface IUser {
  _id?: mongoose.Types.ObjectId
  name: string
  email: string
  password: string
  restaurantId: mongoose.Types.ObjectId
  role: "admin" | "manager" | "staff"
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  restaurantId: { type: Schema.Types.ObjectId, required: true, ref: "Restaurant" },
  role: { type: String, enum: ["admin", "manager", "staff"], default: "staff" },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Hash password before saving
UserSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next()

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10)
    // Hash the password along with the new salt
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Method to compare password for login
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Create or get the model
export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
