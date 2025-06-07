import generateSeoData from './seoData';
import { IRestaurant } from '@/types';

const pageName = "الرئيسية";

async function generateHomePage(restaurant: IRestaurant) {
  const seo = await generateSeoData(restaurant.name.ar, pageName);

  if (!seo) {
    console.log("⚠️ لم يتم توليد بيانات السيو.");
    return null;
  }

  const pageData = {
    name: pageName, // تأكد من أن هذه القيمة موجودة
    slug: "home",   // تأكد من أن هذه القيمة موجودة
    language: "ar", // تأكد من أن هذه القيمة موجودة
    template: false,
    isPublished: true,
    headerImage: "/hadramotantar/logo.jpg",
    seo: seo,       // هنا بيكون متاح
    components: [
      {
        component_id: "header",
        type: "header",
        props: { text: "مرحبًا بكم في مطعمنا" },
        position: 1
      },
      {
        component_id: "hero",
        type: "hero",
        props: {
          title: "مرحبًا بكم في مطعمنا",
          subtitle: "أفضل تجربة طعام",
          backgroundImage: "/hadramotantar/hero-bg.jpg"
        },
        position: 2
      }
    ],
    metadata: {
      created_at: new Date(),
      updated_at: new Date()
    }
  };
  
  
  return pageData;
}

export default generateHomePage;
