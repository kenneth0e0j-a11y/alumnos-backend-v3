const RolePermission = require('../models/role_permission.model');
const Permission = require('../models/permission.model');

// agregar permiso puntual a rol
exports.addPermissionToRole = async (req, res, next) => {
  try {
    const { roleId } = req.params;
    const { permissionCode } = req.body;
    if (!permissionCode) return res.status(400).json({ message: 'permissionCode requerido' });

    const perm = await Permission.findOne({ code: permissionCode });
    if (!perm) return res.status(404).json({ message: 'Permiso no existe' });

    const doc = await RolePermission.findOneAndUpdate(
      { role: roleId, permission: perm._id },
      { $setOnInsert: { role: roleId, permission: perm._id } },
      { upsert: true, new: true }
    );
    res.status(201).json(doc);
  } catch (err) { next(err); }
};

// quitar permiso puntual de rol
exports.removePermissionFromRole = async (req, res, next) => {
  try {
    const { roleId, permissionCode } = req.params;
    const perm = await Permission.findOne({ code: permissionCode });
    if (!perm) return res.status(404).json({ message: 'Permiso no existe' });
    await RolePermission.deleteOne({ role: roleId, permission: perm._id });
    res.json({ removed: true });
  } catch (err) { next(err); }
};
