const Role = require('../models/role.model');
const Permission = require('../models/permission.model');
const RolePermission = require('../models/role_permission.model');

// crea rol + asigna permisos opcionales (array de permission codes)
exports.createRole = async (req, res, next) => {
  try {
    const { name, description, permissions } = req.body;
    if (!name) return res.status(400).json({ message: 'name requerido' });

    const role = await Role.create({
      name: name.toUpperCase(),
      description,
    });

    if (Array.isArray(permissions) && permissions.length) {
      const permDocs = await Permission.find({ code: { $in: permissions } }, '_id').lean();
      const bulk = permDocs.map(p => ({ role: role._id, permission: p._id }));
      if (bulk.length) await RolePermission.insertMany(bulk);
    }

    res.status(201).json(role);
  } catch (err) { next(err); }
};

exports.listRoles = async (req, res, next) => {
  try {
    const roles = await Role.find().lean();
    // traer permisos asociados
    const rp = await RolePermission.find({ role: { $in: roles.map(r => r._id) } }).lean();
    const permIds = rp.map(x => x.permission);
    const perms = await Permission.find({ _id: { $in: permIds } }).lean();
    const permById = new Map(perms.map(p => [String(p._id), p.code]));

    const rolesOut = roles.map(r => {
      const codes = rp.filter(x => String(x.role) === String(r._id)).map(x => permById.get(String(x.permission)));
      return { ...r, permissions: codes };
    });
    res.json(rolesOut);
  } catch (err) { next(err); }
};

exports.updateRole = async (req, res, next) => {
  try {
    const { description, active, permissions } = req.body;
    const updates = {};
    if (description !== undefined) updates.description = description;
    if (active !== undefined) updates.active = active;
    const role = await Role.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!role) return res.status(404).json({ message: 'Rol no encontrado' });

    if (Array.isArray(permissions)) {
      // reemplazar permisos en pivot
      await RolePermission.deleteMany({ role: role._id });
      if (permissions.length) {
        const permDocs = await Permission.find({ code: { $in: permissions } }, '_id').lean();
        const bulk = permDocs.map(p => ({ role: role._id, permission: p._id }));
        if (bulk.length) await RolePermission.insertMany(bulk);
      }
    }

    res.json(role);
  } catch (err) { next(err); }
};
