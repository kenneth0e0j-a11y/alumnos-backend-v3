const mongoose = require('mongoose');

async function connectDB(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    autoIndex: true,
    maxPoolSize: 10,
  });
  console.log('✅ MongoDB conectado');
}

module.exports = { connectDB };
