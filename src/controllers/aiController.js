import * as aiService from '../services/aiService.js';
import { fixPriority, shapeAiTask } from '../utils/taskHelpers.js';

const MAX_INPUT = 2000;

function handleAiError(error) {
  if (error.message?.includes('OPENAI_API_KEY')) {
    return { statusCode: 503, message: error.message };
  }
  if (error.code === 'insufficient_quota' || error.status === 429) {
    return {
      statusCode: 503,
      message: 'OpenAI quota exceeded — add billing or use your own API key in server/.env',
    };
  }
  if (error.status === 401) {
    return { statusCode: 503, message: 'Invalid OpenAI API key in server/.env' };
  }
  return { statusCode: 502, message: 'AI request failed. Try again in a moment.' };
}

export const breakdown = async (req, res, next) => {
  try {
    const input = req.body.input?.trim();
    if (!input) return res.status(400).json({ message: 'Input is required' });
    if (input.length > MAX_INPUT) {
      return res.status(400).json({ message: 'Input is too long (max 2000 chars)' });
    }

    const subtasks = await aiService.breakdownTask(input);
    res.json({ subtasks });
  } catch (error) {
    console.error('breakdown failed:', error.message);
    next(handleAiError(error));
  }
};

export const priority = async (req, res, next) => {
  try {
    const title = req.body.title?.trim();
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const raw = await aiService.suggestPriority(title, req.body.description?.trim());
    res.json({ priority: fixPriority(raw) });
  } catch (error) {
    console.error('priority failed:', error.message);
    next(handleAiError(error));
  }
};

export const generate = async (req, res, next) => {
  try {
    const input = req.body.input?.trim();
    if (!input) return res.status(400).json({ message: 'Input is required' });
    if (input.length > MAX_INPUT) {
      return res.status(400).json({ message: 'Input is too long (max 2000 chars)' });
    }

    const raw = await aiService.generateTasksFromNL(input);
    if (!Array.isArray(raw) || !raw.length) {
      return res.status(400).json({ message: 'No tasks came back — try a clearer prompt' });
    }

    const tasks = raw.map(shapeAiTask).filter((t) => t.title);
    if (!tasks.length) {
      return res.status(400).json({ message: 'Could not parse tasks from AI response' });
    }

    res.json({ tasks });
  } catch (error) {
    console.error('generate failed:', error.message);
    next(handleAiError(error));
  }
};
