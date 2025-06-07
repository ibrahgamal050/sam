const puppeteer = require('puppeteer');

async function searchDuckDuckGo(query) {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
    defaultViewport: null
  });

  const page = await browser.newPage();
  await page.goto('https://duckduckgo.com/');

  await page.type('input[name="q"]', query);
  await page.keyboard.press('Enter');

  // ننتظر ظهور النتائج الحقيقية (العناوين اللي فيها روابط)
  await page.waitForSelector('.result__title a');

  const results = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('.result__title a'));
    const data = [];

    for (let anchor of anchors) {
      const link = anchor.href;

      let category = 'Other';
      if (link.includes('facebook.com')) category = 'Facebook Page';
      else if (link.includes('instagram.com')) category = 'Instagram Page';
      else if (/\.(com|net|org|eg|sa)/.test(link)) category = 'Official Website';

      data.push({ link, category });
    }

    return data.slice(0, 10);
  });

  await browser.close();
  return results;
}

searchDuckDuckGo('مطعم البرنس').then(results => {
  if (results.length === 0) {
    console.log('🚫 مفيش نتائج.');
  } else {
    results.forEach(r => console.log(`${r.category}: ${r.link}`));
  }
}).catch(err => console.error('❌ حصل خطأ:', err));
