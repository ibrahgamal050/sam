const { google } = require('googleapis');
const fs = require('fs');
const readline = require('readline');
const { OAuth2Client } = require('google-auth-library');

// تحميل بيانات OAuth 2.0 من ملف credentials.json
const credentials = JSON.parse(fs.readFileSync('./credentials.json'));

// إعداد OAuth2Client
const oAuth2Client = new OAuth2Client(
  credentials.web.client_id,
  credentials.web.client_secret,
  credentials.web.redirect_uris[0]
);

// تحديد نطاقات OAuth المطلوبة
const SCOPES = ['https://www.googleapis.com/auth/adwords']; // نطاق الوصول إلى Google Ads API

// تحديد ملف توكين المستخدم
const TOKEN_PATH = 'token.json';

// إذا كان لديك توكين سابق، قم بتحميله مباشرة
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // حفظ التوكين للوصول المستقبلي
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      callback(oAuth2Client);
    });
  });
}

// تحميل التوكين إذا كان موجودًا
fs.readFile(TOKEN_PATH, (err, token) => {
  if (err) {
    getAccessToken(oAuth2Client, authorize);
  } else {
    oAuth2Client.setCredentials(JSON.parse(token));
    authorize(oAuth2Client);
  }
});

// بعد التوثيق، يمكن استخدام Google Ads API
function authorize(oAuth2Client) {
  // هنا يمكنك استدعاء Google Ads API أو أي خدمات أخرى باستخدام OAuth 2.0.
  console.log('Authorization successful.');
}
