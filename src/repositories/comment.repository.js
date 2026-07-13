const prisma = require('../config/prisma');

const findAll = async (taskId) => {
    return await prisma.comment.findMany({
        where: taskId ? { taskId: parseInt(taskId) } : {},
        include: {
            user: {
                select: { id: true, name: true, email: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

const findById = async (id) => {
    return await prisma.comment.findFirst({
        where: { id: parseInt(id) },
        include: {
            user: { select: { id: true, name: true } },
            task: { select: { id: true, title: true } }
        }
    });
};

const create = async (data) => {
    return await prisma.comment.create({
        data: {
            content: data.content,
            taskId: parseInt(data.taskId),
            userId: parseInt(data.userId)
        },
        include: {
            user: { select: { id: true, name: true } }
        }
    });
};

const update = async (id, data) => {
    return await prisma.comment.update({
        where: { id: parseInt(id) },
        data: { content: data.content }
    });
};

const remove = async (id) => {
    return await prisma.comment.delete({
        where: { id: parseInt(id) }
    });
};

module.exports = {
    findAll,
    findById,
    create,
    update,
    remove
};