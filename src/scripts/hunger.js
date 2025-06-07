const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const url = 'https://hungerstation.com/sa-ar/restaurant/%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6/%D8%A7%D9%84%D9%85%D8%B1%D9%88%D8%AC/17275';
  await page.goto(url, { waitUntil: 'networkidle2' });

  // استخراج بيانات JSON من العنصر __NEXT_DATA__
  const rawData = await page.$eval('#__NEXT_DATA__', el => el.textContent);
  const parsed = JSON.parse(rawData);

  // المسار إلى المنيو داخل JSON
  const menu = parsed.props.pageProps.vendorMenu;

  // تبسيط البيانات لاستخراجها بصيغة نظيفة
  const simplifiedMenu = menu.map(section => ({
    category: section.name,
    items: section.items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      calories: item.calories,
      image: item.image
    }))
  }));

  fs.writeFileSync('menu.json', JSON.stringify(simplifiedMenu, null, 2), 'utf8');
  console.log('✅ تم حفظ المنيو في ملف menu.json');

  await browser.close();
})();
