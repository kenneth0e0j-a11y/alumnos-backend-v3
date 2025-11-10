const Permission = require('../models/permission.model');

exports.createPermission = async (req, res, next) => {
  try {
    const { code, description, module, active } = req.body;
    if (!code) return res.status(400).json({ message: 'code requerido' });
    const exists = await Permission.findOne({ code });
    if (exists) return res.status(400).json({ message: 'Permiso ya existe' });
    const doc = await Permission.create({ code, description, module, active });
    res.status(201).json(doc);
  } catch (err) { next(err); }
};

exports.listPermissions = async (req, res, next) => {
  try {
    const docs = await Permission.find().lean();
    res.json(docs);
  } catch (err) { next(err); }
};
