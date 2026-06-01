import { Task } from '../models/Task.js';
import { shapeBulkTask } from '../utils/taskHelpers.js';

const BULK_LIMIT = 50;

export const getTasks = async (req, res, next) => {
  try {
    const { status, priority, category, search } = req.query;
    const filter = { userId: req.user._id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) {
      const safe = String(category).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.category = new RegExp(`^${safe}$`, 'i');
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

    if (!task) return res.status(404).json({ message: 'Task not found' });

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

    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

export const bulkCreateTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body;

    if (!Array.isArray(tasks) || !tasks.length) {
      return res.status(400).json({ message: 'Send a non-empty tasks array' });
    }
    if (tasks.length > BULK_LIMIT) {
      return res.status(400).json({ message: `Max ${BULK_LIMIT} tasks per request` });
    }

    const prepared = [];
    for (const item of tasks) {
      try {
        prepared.push(shapeBulkTask(item, req.user._id));
      } catch (err) {
        return res.status(400).json({ message: err.message });
      }
    }

    const created = await Task.insertMany(prepared);
    res.status(201).json({ tasks: created, count: created.length });
  } catch (error) {
    next(error);
  }
};
