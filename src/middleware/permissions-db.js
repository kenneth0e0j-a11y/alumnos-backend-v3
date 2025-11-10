const Role = require('../models/role.model');
const Permission = require('../models/permission.model');
const RolePermission = require('../models/role_permission.model');

// Simple caché en memoria
let cache = {
  rolePerms: new Map(),    // roleId -> Set(permissionCode)
  permCodeById: new Map(), // permId -> code
  lastLoad: 0
};
const CACHE_TTL_MS = 60_000; // 1 min

async function ensurePermissionCache() {
  const now = Date.now();
  if (now - cache.lastLoad < CACHE_TTL_MS) return;

  cache.rolePerms.clear();
  cache.permCodeById.clear();

  const perms = await Permission.find({}, '_id code').lean();
  perms.forEach(p => cache.permCodeById.set(String(p._id), p.code));

  const pivots = await RolePermission.find({}, 'role permission').lean();
  pivots.forEach(rp => {
    const rid = String(rp.role);
    const pid = String(rp.permission);
    const code = cache.permCodeById.get(pid);
    if (!code) return;
    if (!cache.rolePerms.has(rid)) cache.rolePerms.set(rid, new Set());
    cache.rolePerms.get(rid).add(code);
  });

  cache.lastLoad = now;
}

/**
 * Devuelve Set de permisos efectivos de un usuario.
 * - Lee roles (ObjectIds) del user
 * - Usa caché rolePerms
 * - Añade legacy roles (map fijos)
 */
async function getUserPermissionsFromDB(user) {
  await ensurePermissionCache();

  const perms = new Set();
  const roleIds = (user.roles || []).map(r => String(r));
  roleIds.forEach(rid => {
    const set = cache.rolePerms.get(rid);
    if (set) set.forEach(code => perms.add(code));
  });

  // Legacy fallback (si aún tienes usuarios antiguos)
  (user.legacyRoles || []).forEach(strRole => {
    const upper = String(strRole).toUpperCase();
    if (upper === 'ADMIN') {
      perms.add('alumno:create'); perms.add('alumno:read'); perms.add('alumno:update'); perms.add('alumno:delete');
      perms.add('revision:create'); perms.add('revision:read'); perms.add('revision:update'); perms.add('revision:delete');
      perms.add('user:manage');
    }
  });
  return perms;
}

// AND
function requirePermission(requiredPerms = []) {
  return async (req, res, next) => {
    if (!req.user) return res.status(500).json({ message: 'authRequired debe ejecutarse antes' });
    try {
      const userPerms = await getUserPermissionsFromDB(req.user);
      const missing = requiredPerms.filter(p => !userPerms.has(p));
      if (missing.length) return res.status(403).json({ message: 'Permisos insuficientes', missing });
      next();
    } catch (err) { next(err); }
  };
}

// OR
function requireAnyPermission(options = []) {
  return async (req, res, next) => {
    if (!req.user) return res.status(500).json({ message: 'authRequired debe ejecutarse antes' });
    try {
      const userPerms = await getUserPermissionsFromDB(req.user);
      const ok = options.some(p => userPerms.has(p));
      if (!ok) return res.status(403).json({ message: 'Permisos insuficientes', requiredAnyOf: options });
      next();
    } catch (err) { next(err); }
  };
}

module.exports = {
  requirePermission,
  requireAnyPermission,
  getUserPermissionsFromDB,
  ensurePermissionCache,
};
