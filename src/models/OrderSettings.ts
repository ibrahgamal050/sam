// models/OrderSettings.ts
import { Schema, model, models } from "mongoose"

const orderSettingsSchema = new Schema({
  restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },

  // أنواع الطلبات المفعلة
  types: {
    dine_in: { type: Boolean, default: true },
    pickup: { type: Boolean, default: true },
    delivery: { type: Boolean, default: false },
  },

  // الحد الأدنى للطلب
  minOrderAmount: { type: Number, default: 0 },

  // الطلبات المجدولة
  scheduledOrders: {
    enabled: { type: Boolean, default: false },
    minHoursBefore: { type: Number, default: 2 }, // أقل وقت قبل الطلب
  },

  // مواعيد العمل (لكل يوم)
  workingHours: {
    type: [
      {
        day: { type: String, enum: ["sat", "sun", "mon", "tue", "wed", "thu", "fri"] },
        open: String,
        close: String,
        isClosed: { type: Boolean, default: false },
      },
    ],
    default: [],
  },

  // طرق الدفع
  paymentMethods: {
    cash: { type: Boolean, default: true },
    card: { type: Boolean, default: true },
    online: { type: Boolean, default: false },
  },

  // إعدادات التوصيل (لو مفعّل)
  delivery: {
    enabled: { type: Boolean, default: false },
    baseFee: { type: Number, default: 0 },
    feePerKm: { type: Number, default: 0 },
    freeDeliveryAbove: { type: Number, default: null },
    estimatedTime: { type: String, default: "30-45 min" },
  },

  updatedAt: { type: Date, default: Date.now },
})

export default models.OrderSettings || model("OrderSettings", orderSettingsSchema)
