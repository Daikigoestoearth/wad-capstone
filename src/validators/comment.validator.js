const Joi = require('joi');

const createCommentSchema = Joi.object({
    content: Joi.string().min(1).max(1000).required().messages({
        'string.base': 'Komentar harus berupa teks.',
        'string.empty': 'Komentar tidak boleh kosong.',
        'string.max': 'Komentar maksimal 1000 karakter.',
        'any.required': 'Komentar wajib diisi.'
    }),
    taskId: Joi.number().integer().required().messages({
        'number.base': 'ID Task harus berupa angka.',
        'any.required': 'ID Task wajib disertakan.'
    })
});

const updateCommentSchema = Joi.object({
    content: Joi.string().min(1).max(1000).required().messages({
        'string.base': 'Komentar harus berupa teks.',
        'string.empty': 'Komentar tidak boleh kosong.',
        'string.max': 'Komentar maksimal 1000 karakter.',
        'any.required': 'Komentar baru wajib diisi.'
    })
});

module.exports = {
    createCommentSchema,
    updateCommentSchema
};