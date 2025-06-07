import mongoose, { Schema, Document, Model } from 'mongoose';
import generateBranchData from './branches.js';
import getRestaurantHours from './hours.js';
import getRestaurantReviews from './reviews.js';
import generateAboutPage from './about';
import generateHomePage from './home.js';
import { IRestaurant, IPages } from '@/types';
import RestaurantModel from '@/models/restaurant'
import generateInfoData from './info.js'
import Pages from '@/models/page'
import generatemenuPage from './menuPage.js';
import  {getTopRestaurants ,egRestaurant}   from './get.js'

// الاتصال بقاعدة البيانات
mongoose.connect('mongodb://localhost:27017/restaurantsDB').then(() => console.log("✅ تم الاتصال بقاعدة البيانات"))
  .catch(err => console.error("❌ خطأ في الاتصال:", err));



async function main() {
  try {
    const restaurants = await getTopRestaurants();
    console.log(restaurants)
    if (!restaurants || restaurants.length === 0) return;
  
    for (const restaurant of restaurants) {
      const addedRestaurant = await addRestaurant(restaurant);
      if (!addedRestaurant) {
        console.warn(`⚠️ لم يتم إضافة المطعم: ${restaurant.name}`);
        continue;
      }
  
      //const pages = await createRestaurantPages(addedRestaurant);
     // console.log(`✅ تم إنشاء الصفحات للمطعم ${restaurant.name}:`, pages);
    }
  } catch (error) {
    console.error("❌ حدث خطأ في الدالة الرئيسية:", error);
  }
  
}
// دالة لإضافة مطعم
async function addRestaurant(restaurant: egRestaurant) {
  try {
    // التحقق أولًا من وجود المطعم عن طريق subdomain أو أحد أرقام الهواتف
    const existingRestaurant = await RestaurantModel.findOne({
      $or: [
        { subdomain: restaurant.name },
        { phones: { $in: restaurant.phones } }
      ]
    });

    if (existingRestaurant) {
      console.log("❌ المطعم موجود بالفعل في قاعدة البيانات.");
      return null;
    }

    // بعد التأكد من عدم التكرار، نبدأ توليد البيانات
    const restaurantInfo = await generateInfoData(restaurant.name);
    const branches = await generateBranchData(restaurant.name, restaurant.branches);
    // const hours = await getRestaurantHours([restaurant.name]);
    // const reviews = await getRestaurantReviews([restaurant.name]);

    const mergedRestaurantData: IRestaurant = {
      ...restaurantInfo,
      branches: branches,
      phones: restaurant.phones,
      isPublished: false
    };

    // إنشاء كائن جديد للمطعم باستخدام البيانات
    const newRestaurant = new RestaurantModel(mergedRestaurantData);

    // حفظ المطعم في قاعدة البيانات
    await newRestaurant.save();
    console.log("✅ تم إضافة المطعم بنجاح:", newRestaurant.name);
    return newRestaurant;
  
  } catch (error) {
    console.error("❌ حدث خطأ أثناء إضافة المطعم:", error);
    return null;
  }
}

// دالة لإنشاء الصفحات
async function createRestaurantPages(restaurant: IRestaurant) {
  try {
    // توليد البيانات لصفحة الرئيسية
    const home = await generateHomePage(restaurant);
    const menu = await generatemenuPage(restaurant);


    // تأكد من أن home يحتوي على الحقول المطلوبة
    if (!home || !home.name || !home.slug || !home.language) {
      console.error('❌ الصفحة الرئيسية مفقودة أو تحتوي على بيانات ناقصة');
      return null;
    }

    // بناء البيانات التي سيتم إرسالها إلى MongoDB
    const pages = [home, menu];// التأكد من أن `pages` هو مصفوفة وليس كائنًا واحدًا

    const pagesData = {
      restaurantId: restaurant._id, // استخدم _id بدلاً من Id
      subdomain: restaurant.subdomain,
      pages: pages, // التأكد من أن pages هي مصفوفة تحتوي على صفحة واحدة
    };

    // إنشاء الوثيقة وحفظها في قاعدة البيانات
    const newPages = new Pages(pagesData);
    await newPages.save();

    console.log('✅ تم إضافة الصفحات بنجاح للمطعم');
    return pages; // ✅ إعادة البيانات بعد الحفظ
  } catch (err) {
    console.error('❌ حدث خطأ أثناء إضافة الصفحات:', err);
    return null; // في حالة الخطأ
  }
}


// استدعاء الدالة الرئيسية
main();
