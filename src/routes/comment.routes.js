const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/comment.controller');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const { createCommentSchema, updateCommentSchema } = require('../validators/comment.validator');

// Proteksi seluruh route komentar dengan JWT authentication
router.use(authenticate);

router.get('/', ctrl.listComments);
router.get('/:id', ctrl.getComment);
router.post('/', validate(createCommentSchema, 'body'), ctrl.createComment);
router.patch('/:id', validate(updateCommentSchema, 'body'), ctrl.updateComment);
router.delete('/:id', ctrl.deleteComment);

module.exports = router;