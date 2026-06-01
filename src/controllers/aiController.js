import * as aiService from '../services/aiService.js';
import { mapAiError } from '../utils/aiErrors.js';
import { normalizeGeneratedTask, normalizePriority } from '../utils/taskNormalize.js';

const MAX_INPUT_LENGTH = 2000;

export const breakdown = async (req, res, next) => {
  try {
    const { input } = req.body;
    if (!input?.trim()) {
      return res.status(400).json({ message: 'Input is required.' });
    }
    if (input.length > MAX_INPUT_LENGTH) {
      return res.status(400).json({ message: `Input must be at most ${MAX_INPUT_LENGTH} characters.` });
    }

    const subtasks = await aiService.breakdownTask(input.trim());
    res.json({ subtasks });
  } catch (error) {
    console.error('AI breakdown error:', error);
    next(mapAiError(error));
  }
};

export const priority = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const suggestedPriority = await aiService.suggestPriority(
      title.trim(),
      description?.trim()
    );
    res.json({ priority: normalizePriority(suggestedPriority) });
  } catch (error) {
    console.error('AI priority error:', error);
    next(mapAiError(error));
  }
};

export const generate = async (req, res, next) => {
  try {
    const { input } = req.body;
    if (!input?.trim()) {
      return res.status(400).json({ message: 'Input is required.' });
    }
    if (input.length > MAX_INPUT_LENGTH) {
      return res.status(400).json({ message: `Input must be at most ${MAX_INPUT_LENGTH} characters.` });
    }

    const rawTasks = await aiService.generateTasksFromNL(input.trim());
    if (!Array.isArray(rawTasks) || rawTasks.length === 0) {
      return res.status(400).json({ message: 'AI did not return any tasks. Try a more specific prompt.' });
    }

    const tasks = rawTasks
      .map(normalizeGeneratedTask)
      .filter((t) => t.title.length > 0);

    if (tasks.length === 0) {
      return res.status(400).json({ message: 'AI did not return valid tasks. Try again.' });
    }

    res.json({ tasks });
  } catch (error) {
    console.error('AI generate error:', error);
    next(mapAiError(error));
  }
};
