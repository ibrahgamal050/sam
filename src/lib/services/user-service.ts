import mongoose from "mongoose"
import User, { type IUser, type UserRole } from "@/models/User"
import connectToDatabase from "@/lib/db/mongoose"

// Helper function to convert Mongoose document to plain object
function convertToPlainObject(doc: IUser): any {
  const user = JSON.parse(JSON.stringify(doc))
  delete user.password // Remove password from returned object
  return user
}

export async function getAllUsers(): Promise<any[]> {
  try {
    await connectToDatabase()
    const users = await User.find({}).select("-password").sort({ createdAt: -1 })
    return users.map(convertToPlainObject)
  } catch (error) {
    console.error("Error fetching users:", error)
    throw new Error("Failed to fetch users")
  }
}

export async function getUserById(id: string): Promise<any | null> {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null
    }

    const user = await User.findById(id).select("-password")
    return user ? convertToPlainObject(user) : null
  } catch (error) {
    console.error(`Error fetching user with id ${id}:`, error)
    throw new Error("Failed to fetch user")
  }
}

export async function getUserByEmail(email: string): Promise<any | null> {
  try {
    await connectToDatabase()
    const user = await User.findOne({ email }).select("-password")
    return user ? convertToPlainObject(user) : null
  } catch (error) {
    console.error(`Error fetching user with email ${email}:`, error)
    throw new Error("Failed to fetch user")
  }
}

export async function createUser(userData: {
  name: string
  email: string
  password: string
  role: UserRole
  restaurantId?: string
}): Promise<any> {
  try {
    await connectToDatabase()

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: userData.email })
    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    // Convert restaurantId to ObjectId if provided
    const userDataWithObjectId = { ...userData }
    if (userData.restaurantId && mongoose.Types.ObjectId.isValid(userData.restaurantId)) {
      userDataWithObjectId.restaurantId = new mongoose.Types.ObjectId(userData.restaurantId)
    }

    const user = new User(userDataWithObjectId)
    await user.save()

    return convertToPlainObject(user)
  } catch (error: any) {
    console.error("Error creating user:", error)
    throw new Error(error.message || "Failed to create user")
  }
}

export async function updateUser(id: string, userData: Partial<Omit<IUser, "password">>): Promise<any | null> {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null
    }

    // Convert restaurantId to ObjectId if provided
    const userDataWithObjectId = { ...userData }
    if (userData.restaurantId && mongoose.Types.ObjectId.isValid(userData.restaurantId.toString())) {
      userDataWithObjectId.restaurantId = new mongoose.Types.ObjectId(userData.restaurantId.toString())
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: userDataWithObjectId },
      { new: true, runValidators: true },
    ).select("-password")

    return user ? convertToPlainObject(user) : null
  } catch (error: any) {
    console.error(`Error updating user with id ${id}:`, error)

    // Handle duplicate email error
    if (error.code === 11000 && error.keyPattern?.email) {
      throw new Error("Email already in use")
    }

    throw new Error("Failed to update user")
  }
}

export async function updateUserPassword(id: string, newPassword: string): Promise<boolean> {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false
    }

    const user = await User.findById(id)
    if (!user) {
      return false
    }

    user.password = newPassword
    await user.save()

    return true
  } catch (error) {
    console.error(`Error updating password for user ${id}:`, error)
    throw new Error("Failed to update password")
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false
    }

    const result = await User.findByIdAndDelete(id)
    return !!result
  } catch (error) {
    console.error(`Error deleting user with id ${id}:`, error)
    throw new Error("Failed to delete user")
  }
}

export async function getUsersByRestaurant(restaurantId: string): Promise<any[]> {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return []
    }

    const users = await User.find({
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
    })
      .select("-password")
      .sort({ role: 1, name: 1 })

    return users.map(convertToPlainObject)
  } catch (error) {
    console.error(`Error fetching users for restaurant ${restaurantId}:`, error)
    throw new Error("Failed to fetch restaurant users")
  }
}

export async function authenticateUser(email: string, password: string): Promise<any | null> {
  try {
    await connectToDatabase()

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return null
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error("Account is inactive")
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return null
    }

    // Update last login time
    user.lastLogin = new Date()
    await user.save()

    return convertToPlainObject(user)
  } catch (error: any) {
    console.error(`Error authenticating user ${email}:`, error)
    throw new Error(error.message || "Authentication failed")
  }
}
