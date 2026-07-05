// File: src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const { registerSchema, loginSchema, refreshSchema } = require('../validators/auth.validator');

router.post('/register', validate(registerSchema), ctrl.register);
router.post('/login', validate(loginSchema), ctrl.login);
router.post('/refresh', validate(refreshSchema), ctrl.refresh);
router.post('/logout', ctrl.logout);
router.get('/me', authenticate, ctrl.me);

module.exports = router;