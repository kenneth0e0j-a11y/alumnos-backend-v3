require('dotenv').config();
const { google } = require('googleapis');
const readline = require('readline');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost' // redirect simple
);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

(async () => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });
  console.log('1) Abre esta URL y autoriza:\n', url);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('\n2) Pega el "code": ', async (code) => {
    rl.close();
    try {
      const { tokens } = await oauth2Client.getToken(code.trim());
      console.log('\nREFRESH_TOKEN:', tokens.refresh_token);
      console.log('=> Copia eso a GOOGLE_REFRESH_TOKEN en tu .env');
    } catch (e) {
      console.error('ERROR:', e.response?.data || e.message);
    }
  });
})();
