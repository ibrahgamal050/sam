import mongoose, { Types } from "mongoose"
import dotenv from "dotenv"
import type { IRestaurant } from "@/types/restaurant";
import Page from "@/models/page";
import dbConnect from "@/lib/db"
import Restaurant from "@/models/restaurant" 

dotenv.config()


mongoose.connect('mongodb+srv://ibrahimfoodApp55:Ola442004@cluster0.m9kbm.mongodb.net/restaurantsDB?retryWrites=true&w=majority&appName=Cluster0').then(() => console.log("✅ تم الاتصال بقاعدة البيانات"))
  .catch(err => console.error("❌ خطأ في الاتصال:", err));





  
  // ✅ صفحة "عن المطعم"
  export const defaultAbout = (restaurant: IRestaurant) => {
    const now = new Date();
    const title = `عن ${restaurant.name.ar} | تعرف على قصتنا ومهمتنا`;
    const branchAreas = restaurant.branches?.map(branch => branch.name.ar).join("، ") ;

    const description = `تعرف على قصة مطعم ${restaurant.name.ar}، أحد المطاعم المميزة التي تقدم تجربة طعام فريدة في ${branchAreas}. اكتشف رؤيتنا للجودة، والخدمة، والتميز في كل طبق.`;
    
  
    const keywords = [
        "مطعم",
        "منيو",
        "فروع",
        "توصيل",
        restaurant.name.ar,
        ...(restaurant.branches ?? []).map(branch => `${restaurant.name.ar} ${branch.name.ar}`),
        ...(restaurant.branches ?? []).map(branch => `مطعم في ${branch.name.ar}`),
      ];
      
  
    return {
      _id: new Types.ObjectId(),
      slug: "about",
      name: "عن المطعم",
      language: "ar",
      template: false,
      isPublished: true,
      headerImage: `/${restaurant.subdomain}/logo.jpg`,
      seo: {
        title,
        description,
        keywords: keywords,
        og_title: title,
        og_description: description,
        og_image: `/${restaurant.subdomain}/logo.jpg`,
        og_type: "website",
        twitter_card: "summary",
        twitter_title: title,
        twitter_description: description,
        twitter_image: `/${restaurant.subdomain}/logo.jpg`,
        canonical_url: `https://${restaurant.subdomain}.meelza.com/ar/about`,
        structured_data: {
          "@context": "https://schema.org",
          "@type": "Restaurant",
          name: title,
          url: `https://${restaurant.subdomain}.meelza.com`,
          image:`/${restaurant.subdomain}/logo.jpg`,
          hasMenu: {
            "@type": "Menu",
            name: "القائمة",
            description: "قائمة الطعام",
            hasMenuSection: [],
          },
        },
      },
      components: [
        {
            _id: new Types.ObjectId(),
          type: "header",
          position: 0,
          props: {
            heroImage: `/${restaurant.subdomain}/cover.jpg`,
            title: `مطعم ${restaurant.name.ar}`,
            subtitle: `اكتشف قصة مطعم ${restaurant.name.ar}الرائع`,
          },
        },
        {
            _id: new Types.ObjectId(),
          type: "story",
          position: 1,
          props: {
            title: `قصة مطعم ${restaurant.name.ar}`,
            contentParagraphs: [
                "بدأنا رحلتنا بهدف تقديم طعام عالي الجودة..."
              ]
          },
        },
        {
            _id: new Types.ObjectId(),
          type: "mission",
          position: 2,
          props: {
            title: "مهمتنا",
            content: "نحن نؤمن بالجودة والابتكار في كل وجبة.",
          },
        },
        {
            _id: new Types.ObjectId(),
            type: "values",
            position: 3,
            props: {
              title: "قيمنا",
              items: [
                {
                  id: "value-1",
                  number: 1,
                  title: "الجودة",
                  description: "نلتزم بتقديم أفضل جودة في كل وجبة."
                },
                {
                  id: "value-2",
                  number: 2,
                  title: "الابتكار",
                  description: "نحرص على تقديم أطباق جديدة ومميزة."
                },
                {
                  id: "value-3",
                  number: 3,
                  title: "الاحترام",
                  description: "نحترم عملائنا ونسعى دائمًا لتقديم أفضل خدمة."
                }
              ]
            }
          }
          
      ],
      metadata: {
        created_at: now,
        updated_at: now,
      },
    };
  };
 
  
 

  export async function generateAboutPagesForAllRestaurants() {
  
    const restaurants: IRestaurant[] = await Restaurant.find();
  
    for (const restaurant of restaurants) {
      // تحقق هل الصفحة موجودة مسبقًا
      const existing = await Page.findOne({
        restaurantId: restaurant._id,
        "pages.slug": "about",
        "pages.language": "ar"
      });
      
  
      if (existing) {
        console.log(`📄 صفحة "عن المطعم" موجودة بالفعل للمطعم: ${restaurant.name.ar}`);
        continue;
      }
  
      // توليد الصفحة
      const aboutPage = 
        defaultAbout(restaurant);
       
      
        await Page.updateOne(
            { restaurantId: restaurant._id },
            
            {
              $set: { subdomain: restaurant.subdomain },
              $push: { pages: aboutPage }
            },
            { upsert: true } // ← لو ماكانش فيه document Pages لهذا المطعم، هيعمله
          );
          
      console.log(`✅ تم إنشاء صفحة عن المطعم: ${restaurant.name.ar}`);
    }
  
    console.log("🎉 تم توليد كل الصفحات بنجاح.");
  }

  generateAboutPagesForAllRestaurants().catch((err) => {
  console.error("❌ حصل خطأ:", err)
  mongoose.disconnect()
})
