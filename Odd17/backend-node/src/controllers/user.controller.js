import db from '../config/db.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../utils/errors.js';

function safeUser(u) {
  if (!u) return null;
  const { password, remember_token, ...rest } = u;
  return rest;
}

/** GET /api/users (Admin only) */
export function index(req, res, next) {
  try {
    if (req.user.role !== 'admin') throw new ForbiddenError('Action réservée aux administrateurs.');
    const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all().map(safeUser);
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/users/:id/status (Admin only) */
export function updateStatus(req, res, next) {
  try {
    if (req.user.role !== 'admin') throw new ForbiddenError('Action réservée aux administrateurs.');
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      throw new ValidationError('Statut invalide.', { status: ['Statuts acceptés: active, suspended'] });
    }

    const targetUser = db.prepare('SELECT id, role FROM users WHERE id = ?').get(id);
    if (!targetUser) throw new NotFoundError('Utilisateur introuvable.');

    if (targetUser.id === req.user.id) {
      throw new ValidationError('Vous ne pouvez pas modifier le statut de votre propre compte.');
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE users SET status = ?, updated_at = ? WHERE id = ?').run(status, now, id);

    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    res.json({
      message: `Statut de l'utilisateur passé à "${status === 'active' ? 'Actif' : 'Suspendu'}".`,
      user: safeUser(updated),
    });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/users/:id (Admin only) */
export function destroy(req, res, next) {
  try {
    if (req.user.role !== 'admin') throw new ForbiddenError('Action réservée aux administrateurs.');
    const { id } = req.params;

    const targetUser = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!targetUser) throw new NotFoundError('Utilisateur introuvable.');

    if (targetUser.id === req.user.id) {
      throw new ValidationError('Vous ne pouvez pas supprimer votre propre compte administrateur.');
    }

    // Cascade delete user's events, participations, partnerships
    db.prepare('DELETE FROM participation_requests WHERE user_id = ?').run(id);
    db.prepare('DELETE FROM partnership_requests WHERE user_id = ?').run(id);
    db.prepare('DELETE FROM events WHERE user_id = ?').run(id);
    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    res.json({ message: 'Utilisateur et ses données associées supprimés avec succès.' });
  } catch (err) {
    next(err);
  }
}
