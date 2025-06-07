// MongoDB types
export type ObjectId = any // Replace with actual ObjectId type if available

// Extended category type with required _id
export type CategoryWithId<T> = T & { _id: ObjectId }
