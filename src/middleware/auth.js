const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

/**
 * Valida token y adjunta req.user (lean doc)
 * NOTA: req.user.roles será array de ObjectIds (no populado aquí)
 */
async function authRequired(req, res, next) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Token requerido' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.sub).lean();
    if (!user || !user.enabled) return res.status(401).json({ message: 'Usuario inválido' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido', error: err.message });
  }
}

module.exports = { authRequired };
