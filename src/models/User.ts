// apps/meelza-api/src/models/User.ts
import mongoose, { Schema, model, models, type Document } from "mongoose"

export interface IUser extends Document {
  _id: string // أو mongoose.Types.ObjectId لو بتستخدم ObjectId
  email?: string
  name?: string
  picture?: string
  authProvider?: "local" | "sso"
  providerId?: string
  passwordHash?: string
  savedAddresses: Array<{
    _id: string
    name: string
    address: string
    city: string
    lat: number
    lng: number
    isDefault?: boolean
    tenantKey?: string | null
    createdAt?: Date
    updatedAt?: Date
  }>
}

const AddressSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: String,
    address: String,
    city: String,
    lat: Number,
    lng: Number,
    isDefault: Boolean,
    tenantKey: { type: String, default: null },
  },
  { timestamps: true },
)

const UserSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true }, // أو ObjectId حسب تصميمك
    email: { type: String, index: true, sparse: true },
    name: String,
    picture: String,

    authProvider: { type: String, enum: ["local", "sso"], default: "sso" },
    providerId: { type: String },

    passwordHash: {
      type: String,
      required: function (this: any) {
        return this.authProvider === "local"
      },
      default: undefined,
    },

    savedAddresses: { type: [AddressSchema], default: [] },
  },
  { timestamps: true },
)

const User = models.User || model<IUser>("User", UserSchema)
export default User
