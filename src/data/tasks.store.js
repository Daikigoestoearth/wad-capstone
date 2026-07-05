let tasks = [
  { id: 1, title: 'Setup project', status: 'done', priority: 'high', createdAt: new Date().toISOString() },
  { id: 2, title: 'Belajar Express', status: 'in_progress', priority: 'high', createdAt: new Date().toISOString() }
];
let nextId = 3;

const store = {
  findAll: () => tasks,
  findById: (id) => tasks.find(t => t.id === Number(id)) || null,
  create: (payload) => {
    const task = { id: nextId++, ...payload, createdAt: new Date().toISOString() };
    tasks.push(task);
    return task;
  },
  remove: (id) => {
    const idx = tasks.findIndex(t => t.id === Number(id));
    if (idx === -1) return false;
    tasks.splice(idx, 1);
    return true;
  }
};

module.exports = store;