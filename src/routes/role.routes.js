const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/role.controller');
const rpCtrl = require('../controllers/role_permission.controller');
const { authRequired } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions-db');

// CRUD de roles
router.post('/', authRequired, requirePermission(['user:manage']), ctrl.createRole);
router.get('/', authRequired, requirePermission(['user:manage']), ctrl.listRoles);
router.put('/:id', authRequired, requirePermission(['user:manage']), ctrl.updateRole);

// Añadir / quitar permiso puntual
router.post('/:roleId/permissions', authRequired, requirePermission(['user:manage']), rpCtrl.addPermissionToRole);
router.delete('/:roleId/permissions/:permissionCode', authRequired, requirePermission(['user:manage']), rpCtrl.removePermissionFromRole);



module.exports = router;
