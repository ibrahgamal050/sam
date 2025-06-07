const axios = require('axios');

const API_KEY = 'AIzaSyChhVnvGYEwcYXQ49eE_T4vFgEQvq0WAcI';
const imageUrl = 'https://menuegypt.com/restaurants_menus/refaay_menu_3.jpg';

// دالة لتحليل النص وتحويله إلى منيو
function parseMenuFromOCR(rawText) {
  const lines = rawText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const menu = [];
  const priceRegex = /^[0-9]+$/;
  let tempItems = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (priceRegex.test(line)) {
      if (tempItems.length > 0) {
        const lastItem = tempItems.shift();
        menu.push({
          name: lastItem,
          price: parseInt(line)
        });
      }
    } else if (line.match(/[0-9]/)) {
      const match = line.match(/(.+?)\s+(\d{2,4})$/);
      if (match) {
        menu.push({
          name: match[1].trim(),
          price: parseInt(match[2])
        });
      } else {
        tempItems.push(line);
      }
    } else {
      tempItems.push(line);
    }
  }

  while (tempItems.length > 0) {
    const name = tempItems.shift();
    menu.push({ name, price: null });
  }

  return menu;
}

// الدالة الرئيسية
(async () => {
  try {
    // تحميل الصورة وتحويلها إلى base64
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const base64Image = Buffer.from(response.data, 'binary').toString('base64');

    const body = {
      requests: [
        {
          image: { content: base64Image },
          features: [{ type: 'TEXT_DETECTION' }]
        }
      ]
    };

    // إرسال إلى Google Vision
    const result = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`,
      body
    );

    const extractedText = result.data.responses[0].fullTextAnnotation.text;

    console.log('🔍 النص المستخرج:\n', extractedText);

    const menu = parseMenuFromOCR(extractedText);

    console.log('\n📋 المنيو المنظم:');
    console.log(menu);
  } catch (err) {
    console.error('❌ حصل خطأ:', err.response?.data || err.message);
  }
})();
