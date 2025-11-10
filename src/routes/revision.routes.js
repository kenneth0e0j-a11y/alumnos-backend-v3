const express = require('express');
const multer = require('multer');
const router = express.Router();
const ctrl = require('../controllers/revision.controller');
const { authRequired } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions-db');
const upload = multer({ storage: multer.memoryStorage() });


router.post('/' ,upload.array('files'), authRequired, requirePermission(['revision:create']), ctrl.createRevision);
router.get('/', authRequired, requirePermission(['revision:read']), ctrl.getRevisiones);
router.get('/:id', authRequired, requirePermission(['revision:read']), ctrl.getRevisionById);
router.put('/:id', authRequired, requirePermission(['revision:update']), ctrl.updateRevision);
router.delete('/:id', authRequired, requirePermission(['revision:delete']), ctrl.deleteRevision);

// NEW
router.post('/:id/files',
  authRequired,
  upload.array('files'),
  ctrl.uploadFiles
);

router.delete('/:id/files/:fileId',
  authRequired,
  ctrl.deleteFile
);

router.get('/:id/files/:fileId/view', ctrl.viewFile);


// --- ↓↓↓ AÑADE ESTA LÍNEA AQUÍ ↓↓↓ ---
router.get('/:id/pdf', authRequired, requirePermission(['revision:read']), ctrl.generarRevisionPDF);
// --- ↑↑↑ AÑADE ESA LÍNEA ↑↑↑ ---


module.exports = router;