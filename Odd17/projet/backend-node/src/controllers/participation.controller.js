import db from '../config/db.js';
import { ForbiddenError, NotFoundError, ConflictError, ValidationError } from '../utils/errors.js';

/** POST /api/events/:id/participate */
export function store(req, res, next) {
  try {
    const user = req.user;
    if (user.role !== 'volunteer' && user.role !== 'admin') {
      throw new ForbiddenError('Seuls les comptes bénévoles peuvent candidater à une mission.');
    }

    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!event) throw new NotFoundError('Événement introuvable.');

    if (event.registration_deadline && new Date() > new Date(event.registration_deadline)) {
      return res.status(422).json({ message: 'Les inscriptions pour cet événement sont closes.' });
    }

    const existing = db.prepare('SELECT * FROM participation_requests WHERE event_id = ? AND user_id = ?').get(event.id, user.id);
    if (existing) throw new ConflictError('Vous avez déjà soumis une demande de participation pour cet événement.');

    const { motivation, phone } = req.body;
    const now = new Date().toISOString();

    if (phone) {
      db.prepare('UPDATE users SET phone = ?, updated_at = ? WHERE id = ?').run(phone, now, user.id);
    }

    const result = db.prepare(`
      INSERT INTO participation_requests (event_id, user_id, motivation, status, created_at, updated_at)
      VALUES (?, ?, ?, 'pending', ?, ?)
    `).run(event.id, user.id, motivation || null, now, now);

    const participation = db.prepare('SELECT * FROM participation_requests WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      message: "Votre candidature a été envoyée avec succès à l'association organisatrice !",
      participation,
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/my-participations */
export function myParticipations(req, res, next) {
  try {
    const rows = db.prepare('SELECT * FROM participation_requests WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    const participations = rows.map(p => {
      const event = db.prepare('SELECT * FROM events WHERE id = ?').get(p.event_id);
      const category = event?.category_id ? db.prepare('SELECT * FROM categories WHERE id = ?').get(event.category_id) : null;
      const eventUser = event?.user_id ? db.prepare('SELECT id, name, email, role, organization_name FROM users WHERE id = ?').get(event.user_id) : null;
      return { ...p, event: event ? { ...event, category, user: eventUser } : null };
    });
    res.json({ participations });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/participations/:id/status */
export function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      throw new ValidationError('Statut invalide.', { status: ['Statut autorisé: pending, accepted, rejected'] });
    }

    const participation = db.prepare('SELECT * FROM participation_requests WHERE id = ?').get(id);
    if (!participation) throw new NotFoundError('Candidature introuvable.');

    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(participation.event_id);
    if (!event) throw new NotFoundError('Événement introuvable.');

    const user = req.user;
    if (user.role !== 'admin' && event.user_id !== user.id) {
      throw new ForbiddenError("Action non autorisée. Seul l'organisateur ou un admin peut modifier cette demande.");
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE participation_requests SET status = ?, updated_at = ? WHERE id = ?').run(status, now, id);

    const updated = db.prepare('SELECT * FROM participation_requests WHERE id = ?').get(id);
    res.json({
      message: `Candidature ${status === 'accepted' ? 'acceptée' : status === 'rejected' ? 'refusée' : 'mise à jour'} avec succès.`,
      participation: updated,
    });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/participations/:id */
export function destroy(req, res, next) {
  try {
    const { id } = req.params;
    const participation = db.prepare('SELECT * FROM participation_requests WHERE id = ?').get(id);
    if (!participation) throw new NotFoundError('Candidature introuvable.');

    const user = req.user;
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(participation.event_id);

    if (user.role !== 'admin' && participation.user_id !== user.id && event?.user_id !== user.id) {
      throw new ForbiddenError("Action non autorisée.");
    }

    db.prepare('DELETE FROM participation_requests WHERE id = ?').run(id);
    res.json({ message: 'Candidature supprimée avec succès.' });
  } catch (err) {
    next(err);
  }
}
