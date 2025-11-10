const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/auth');
const { getUserPermissionsFromDB } = require('../middleware/permissions-db');

router.get('/me', authRequired, async (req, res, next) => {
  try {
    const perms = Array.from(await getUserPermissionsFromDB(req.user));
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        roles: req.user.roles,
        legacyRoles: req.user.legacyRoles,
        permissions: perms,
      }
    });
  } catch (err) { next(err); }
});

module.exports = router;
