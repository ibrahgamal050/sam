import mongoose, { Schema, Document, Model } from 'mongoose';
// الاتصال بقاعدة البيانات
mongoose.connect('mongodb://localhost:27017/restaurantsDB').then(() => console.log("✅ تم الاتصال بقاعدة البيانات"))
  .catch(err => console.error("❌ خطأ في الاتصال:", err));

// تعريف نوع الفرع
interface Branch {
    name: string;
    address: string;
  }
  
  // تعريف نوع المطعم
  export interface egRestaurant extends Document {
    name: string;
    url: string;
    image: string;
    categories: string[];
    imageLinks: string[];
    logo: string;
    phones: string[];
    views: number;
    branches: Branch[];
  }
  
// تعريف مخطط (Schema) المطعم
 const restaurantSchema: Schema<egRestaurant> = new Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    image: { type: String, required: true },
    categories: [{ type: String, required: true }],
    imageLinks: [{ type: String, required: true }],
    logo: { type: String, required: true },
    phones: [{ type: String, required: true }],
    views: { type: Number, required: true },
    branches: [{
      name: { type: String, required: true },
      address: { type: String, required: true }
    }]
  });
  
  // تعريف الموديل
  export const egRestaurantModel: Model<egRestaurant> = mongoose.models.egRestaurant || mongoose.model<egRestaurant>('egRestaurant', restaurantSchema);
  
  export async function getTopRestaurants(): Promise<egRestaurant[]> {
    try {
      const restaurants = await egRestaurantModel.find({})
        .sort({ views: -1 }) // ترتيب تنازلي حسب عدد المشاهدات
        .limit(200);         // جلب أول 100 مطعم فقط
  
      if (restaurants.length === 0) {
        console.log("❌ لم يتم العثور على أي مطاعم");
        return [];
      }
  
      console.log(`📚 تم جلب ${restaurants} مطعم من الأعلى مشاهدة`);
      return restaurants;
  
    } catch (error) {
      console.error("❌ خطأ أثناء جلب المطاعم:", error);
      throw error;
    }
  } 
  