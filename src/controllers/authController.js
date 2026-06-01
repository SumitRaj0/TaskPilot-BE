import { User } from '../models/User.js';
import {
  generateToken,
  cookieOptions,
  clearCookieOptions,
} from '../utils/generateToken.js';

function toPublicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function sendAuth(res, user, status = 200) {
  const token = generateToken(user._id);
  res.cookie('token', token, cookieOptions);
  // Token in body helps when frontend and API are on different domains (Vercel + Render)
  res.status(status).json({ user: toPublicUser(user), token });
}

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = await User.create({ name, email, password });
    sendAuth(res, user, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    sendAuth(res, user);
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', clearCookieOptions);
  res.json({ message: 'Logged out' });
};

export const getMe = (req, res) => {
  res.json({ user: toPublicUser(req.user) });
};
