const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auth.controller');
// Para proteger registro, descomenta estas líneas:
// const { authRequired } = require('../middleware/auth');
// const { requirePermission } = require('../middleware/permissions-db');
// router.post('/register', authRequired, requirePermission(['user:manage']), ctrl.register);
router.post('/register', ctrl.register); // abierto para pruebas
router.post('/login', ctrl.login);
module.exports = router;
