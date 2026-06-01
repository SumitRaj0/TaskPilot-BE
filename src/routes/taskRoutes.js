import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  bulkCreateTasks,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { PRIORITIES, STATUSES } from '../models/Task.js';

const router = Router();

router.use(protect);

const dueDateValidator = body('dueDate')
  .optional({ nullable: true })
  .customSanitizer((value) => (value === '' ? null : value))
  .custom((value) => {
    if (value === null || value === undefined) return true;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new Error('Invalid due date');
    }
    return true;
  });

const createValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('category').optional().trim().isLength({ max: 100 }),
  body('priority').optional().isIn(PRIORITIES),
  body('status').optional().isIn(STATUSES),
  dueDateValidator,
];

const updateValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('category').optional().trim().isLength({ max: 100 }),
  body('priority').optional().isIn(PRIORITIES),
  body('status').optional().isIn(STATUSES),
  dueDateValidator,
];

const listQueryValidation = [
  query('status').optional().isIn(STATUSES).withMessage('Invalid status filter'),
  query('priority').optional().isIn(PRIORITIES).withMessage('Invalid priority filter'),
  query('category').optional().trim().isLength({ max: 100 }),
  query('search').optional().trim().isLength({ max: 200 }),
];

const bulkValidation = [
  body('tasks').isArray({ min: 1, max: 50 }).withMessage('Tasks must be an array (1–50 items)'),
  body('tasks.*.title').trim().notEmpty().withMessage('Each task must have a title'),
  body('tasks.*.description').optional().trim().isLength({ max: 2000 }),
  body('tasks.*.category').optional().trim().isLength({ max: 100 }),
];

router.get('/', listQueryValidation, validate, getTasks);
router.post('/', createValidation, validate, createTask);
router.post('/bulk', bulkValidation, validate, bulkCreateTasks);
router.put('/:id', updateValidation, validate, updateTask);
router.delete('/:id', deleteTask);

export default router;
