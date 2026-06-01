import { Task } from '../models/Task.js';
import { normalizeBulkTask } from '../utils/taskNormalize.js';

const MAX_BULK_TASKS = 50;

export const getTasks = async (req, res, next) => {
  try {
    const { status, priority, category, search } = req.query;
    const filter = { userId: req.user._id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) {
      const escaped = String(category).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.category = new RegExp(`^${escaped}$`, 'i');
    }
    if (search) filter.title = { $regex: search, $options: 'i' };

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json({ tasks, count: tasks.length });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const task = await Task.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const bulkCreateTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ message: 'Tasks array is required.' });
    }

    if (tasks.length > MAX_BULK_TASKS) {
      return res.status(400).json({
        message: `Cannot create more than ${MAX_BULK_TASKS} tasks at once.`,
      });
    }

    const normalized = [];
    for (const item of tasks) {
      try {
        normalized.push(normalizeBulkTask(item, req.user._id));
      } catch (err) {
        return res.status(400).json({
          message: err.message || 'Invalid task in bulk request.',
        });
      }
    }

    const created = await Task.insertMany(normalized, { ordered: true });
    res.status(201).json({ tasks: created, count: created.length });
  } catch (error) {
    next(error);
  }
};
