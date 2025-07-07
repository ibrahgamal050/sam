import axios from 'axios';
import * as dotenv from 'dotenv';
import MenuItem from '@/models/menu'
import RestaurantModel from '@/models/restaurant'
import { ICategory ,IMenu ,IMenuItem } from '@/types/menu';
import mongoose, { Schema, Document, Model } from 'mongoose';

dotenv.config();


// واجهة بيانات المنيو




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
export const egRestaurantModel: Model<egRestaurant> = mongoose.models.egRestaurant || mongoose.model<egRestaurant>('egRestaurant', restaurantSchema);

// الاتصال بقاعدة البيانات
mongoose
  .connect(process.env.MONGODB_URI|| 'mongodb+srv://ibrahimfoodApp55:Ola442004@cluster0.m9kbm.mongodb.net/restaurantsDB?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB error:', err));

// 1. استخراج النص من Google Vision
async function extractTextFromImage(imageUrl: string): Promise<string> {
  const imageRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const base64Image = Buffer.from(imageRes.data, 'binary').toString('base64');

  const visionRes = await axios.post(
    `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
    {
      requests: [
        {
          image: { content: base64Image },
          features: [{ type: 'TEXT_DETECTION' }],
        },
      ],
    }
  );

  return visionRes.data.responses[0].fullTextAnnotation?.text || '';
}

// 2. تحويل النص إلى JSON باستخدام Perplexity
async function convertTextToMenuJSON(rawText: string, name: string): Promise<ICategory[]> {
  const prompt = `
  عندك النص التالي اللي بيوصف منيو مطعم ${name}. المنيو مقسم لأقسام، وكل قسم فيه أكلات وأسعارها. المطلوب إنك:
  
  1. تستخرج الأقسام (categories).
  2. لكل قسم، تستخرج الأصناف (menuItems) اللي فيه.
  3. كل صنف يحتوي على:
     - الاسم بالعربي والإنجليزي
     - السعر (لو مش موجود، خليه null)
     - والوصف إن وُجد (description).
     - المقاسات (sizes) إن وُجدت، بنفس التنسيق:
       { name: { ar: "صغير", en: "Small" }, price: 20 }
  
  ⚠️ تعليمات مهمة:
  - لا تتجاوز أسماء الأقسام أو الأطباق 60 حرف بالإنجليزية.
  - لو مش واضح السعر أو مفقود، خليه null.
  - لو محتاج معلومات ناقصة، تقدر تستنتجها من الإنترنت.
  - ارجع النتيجة بصيغة JSON فقط بدون شرح.
  
  الصيغة المطلوبة:
  
  [
    {
      "name": { "ar": "اسم القسم بالعربي", "en": "Section Name in English" }, 
      "menuItems": [
        { 
          "name": { "ar": "اسم الطبق بالعربي", "en": "Dish Name in English" },
          "price": 70,
          "description": { "ar": "وصف بالعربي", "en": "English description" },
          "sizes": [
            { "name": { "ar": "صغير", "en": "Small" }, "price": 50 }
          ]
        }
      ]
    }
  ]
  
  النص الكامل:
  
  ${rawText}
  `;
  
  
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a professional data parser. Always return clean, valid JSON with no explanation.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });
  
    const result = await response.json();
    let content = result.choices?.[0]?.message?.content || '';
  
    // إزالة أي نص غير صالح مثل "json" أو أي رموز إضافية
    content = content.replace(/^```json/, '').replace(/```$/, '').trim();
  
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error('❌ JSON parsing error:', e);
      return [];
    }
  }
  





  async function processAllRestaurants() {
    try {
      const restaurants = await RestaurantModel.find({});
    
      for (const rest of restaurants) {
        console.log(`🍽️ جاري معالجة المطعم: ${rest.name}`);
        const existingMenu = await MenuItem.findOne({ restaurantId: rest._id });

        // إذا كان المنيو موجود وفيه أقسام (categories)، تخطى المعالجة
        if (existingMenu && existingMenu.categories.length > 0) {
          console.log(`🔄 المنيو يحتوي على أقسام بالفعل للمطعم ${rest.name}، سيتم تخطيه.`);
          continue;
        }
        
    
        const egrestaurant = await egRestaurantModel.findOne({ phones: rest.phones });
        if (!egrestaurant) {
          console.warn(`🚫 لا يوجد بيانات egrestaurant للمطعم: ${rest.name}`);
          continue;
        }
    
        const imageLinks = egrestaurant.imageLinks || [];
        if (imageLinks.length === 0) {
          console.warn(`🚫 لا يوجد صور للمينيو لمطعم: ${rest.name}`);
          continue;
        }
    
        let allCategories: ICategory[] = [];

        for (const [i, image] of imageLinks.entries()) {
          console.log(`🖼️ معالجة الصورة ${i + 1}/${imageLinks.length}...`);
          try {
            const extractedText = await extractTextFromImage(image);
            console.log(`📄 النص المستخرج من الصورة ${i + 1}:\n${extractedText}`);
        
            if (!extractedText.trim()) {
              console.warn(`⚠️ الصورة ${i + 1} لم تحتوي على نص`);
              continue;
            }
        
            const aiCategories = await convertTextToMenuJSON(extractedText, rest.name);
        
            if (!Array.isArray(aiCategories)) {
              console.warn(`⚠️ الذكاء الاصطناعي لم يرجع نتيجة مناسبة للصورة ${i + 1}`);
              continue;
            }
        
            for (const newCat of aiCategories) {
              const existingCat = allCategories.find(
                cat => cat.name.en === newCat.name.en || cat.name.ar === newCat.name.ar
              );
        
              if (existingCat) {
                for (const newItem of newCat.menuItems) {
                  const alreadyExists = existingCat.menuItems.some(
                    item => item.name.en === newItem.name.en || item.name.ar === newItem.name.ar
                  );
        
                  if (!alreadyExists) {
                    if (newItem.sizes) {
                      newItem.sizes.forEach(size => {
                        if (size.price === undefined || size.price === null) {
                          size.price = 0;
                        }
                      });
                    }
                    existingCat.menuItems.push(newItem);
                  }
                }
              } else {
                allCategories.push(newCat);
              }
            }
        
            console.log(`✅ تم استخراج ${aiCategories.length} قسم من الصورة ${i + 1}`);
          } catch (imgErr) {
            console.error(`❌ خطأ أثناء معالجة الصورة ${i + 1}:`,);
          }
        }
        
        // بعد انتهاء الصور:
        if (allCategories.length === 0) {
          console.warn(`🚫 لم يتم استخراج أي أقسام للمطعم ${rest.name}`);
          continue;
        }
        
        if (existingMenu) {
          existingMenu.categories = allCategories;
          await existingMenu.save();
          console.log(`✅ تم تحديث المنيو الموجود للمطعم ${rest.name} (${existingMenu._id})`);
        } else {
          const menu = new MenuItem({
            restaurantId: rest._id,
            name: rest.subdomain,
            currency: { ar: "جنيه", en: "EGP" },
            categories: allCategories,
            menuImages: imageLinks, // ← تأكد إن السكيمة بتقبلها
          });
          await menu.save();
          console.log(`✅ تم حفظ المنيو الجديد للمطعم ${rest.name} (${menu._id})`);
        }
        
        
      }
    
      console.log('🎉 تم الانتهاء من معالجة جميع المطاعم');
    } catch (err) {
      console.error('❌ خطأ عام أثناء المعالجة:', err);
    }
  }
  
  
  
  


processAllRestaurants();
