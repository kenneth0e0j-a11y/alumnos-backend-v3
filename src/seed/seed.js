require('dotenv').config();
const { connectDB } = require('../config/db');
const Permission = require('../models/permission.model');
const Role = require('../models/role.model');
const RolePermission = require('../models/role_permission.model');
const User = require('../models/user.model');

(async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI no definido');
    await connectDB(uri);

    // Permisos base
    const permCodes = [
      'alumno:create','alumno:read','alumno:update','alumno:delete',
      'revision:create','revision:read','revision:update','revision:delete',
      'user:manage'
    ];
    const permDocs = [];
    for (const code of permCodes) {
      const doc = await Permission.findOneAndUpdate(
        { code },
        { $setOnInsert: { code, description: code } },
        { upsert: true, new: true }
      );
      permDocs.push(doc);
    }
    const permMap = new Map(permDocs.map(p => [p.code, p._id]));

    // Roles base
    async function upsertRole(name, description) {
      return Role.findOneAndUpdate(
        { name },
        { $setOnInsert: { name, description } },
        { upsert: true, new: true }
      );
    }
    const adminRole = await upsertRole('ADMIN', 'Acceso total');
    const psicoRole = await upsertRole('PSICOLOGO', 'Puede gestionar revisiones y ver alumnos');
    const docenteRole = await upsertRole('DOCENTE', 'Puede ver alumnos y revisiones');
    const userRole = await upsertRole('USER', 'Acceso lectura básica');

    // helper assign perms
    async function assign(role, codes) {
      await RolePermission.deleteMany({ role: role._id });
      const docs = codes.map(c => ({ role: role._id, permission: permMap.get(c) }));
      if (docs.length) await RolePermission.insertMany(docs);
    }

    await assign(adminRole, permCodes);
    await assign(psicoRole, ['alumno:read','revision:create','revision:read','revision:update']);
    await assign(docenteRole, ['alumno:read','revision:read']);
    await assign(userRole, ['alumno:read','revision:read']);

    // Usuario admin inicial (si no existe)
    const adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      const u = new User({ username: 'admin', roles: [adminRole._id] });
      u.password = '123456';
      await u.save();
      console.log('✅ Usuario admin creado (user: admin / pass: 123456)');
    } else {
      console.log('ℹ️ Usuario admin ya existe');
    }

    console.log('✅ Seed completo');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seed:', err);
    process.exit(1);
  }
})();
