require('dotenv').config();
const { connectDB } = require('./config/db');
const app = require('./app');

(async function bootstrap() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI no definido. Crea .env basado en .env.example');
    }
    await connectDB(uri);
    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log(`🚀 Server escuchando en http://localhost:${port}`));
  } catch (err) {
    console.error('❌ No se pudo iniciar:', err);
    process.exit(1);
  }
})();
