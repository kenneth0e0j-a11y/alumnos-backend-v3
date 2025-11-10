const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '8h';

/**
 * Registro de usuario.
 * Admite:
 *  - roles: array de ObjectIds (strings) de roles existentes
 *  - rolesByName: array de nombres de rol (ADMIN, PSICOLOGO, ...)
 * Si ambos vienen, roles tiene prioridad.
 */
exports.register = async (req, res, next) => {
  try {
    const { username, password, roles, rolesByName, legacyRoles } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'username y password requeridos' });
    }
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: 'Usuario ya existe' });

    let roleIds = [];
    if (Array.isArray(roles) && roles.length) {
      roleIds = roles; // asumimos son ids válidos
    } else if (Array.isArray(rolesByName) && rolesByName.length) {
      const roleDocs = await Role.find({ name: { $in: rolesByName.map(r => r.toUpperCase()) } }, '_id').lean();
      roleIds = roleDocs.map(r => r._id);
    }

    const u = new User({ username, roles: roleIds, legacyRoles });
    u.password = password; // virtual → hash
    await u.save();

    res.status(201).json({ id: u._id, username: u.username, roles: roleIds });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const u = await User.findOne({ username }).lean(); // lean to speed up
    if (!u) return res.status(401).json({ message: 'Credenciales inválidas' });

    // convert lean doc to model for method? we hashed on save, so compare manually:
    const hash = u.passwordHash;
    const ok = await bcrypt.compare(password, hash);
    if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });

    const token = jwt.sign({ sub: u._id, roles: u.roles }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ token, user: { id: u._id, username: u.username, roles: u.roles } });
  } catch (err) { next(err); }
};
