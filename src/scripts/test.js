const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeRestaurants() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // الذهاب إلى الصفحة
  await page.goto('https://menuegypt.com/ar/%D9%85%D8%A7%D9%83%D8%AF%D9%88%D9%86%D8%A7%D9%84%D8%AF%D8%B2', {
    waitUntil: 'domcontentloaded',
    timeout: 0
  });

  // انتظار حتى تظهر الصور في التابات
  await page.waitForSelector('#my-tabs li a img');

  // استخراج روابط الصور
  const imageLinks = await page.evaluate(() => {
    const links = [];
    const images = document.querySelectorAll('#my-tabs li a img'); // اختيار الصور داخل التابات
    images.forEach(img => {
      let src = img.getAttribute('src');
      if (src) {
        // إزالة _s قبل .jpg وأي جزء بعد علامة الاستفهام
       
        src = src.replace(/_s(?=\.jpg)/, '');
         src = src.replace('_s', ''); // إزالة _s إذا كان بعد رقم المنيو
        src = src.replace(/\?.*$/, ''); // إزالة أي جزء بعد علامة الاستفهام (?)
        links.push(src);
      }
    });
    return links;
  });

  if (imageLinks.length > 0) {
    console.log('تم العثور على الصور:', imageLinks);
  } else {
    console.log('لم يتم العثور على صور.');
  }

  // حفظ الروابط المعدلة في ملف
  fs.writeFileSync('image-links.json', JSON.stringify(imageLinks, null, 2), 'utf8');

  await browser.close();
}

scrapeRestaurants();
