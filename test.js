require('dotenv').config();
const { google } = require('googleapis');

(async () => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    const token = await oauth2Client.getAccessToken();
    console.log('Access token OK:', token.token ? 'yes' : 'no');

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const { data } = await drive.files.list({ pageSize: 1, fields: 'files(id,name)' });
    console.log('Drive list OK:', data.files);
  } catch (e) {
    console.error('FAIL:', e.response?.data || e.message);
  }
})();