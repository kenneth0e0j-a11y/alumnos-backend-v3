require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('./models/role.model');
const Permission = require('./models/permission.model');
const RolePermission = require('./models/role_permission.model');

// CONFIGURACIÓN DE PERMISOS POR ROL
// Aquí defines qué puede hacer cada uno
const roleConfig = {
  "PSICOLOGO": [
    "alumno:read",       // Puede ver la lista de alumnos
    "revision:create",   // Puede crear revisiones
    "revision:read",     // Puede ver revisiones
    "revision:update",   // Puede editar revisiones
    "revision:delete"    // Puede borrar revisiones (quítalo si no quieres que borren)
  ],
  "DOCENTE": [
    "alumno:read",       // El docente solo puede ver alumnos (ejemplo)
    "revision:read"      // Y ver revisiones (ejemplo)
  ]
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a Atlas');

    // Recorremos la configuración (Psicólogo, Docente...)
    for (const [roleName, perms] of Object.entries(roleConfig)) {
      
      console.log(`\n🔍 Configurando rol: ${roleName}...`);

      // 1. Buscar el Rol
      const role = await Role.findOne({ name: roleName });
      if (!role) {
        console.log(`   ⚠️ El rol ${roleName} no existe en la BD. Saltando...`);
        continue;
      }

      // 2. Asignar cada permiso
      for (const permName of perms) {
        const permission = await Permission.findOne({ name: permName });
        
        if (!permission) {
          console.log(`   ⚠️ Permiso '${permName}' no encontrado (¿corriste el script anterior?).`);
          continue;
        }

        // Verificar si ya tiene el permiso
        const exists = await RolePermission.findOne({
          role: role._id,
          permission: permission._id
        });

        if (!exists) {
          await RolePermission.create({
            role: role._id,
            permission: permission._id
          });
          console.log(`   ➕ Asignado: ${permName}`);
        } else {
          console.log(`   ✔️ Ya tenía: ${permName}`);
        }
      }
    }

    console.log('\n✨ ¡ROLES ACTUALIZADOS! Los psicólogos ya deberían poder entrar.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

run();