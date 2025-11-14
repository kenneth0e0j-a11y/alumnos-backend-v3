require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// Asegúrate que la ruta al modelo sea correcta (puede ser user.model.js)
const User = require('./models/user.model'); 

const TARGET_USER = "PSICOLOGO"; // El usuario al que le cambiarás la clave
const NEW_PASSWORD = "123456";   // La nueva contraseña

const run = async () => {
  try {
    // 1. Conectar a Mongo Atlas (Asegúrate que tu .env tenga la URI de la nube)
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB Atlas');

    // 2. Buscar al usuario
    const user = await User.findOne({ username: TARGET_USER });
    
    if (!user) {
      console.log(`❌ El usuario "${TARGET_USER}" no existe.`);
      process.exit(1);
    }

    console.log(`🔹 Usuario encontrado: ${user._id}`);

    // 3. Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(NEW_PASSWORD, salt);

    // 4. Guardar en el campo correcto (passwordHash)
    user.passwordHash = hash; 
    await user.save();

    console.log(`✨ ¡ÉXITO! La contraseña de "${TARGET_USER}" ahora es: ${NEW_PASSWORD}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

run();