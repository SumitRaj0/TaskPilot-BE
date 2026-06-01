import jwt from 'jsonwebtoken';

// Render sets RENDER=true; use production cookie rules whenever deployed
export const isDeployed =
  process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const cookieOptions = {
  httpOnly: true,
  secure: isDeployed,
  sameSite: isDeployed ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const clearCookieOptions = {
  httpOnly: true,
  secure: isDeployed,
  sameSite: isDeployed ? 'none' : 'lax',
};
