const { google } = require('googleapis');
const { PassThrough } = require('stream');

function bufferToStream(buf) {
  const pt = new PassThrough();
  pt.end(buf);
  return pt;
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);
oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth: oauth2Client });

async function uploadBufferToDrive(buffer, filename, mimeType) {
  const stream = bufferToStream(buffer);
  const parents = process.env.GOOGLE_DRIVE_FOLDER_ID
    ? [process.env.GOOGLE_DRIVE_FOLDER_ID]
    : undefined;

  const { data } = await drive.files.create({
    requestBody: { name: filename, parents },
    media: { mimeType, body: stream },
    fields: 'id,name,mimeType,size,webViewLink,webContentLink'
  });

  await drive.permissions.create({
    fileId: data.id,
    requestBody: { role: 'reader', type: 'anyone' }
  });

  return data;
}

async function deleteDriveFile(driveFileId) {
  if (!driveFileId) return;
  try {
    await drive.files.delete({ fileId: driveFileId });
    return true;
  } catch (err) {
    console.error('deleteDriveFile error:', err.message || err);
    return false;
  }
}

// NUEVO: obtener metadata + stream
async function getDriveFileStream(fileId) {
  const metaRes = await drive.files.get({
    fileId,
    fields: 'id,name,mimeType,size'
  });

  const streamRes = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  );

  return { meta: metaRes.data, stream: streamRes.data };
}

module.exports = {
  uploadBufferToDrive,
  deleteDriveFile,
  getDriveFileStream, // exporta
};
