import generateSeoData from './seoData';
import { IRestaurant } from '@/types';

const pageName = "منيو";

async function generatemenuPage(restaurant: IRestaurant) {
  const seo = await generateSeoData(restaurant.name.ar, pageName);

  if (!seo) {
    console.log("⚠️ لم يتم توليد بيانات السيو.");
    return null;
  }

  const pageData = {
    name: pageName, // تأكد من أن هذه القيمة موجودة
    slug: "menu",   // تأكد من أن هذه القيمة موجودة
    language: "ar", // تأكد من أن هذه القيمة موجودة
    template: false,
    isPublished: true,
    headerImage: `/${restaurant.subdomain}/logo.jpg`,
    seo: seo,       // هنا بيكون متاح
    components: [
      {
        component_id: "header",
        type: "header",
        props: { text: "مرحبًا بكم في مطعمنا" },
        position: 1
      },
      {
        "component_id": "menu_list",
        "type": "MenuList",
        "props": {
          "backgroundImage": `/${restaurant.subdomain}/logo.jpg`
        },
        "position": 1
      }
     
    ],
    metadata: {
      created_at: new Date(),
      updated_at: new Date()
    }
  };
  
  
  return pageData;
}

export default generatemenuPage;
