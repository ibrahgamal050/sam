const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const mongoose = require('mongoose');

// الاتصال بقاعدة البيانات
mongoose.connect('mongodb://localhost:27017/restaurantsDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ تم الاتصال بقاعدة البيانات"))
  .catch(err => console.error("❌ خطأ في الاتصال:", err));

// تعريف الموديل
const restaurantSchema = new mongoose.Schema({
  name: String,
  url: String,
  image: String,
  categories: [String],
  imageLinks: [String],
  logo: String,
  phones: [String],
  views: Number,
  branches: [
    {
      name: String,
      address: String
    }
  ]
});

const Restaurant = mongoose.model('egRestaurant', restaurantSchema);

function parseViews(text) {
  const match = text.match(/([\d.,]+)\s*([MK]?)/i);
  if (!match) return null;

  let [ , number, suffix ] = match;
  number = parseFloat(number.replace(',', ''));

  switch (suffix.toUpperCase()) {
    case 'M':
      return number * 1_000_000;
    case 'K':
      return number * 1_000;
    default:
      return number;
  }
}

// استخراج تفاصيل مطعم
async function getRestaurantDetails(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const name = $('.food-name h1').text().trim();
    const logo = $('.food-detail img').attr('src');
    const phones = [];

    $('.food-detail p.tel a[href^="tel:"]').each((_, el) => {
      phones.push($(el).attr('href').replace('tel:', '').trim());
    });

    const viewsText = $('.food-detail .views').text();
const views = parseViews(viewsText);

    const branches = $('.panel.panel-primary').map((_, el) => ({
      name: $(el).find('.panel-heading h2').text().trim(),
      address: $(el).find('.panel-body h5').text().trim()
    })).get();

    return { name, logo, phones, views, branches };
  } catch (err) {
    console.error(`❌ خطأ أثناء جلب تفاصيل المطعم (${url}):`, err.message);
    return {};
  }
}

// استخراج روابط الصور
async function getImageLinks(url) {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });
    await page.waitForSelector('#my-tabs li a img');

    return await page.evaluate(() => {
      return Array.from(document.querySelectorAll('#my-tabs li a img')).map(img => {
        let src = img.getAttribute('src');
        return src?.replace(/_s(?=\.jpg)/, '').replace('_s', '').replace(/\?.*$/, '') || '';
      });
    });
  } catch (err) {
    console.error(`❌ خطأ أثناء استخراج الصور (${url}):`, err.message);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}

// تنفيذ السحب
async function scrapeRestaurants() {
  try {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const url = `https://menuegypt.com/ar/menus/القاهرة/الشيخ-زايد//دليل-ارقام-المطاعم?page=${page}`;
      console.log(`📄 جاري معالجة الصفحة ${page}...`);

      const { data } = await axios.get(encodeURI(url));
      const $ = cheerio.load(data);
      const links = $('a.shake-heart');

      // لو مفيش مطاعم في الصفحة، نوقف التكرار
      if (links.length === 0) {
        console.log("✅ لا يوجد صفحات إضافية.");
        hasMore = false;
        break;
      }

      for (let i = 0; i < links.length; i++) {
        const el = links[i];
        const name = $(el).find('h3.media-heading').text().trim();
        const href = $(el).attr('href');
        const fullUrl = href.startsWith('http') ? href : 'https://menuegypt.com' + href;

        const exists = await Restaurant.findOne({ name, url: fullUrl });
        if (exists) continue;

        const image = $(el).find('img').attr('src');
        const categoriesText = $(el).find('h3.p_id').text();
        const categories = categoriesText.split(',').map(c => c.trim()).filter(Boolean);

        const details = await getRestaurantDetails(fullUrl);
        const imageLinks = await getImageLinks(fullUrl);

        const newRestaurant = new Restaurant({
          name,
          url: fullUrl,
          image,
          categories,
          imageLinks,
          ...details
        });
        try {
          await newRestaurant.save();
          console.log(`✅ تم حفظ: ${name}`);
        } catch (err) {
          if (err.code === 11000) {
            console.log(`⚠️ المطعم موجود بالفعل: ${name}`);
          } else {
            console.error(`❌ خطأ أثناء حفظ ${name}:`, err);
          }
        }
      }

      page++;
    }

    console.log(`🎉 تم الانتهاء من جمع كل الصفحات.`);
    await mongoose.disconnect();

  } catch (err) {
    console.error('❌ حصل خطأ أثناء السحب:', err);
  }
}


scrapeRestaurants();
 