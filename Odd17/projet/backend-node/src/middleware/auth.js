import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { UnauthorizedError } from '../utils/errors.js';

/**
 * Middleware: verify JWT and attach req.user
 * Mirrors Laravel's auth:sanctum middleware
 */
export function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token non fourni.');
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.id);
    if (!user) throw new UnauthorizedError('Utilisateur introuvable.');

    if (user.status === 'suspended') {
      return res.status(403).json({
        message: 'Votre compte est suspendu.',
        status: 'suspended',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token invalide ou expiré.' });
    }
    next(err);
  }
}

/**
 * Optional auth – attaches req.user if token present, never throws
 */
export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.id) || null;
    }
  } catch {
    req.user = null;
  }
  next();
}
