import db from '../config/db.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../utils/errors.js';

/** POST /api/events/:id/partnerships */
export function store(req, res, next) {
  try {
    const user = req.user;
    if (user.role !== 'enterprise' && user.role !== 'admin') {
      throw new ForbiddenError('Seuls les comptes entreprises partenaires peuvent proposer un partenariat.');
    }

    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!event) throw new NotFoundError('Événement introuvable.');

    const { event_need_id, type, proposed_value, description } = req.body;
    const errors = {};
    if (!type || !['financial', 'material', 'skills'].includes(type)) errors.type = ['Le type de soutien est obligatoire.'];
    if (!description || description.length < 15) errors.description = ['Veuillez décrire le contenu de votre proposition (min 15 caractères).'];
    if (Object.keys(errors).length) throw new ValidationError('Validation échouée.', errors);

    if (event_need_id) {
      const need = db.prepare('SELECT id FROM event_needs WHERE id = ?').get(event_need_id);
      if (!need) throw new ValidationError('Validation échouée.', { event_need_id: ['Besoin invalide.'] });
    }

    const now = new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO partnership_requests (event_id, user_id, event_need_id, type, proposed_value, description, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `).run(event.id, user.id, event_need_id || null, type, proposed_value || null, description, now, now);

    const partnership = db.prepare('SELECT * FROM partnership_requests WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      message: "Votre offre de partenariat a été transmise à l'association !",
      partnership,
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/my-partnerships */
export function myPartnerships(req, res, next) {
  try {
    const rows = db.prepare('SELECT * FROM partnership_requests WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    const partnerships = rows.map(p => {
      const event = db.prepare('SELECT * FROM events WHERE id = ?').get(p.event_id);
      const category = event?.category_id ? db.prepare('SELECT * FROM categories WHERE id = ?').get(event.category_id) : null;
      const eventUser = event?.user_id ? db.prepare('SELECT id, name, email, role, organization_name FROM users WHERE id = ?').get(event.user_id) : null;
      const need = p.event_need_id ? db.prepare('SELECT * FROM event_needs WHERE id = ?').get(p.event_need_id) : null;
      return { ...p, event: event ? { ...event, category, user: eventUser } : null, need };
    });
    res.json({ partnerships });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/partnerships/:id/status */
export function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      throw new ValidationError('Statut invalide.', { status: ['Statut autorisé: pending, accepted, rejected'] });
    }

    const partnership = db.prepare('SELECT * FROM partnership_requests WHERE id = ?').get(id);
    if (!partnership) throw new NotFoundError('Proposition de partenariat introuvable.');

    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(partnership.event_id);
    if (!event) throw new NotFoundError('Événement introuvable.');

    const user = req.user;
    if (user.role !== 'admin' && event.user_id !== user.id) {
      throw new ForbiddenError("Action non autorisée. Seul l'organisateur ou un admin peut modifier ce partenariat.");
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE partnership_requests SET status = ?, updated_at = ? WHERE id = ?').run(status, now, id);

    const updated = db.prepare('SELECT * FROM partnership_requests WHERE id = ?').get(id);
    res.json({
      message: `Partenariat ${status === 'accepted' ? 'accepté' : status === 'rejected' ? 'refusé' : 'mis à jour'} avec succès.`,
      partnership: updated,
    });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/partnerships/:id */
export function destroy(req, res, next) {
  try {
    const { id } = req.params;
    const partnership = db.prepare('SELECT * FROM partnership_requests WHERE id = ?').get(id);
    if (!partnership) throw new NotFoundError('Proposition introuvable.');

    const user = req.user;
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(partnership.event_id);

    if (user.role !== 'admin' && partnership.user_id !== user.id && event?.user_id !== user.id) {
      throw new ForbiddenError("Action non autorisée.");
    }

    db.prepare('DELETE FROM partnership_requests WHERE id = ?').run(id);
    res.json({ message: 'Proposition supprimée avec succès.' });
  } catch (err) {
    next(err);
  }
}
