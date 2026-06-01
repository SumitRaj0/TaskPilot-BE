import { PRIORITIES, STATUSES } from '../models/Task.js';

export function fixPriority(value) {
  if (!value) return 'Medium';
  const found = PRIORITIES.find((p) => p.toLowerCase() === String(value).trim().toLowerCase());
  return found || 'Medium';
}

export function fixStatus(value) {
  if (!value) return 'Todo';
  const found = STATUSES.find((s) => s.toLowerCase() === String(value).trim().toLowerCase());
  return found || 'Todo';
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid due date');
  return date;
}

export function shapeAiTask(task) {
  return {
    title: String(task?.title || '').trim().slice(0, 200),
    description: String(task?.description || '').trim().slice(0, 2000),
    category: String(task?.category || 'General').trim().slice(0, 100) || 'General',
    priority: fixPriority(task?.priority),
    status: fixStatus(task?.status),
  };
}

export function shapeBulkTask(task, userId) {
  const title = String(task?.title || '').trim();
  if (!title) throw new Error('Each task needs a title');

  return {
    title: title.slice(0, 200),
    description: String(task?.description || '').trim().slice(0, 2000),
    category: String(task?.category || 'General').trim().slice(0, 100) || 'General',
    priority: fixPriority(task?.priority),
    status: fixStatus(task?.status),
    dueDate: task?.dueDate ? parseDate(task.dueDate) : null,
    userId,
  };
}
