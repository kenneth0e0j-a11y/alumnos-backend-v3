const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/permission.controller');
const { authRequired } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions-db');

router.post('/', authRequired, requirePermission(['user:manage']), ctrl.createPermission);
router.get('/', authRequired, requirePermission(['user:manage']), ctrl.listPermissions);

module.exports = router;
