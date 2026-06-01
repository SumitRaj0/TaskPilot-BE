import { PRIORITIES, STATUSES } from '../models/Task.js';

export const normalizePriority = (value) => {
  if (!value) return 'Medium';
  const match = PRIORITIES.find((p) => p.toLowerCase() === String(value).trim().toLowerCase());
  return match || 'Medium';
};

export const normalizeStatus = (value) => {
  if (!value) return 'Todo';
  const match = STATUSES.find((s) => s.toLowerCase() === String(value).trim().toLowerCase());
  return match || 'Todo';
};

export const parseDueDate = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid due date');
  }
  return date;
};

export const normalizeGeneratedTask = (task) => ({
  title: String(task?.title || '').trim().slice(0, 200),
  description: String(task?.description || '').trim().slice(0, 2000),
  category: String(task?.category || 'General').trim().slice(0, 100) || 'General',
  priority: normalizePriority(task?.priority),
  status: normalizeStatus(task?.status),
});

export const normalizeBulkTask = (task, userId) => {
  const title = String(task?.title || '').trim();
  if (!title) {
    throw new Error('Each task must have a title');
  }

  return {
    title: title.slice(0, 200),
    description: String(task?.description || '').trim().slice(0, 2000),
    category: String(task?.category || 'General').trim().slice(0, 100) || 'General',
    priority: normalizePriority(task?.priority),
    status: normalizeStatus(task?.status),
    dueDate: task?.dueDate ? parseDueDate(task.dueDate) : null,
    userId,
  };
};
