const commentRepo = require('../repositories/comment.repository');

const listComments = async (req, res, next) => {
    try {
        const { taskId } = req.query;
        const comments = await commentRepo.findAll(taskId);
        res.json({ data: comments });
    } catch (err) {
        next(err);
    }
};

const getComment = async (req, res, next) => {
    try {
        const comment = await commentRepo.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({
                error: { code: 'NOT_FOUND', message: 'Komentar tidak ditemukan.' }
            });
        }
        res.json({ data: comment });
    } catch (err) {
        next(err);
    }
};

const createComment = async (req, res, next) => {
    try {
        // userId didapat dari middleware authenticate secara aman
        const userId = req.user.id; 
        const { content, taskId } = req.body;

        const newComment = await commentRepo.create({ content, taskId, userId });
        res.status(201).json({ data: newComment });
    } catch (err) {
        next(err);
    }
};

const updateComment = async (req, res, next) => {
    try {
        const comment = await commentRepo.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({
                error: { code: 'NOT_FOUND', message: 'Komentar tidak ditemukan.' }
            });
        }

        // Proteksi Otorisasi: Hanya pembuat komentar yang bisa mengedit
        if (comment.userId !== req.user.id) {
            return res.status(403).json({
                error: { code: 'FORBIDDEN', message: 'Anda tidak memiliki akses untuk mengubah komentar ini.' }
            });
        }

        const updated = await commentRepo.update(req.params.id, req.body);
        res.json({ data: updated, message: 'Komentar berhasil diperbarui.' });
    } catch (err) {
        next(err);
    }
};

const deleteComment = async (req, res, next) => {
    try {
        const comment = await commentRepo.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({
                error: { code: 'NOT_FOUND', message: 'Komentar tidak ditemukan.' }
            });
        }

        // Proteksi Otorisasi: Hanya pembuat komentar yang bisa menghapus
        if (comment.userId !== req.user.id) {
            return res.status(403).json({
                error: { code: 'FORBIDDEN', message: 'Anda tidak memiliki akses untuk menghapus komentar ini.' }
            });
        }

        await commentRepo.remove(req.params.id);
        res.json({ message: 'Komentar berhasil dihapus.' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    listComments,
    getComment,
    createComment,
    updateComment,
    deleteComment
};