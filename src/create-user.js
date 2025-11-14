require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user.model'); 
const Role = require('./models/role.model'); 

const USERNAME = "PSICOLOGO";
const PASSWORD = "123456";
const ROL_NAME = "PSICOLOGO"; // El rol que debe tener

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a Atlas');

    // 1. Buscar el Rol para asignárselo
    const role = await Role.findOne({ name: ROL_NAME });
    if (!role) {
      console.log(`❌ El rol "${ROL_NAME}" no existe. Ejecuta primero fix-roles.js`);
      process.exit(1);
    }

    // 2. Verificar si el usuario ya existe
    let user = await User.findOne({ username: USERNAME });
    if (user) {
      console.log('⚠️ El usuario ya existe. Actualizando contraseña...');
    } else {
      console.log('✨ Creando usuario nuevo...');
      user = new User({ username: USERNAME, enabled: true });
    }

    // 3. Asignar Rol y Contraseña
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(PASSWORD, salt);
    user.roles = [role._id]; // Asignamos el ID del rol

    await user.save();

    console.log(`\n✅ ¡LISTO! Usuario: "${USERNAME}" / Contraseña: "${PASSWORD}"`);
    console.log('🚀 Ya puedes iniciar sesión en la web.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

run();