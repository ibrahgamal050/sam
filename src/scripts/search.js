const { google } = require('googleapis');
const readline = require('readline');
const fs = require('fs');
const path = require('path'); // إضافة المسار

// إعداد الـ OAuth2Client
const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];
const TOKEN_PATH = 'token.json';

// تحميل بيانات الاعتماد
function loadCredentials() {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, 'credentials.json'), (err, content) => {
      if (err) {
        reject('Error loading credentials: ' + err);
        return;
      }
      const credentials = JSON.parse(content);
      resolve(credentials);
    });
  });
}

// إنشاء OAuth2Client
function authorize(credentials) {
  const { client_secret, client_id, redirect_uris } = credentials.web; // استخدام `web` بدلاً من `installed`
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]
  );

  // حاول تحميل التوكن إذا كان موجودًا
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      getNewToken(oAuth2Client); // إذا لم يوجد توكن، طلب كود التفويض
    } else {
      oAuth2Client.setCredentials(JSON.parse(token));
      listSearchQueries(oAuth2Client); // استدعاء دالة استخدام API بعد التوثيق
    }
  });
}

// طلب كود التفويض
function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter the code from that page here: ', (code) => {
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error('Error retrieving access token', err);
        return;
      }
      oAuth2Client.setCredentials(token);
      storeToken(token); // تخزين التوكن في ملف
      listSearchQueries(oAuth2Client); // استدعاء دالة استخدام API بعد التوثيق
      rl.close();
    });
  });
}

// تخزين التوكن في ملف
function storeToken(token) {
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) {
      console.error('Error storing the token', err);
    } else {
      console.log('Token stored to ' + TOKEN_PATH);
    }
  });
}

// استخدام API لجلب الكلمات البحثية
function listSearchQueries(auth) {
    const searchConsole = google.webmasters({ version: 'v3', auth });
    
    searchConsole.searchanalytics.query({
      siteUrl: 'sc-domain:meelza.com',  // تأكد من أن الموقع مسجل في Search Console
      requestBody: {
        startDate: '2025-04-01',
        endDate: '2025-04-25',
        dimensions: ['query', 'page'],  // إضافة 'page' و 'query' كأبعاد
        rowLimit: 100
      }
    }).then((res) => {
      const rows = res.data.rows;
      if (rows && rows.length) {
        console.log('Top search queries and pages:');
        rows.forEach((row) => {
          console.log(`Query: ${row.keys[0]}, Page: ${row.keys[1]}, Clicks: ${row.clicks}`);
        });
      } else {
        console.log('No data found.');
      }
    }).catch((err) => {
      console.error('Error fetching search queries: ', err);
    });
  }
  
// البدء في عملية التوثيق
loadCredentials()
  .then(credentials => authorize(credentials))
  .catch(err => console.log('Error loading credentials:', err));
