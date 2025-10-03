import { Schema, model, models, Types, Document, Model } from "mongoose"
import bcrypt from "bcryptjs"

// ---------- Types ----------
export type GlobalRole = "customer" | "restaurant_manager" | "admin"
export type RestaurantRole = "manager" | "staff" | "customer"

export interface SavedAddress {
  _id: string                // UUID v4 أو nanoid
  name: string               // اسم مختصر: "البيت"، "الشغل"...
  address: string
  city: string
  lat: number
  lng: number
  isDefault?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface RestaurantLink {
  restaurantId: Types.ObjectId
  role: RestaurantRole
  loyaltyPoints: number
}

export interface IUser extends Document {
  name: string
  email?: string
  phone?: string
  passwordHash: string
  isActive: boolean
  roles: GlobalRole[]
  restaurants: RestaurantLink[]
  savedAddresses: SavedAddress[]

  // Helpers
  hasRole: (role: GlobalRole) => boolean
  roleIn: (restaurantId: Types.ObjectId | string) => RestaurantRole | null
  addOrUpdateRestaurantLink: (link: Partial<RestaurantLink> & { restaurantId: Types.ObjectId | string }) => void
  addAddress: (addr: Omit<SavedAddress, "_id" | "createdAt" | "updatedAt"> & { _id: string }) => void
  setDefaultAddress: (addressId: string) => void
  comparePassword: (password: string) => Promise<boolean>
  setPassword: (password: string) => Promise<void>
}

// ---------- Sub Schemas ----------
const RestaurantLinkSchema = new Schema<RestaurantLink>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
    role: { type: String, enum: ["manager", "staff", "customer"], default: "customer", required: true },
    loyaltyPoints: { type: Number, default: 0 },
  },
  { _id: false }
)

const SavedAddressSchema = new Schema<SavedAddress>(
  {
    _id: { type: String, required: true }, // احفظ UUID كنص عشان ما يعتمدش على ObjectId
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
)

// ---------- Main Schema ----------
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, default: true },

    roles: {
      type: [String],
      enum: ["customer", "restaurant_manager", "admin"],
      default: ["customer"],
      validate: (arr: GlobalRole[]) => Array.isArray(arr) && arr.length > 0,
    },

    restaurants: { type: [RestaurantLinkSchema], default: [] },
    savedAddresses: { type: [SavedAddressSchema], default: [] },
  },
  { timestamps: true }
)

// ---------- Indexes ----------
// كل مستخدم لا يكرر نفس المطعم في اللينك
UserSchema.index({ _id: 1, "restaurants.restaurantId": 1 }, { unique: true, partialFilterExpression: { "restaurants.0": { $exists: true } } })

// بحث أسرع بالهاتف أو الإيميل
// unique indexes are defined on the fields themselves

// ---------- Methods ----------
UserSchema.methods.hasRole = function (this: IUser, role: GlobalRole) {
  return this.roles.includes(role)
}

UserSchema.methods.roleIn = function (this: IUser, restaurantId: Types.ObjectId | string) {
  const rid = typeof restaurantId === "string" ? new Types.ObjectId(restaurantId) : restaurantId
  const link = this.restaurants.find(r => r.restaurantId.toString() === rid.toString())
  return link ? link.role : null
}

UserSchema.methods.addOrUpdateRestaurantLink = function (
  this: IUser,
  link: Partial<RestaurantLink> & { restaurantId: Types.ObjectId | string }
) {
  const rid = typeof link.restaurantId === "string" ? new Types.ObjectId(link.restaurantId) : link.restaurantId
  const idx = this.restaurants.findIndex(r => r.restaurantId.toString() === rid.toString())
  if (idx >= 0) {
    this.restaurants[idx] = {
      ...this.restaurants[idx],
      ...link,
      restaurantId: rid,
      role: (link.role ?? this.restaurants[idx].role) as RestaurantRole,
      loyaltyPoints: link.loyaltyPoints ?? this.restaurants[idx].loyaltyPoints,
    }
  } else {
    this.restaurants.push({
      restaurantId: rid,
      role: (link.role ?? "customer") as RestaurantRole,
      loyaltyPoints: link.loyaltyPoints ?? 0,
    })
  }
}

UserSchema.methods.addAddress = function (
  this: IUser,
  addr: Omit<SavedAddress, "_id" | "createdAt" | "updatedAt"> & { _id: string }
) {
  // لو أول عنوان، خليه افتراضي تلقائيًا
  const isFirst = this.savedAddresses.length === 0
  this.savedAddresses.push({ ...addr, isDefault: addr.isDefault ?? isFirst })
  if ((addr.isDefault ?? isFirst) === true) {
    this.savedAddresses = this.savedAddresses.map(a => ({ ...a, isDefault: a._id === addr._id }))
  }
}

UserSchema.methods.setDefaultAddress = function (this: IUser, addressId: string) {
  this.savedAddresses = this.savedAddresses.map(a => ({ ...a, isDefault: a._id === addressId }))
}

UserSchema.methods.comparePassword = async function (this: IUser, candidate: string) {
  if (!this.passwordHash) {
    return false
  }
  return await bcrypt.compare(candidate, this.passwordHash)
}

UserSchema.methods.setPassword = async function (this: IUser, password: string) {
  const salt = await bcrypt.genSalt(10)
  this.passwordHash = await bcrypt.hash(password, salt)
}

UserSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) {
    return next()
  }

  try {
    const salt = await bcrypt.genSalt(10)
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// ---------- Model ----------
export const User: Model<IUser> = models.User || model<IUser>("User", UserSchema)
export default User
