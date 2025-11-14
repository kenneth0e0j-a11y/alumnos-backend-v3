require('dotenv').config();
const mongoose = require('mongoose');
// Asegúrate de que estas rutas coincidan con tus nombres de archivo reales
const Role = require('./models/role.model'); 
const Permission = require('./models/permission.model');
const RolePermission = require('./models/role_permission.model'); 

// Los permisos que tu sistema necesita
const permissionsList = [
  { name: "alumno:create", description: "Crear alumnos" },
  { name: "alumno:read", description: "Ver alumnos" },
  { name: "alumno:update", description: "Editar alumnos" },
  { name: "alumno:delete", description: "Eliminar alumnos" },
  { name: "revision:create", description: "Crear revisiones" },
  { name: "revision:read", description: "Ver revisiones" },
  { name: "revision:update", description: "Editar revisiones" },
  { name: "revision:delete", description: "Eliminar revisiones" },
  { name: "user:read", description: "Ver usuarios" },
  { name: "role:read", description: "Ver roles" }
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a la Base de Datos');

    // 1. Buscar o crear el rol ADMIN
    // (Intenta buscarlo por nombre, si no existe lo crea)
    let adminRole = await Role.findOne({ name: "ADMIN" });
    if (!adminRole) {
        // Si no existe, intenta buscar "admin" en minúscula o créalo
        adminRole = await Role.findOne({ name: "admin" });
        if (!adminRole) {
            console.log('⚠️ No se encontró rol ADMIN, creándolo...');
            adminRole = await Role.create({ name: "ADMIN", description: "Administrador Total" });
        }
    }
    console.log(`🔹 Rol ADMIN ID: ${adminRole._id}`);

    // 2. Asignar TODOS los permisos al ADMIN
    for (const pData of permissionsList) {
      // Busca el permiso, si no existe lo crea
      let perm = await Permission.findOneAndUpdate(
        { name: pData.name }, 
        pData, 
        { upsert: true, new: true }
      );

      // Crea la relación en RolePermission si no existe
      const exists = await RolePermission.findOne({ role: adminRole._id, permission: perm._id });
      if (!exists) {
        await RolePermission.create({ role: adminRole._id, permission: perm._id });
        console.log(`   ➕ Permiso asignado: ${pData.name}`);
      } else {
        console.log(`   ✔️ Ya tenía: ${pData.name}`);
      }
    }

    console.log('✨ ¡PERMISOS REPARADOS! Ahora el Admin tiene acceso total.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

run();