import axios from 'axios';
import mongoose, { Schema, Document } from 'mongoose';
import * as dotenv from 'dotenv';
import MenuItem from '@/models/menu'
import RestaurantModel from '@/models/restaurant'
import  {egRestaurantModel }  from './get.js'
import { ICategory ,IMenu ,IMenuItem } from '@/types/menu';

dotenv.config();


// واجهة بيانات المنيو





// الاتصال بقاعدة البيانات
mongoose
  .connect(process.env.MONGODB_URI|| '')
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
    
        // إذا كان المنيو موجودًا، تخطى المعالجة للمطعم الحالي
        if (existingMenu) {
          console.log(`🔄 المنيو موجود بالفعل للمطعم ${rest.name}، سيتم تخطيه.`);
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
            console.log(`📄 النص المستخرج:\n${extractedText}`);
    
            const aiCategories = await convertTextToMenuJSON(extractedText, rest.name);
            if (Array.isArray(aiCategories)) {
              for (const newCat of aiCategories) {
                const existingCat = allCategories.find(cat => 
                  cat.name.en === newCat.name.en || cat.name.ar === newCat.name.ar
                );
              
                if (existingCat) {
                  for (const newItem of newCat.menuItems) {
                    const alreadyExists = existingCat.menuItems.some(
                      item => item.name.en === newItem.name.en || item.name.ar === newItem.name.ar
                    );
                    if (!alreadyExists) {
                      // تأكد من أن السعر مفقود يتم تعيينه إلى null أو 0
                      if (newItem.sizes) {
                        newItem.sizes.forEach(size => {
                          // إذا كانت قيمة السعر غير موجودة أو null، يتم تعيينها إلى 0
                          if (size.price === undefined || size.price === null) {
                            size.price = 0;  // أو يمكنك تعيينه إلى null إذا كنت تفضل ذلك
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
            } else {
              console.warn(`⚠️ الذكاء الاصطناعي لم يرجع نتيجة مناسبة للصورة ${i + 1}`);
            }
          } catch (imgErr) {
            console.error(`❌ خطأ أثناء معالجة الصورة ${i + 1}:`, imgErr);
          }
        }
    
        if (allCategories.length === 0) {
          console.warn(`🚫 لم يتم استخراج أي أقسام للمطعم ${rest.name}`);
          continue;
        }
    
        const menu = new MenuItem({
          restaurantId: rest._id,
          name: rest.subdomain,
          currency: { ar: "جنيه", en: "EGP" },
          categories: allCategories,
          menuImages: [],
        });
        await menu.save();
        console.log(`✅ تم حفظ المنيو الجديد للمطعم ${rest.name} (${menu._id})`);
      }
    
      console.log('🎉 تم الانتهاء من معالجة جميع المطاعم');
    } catch (err) {
      console.error('❌ خطأ عام أثناء المعالجة:', err);
    }
  }
  
  
  
  


processAllRestaurants();
