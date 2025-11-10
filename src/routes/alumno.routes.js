const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/alumno.controller');
const { authRequired } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions-db');

router.post('/', authRequired, requirePermission(['alumno:create']), ctrl.createAlumno);
router.get('/', authRequired, requirePermission(['alumno:read']), ctrl.getAlumnos);
router.get('/:id', authRequired, requirePermission(['alumno:read']), ctrl.getAlumnoById);
router.put('/:id', authRequired, requirePermission(['alumno:update']), ctrl.updateAlumno);
router.delete('/:id', authRequired, requirePermission(['alumno:delete']), ctrl.deleteAlumno);

module.exports = router;
