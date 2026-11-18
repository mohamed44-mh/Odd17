import db from '../config/db.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import { slugify, randomString } from '../utils/helpers.js';
import { seedODD17Events } from '../scripts/seed_odd17.js';

function enrichEvents(rows) {
  return rows.map(e => enrichEvent(e));
}

function enrichEvent(e) {
  if (!e) return null;
  const category = e.category_id ? db.prepare('SELECT * FROM categories WHERE id = ?').get(e.category_id) : null;
  const user = e.user_id ? db.prepare('SELECT id, name, email, phone, role, organization_name, city, avatar FROM users WHERE id = ?').get(e.user_id) : null;
  const acceptedParticipationsCount = db.prepare("SELECT COUNT(*) as cnt FROM participation_requests WHERE event_id = ? AND status = 'accepted'").get(e.id).cnt;
  const acceptedPartnershipsCount = db.prepare("SELECT COUNT(*) as cnt FROM partnership_requests WHERE event_id = ? AND status = 'accepted'").get(e.id).cnt;
  return { ...e, category, user, accepted_participations_count: acceptedParticipationsCount, accepted_partnerships_count: acceptedPartnershipsCount };
}

/** GET /api/events */
export function index(req, res, next) {
  try {
    // S'assurer que les événements ODD 17 Maroc sont bien insérés dans SQLite
    seedODD17Events();

    const { search, category_id, category_slug, city, date_filter, sort_by = 'date_asc', per_page = 20, page = 1 } = req.query;

    let conditions = ["(e.status = 'published' OR e.status IS NULL)"];
    const params = [];

    if (search) {
      conditions.push("(e.title LIKE ? OR e.description LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category_id) {
      conditions.push("e.category_id = ?");
      params.push(category_id);
    } else if (category_slug) {
      const cat = db.prepare('SELECT id FROM categories WHERE slug = ?').get(category_slug);
      if (cat) { conditions.push("e.category_id = ?"); params.push(cat.id); }
    }

    if (city) {
      conditions.push("e.location LIKE ?");
      params.push(`%${city}%`);
    }

    const now = new Date().toISOString().split('T')[0];
    if (date_filter === 'upcoming') {
      conditions.push("date(e.start_date) >= ?"); params.push(now);
    } else if (date_filter === 'past') {
      conditions.push("date(e.start_date) < ?"); params.push(now);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    let orderClause;
    switch (sort_by) {
      case 'date_desc': orderClause = 'e.start_date DESC'; break;
      case 'title_asc': orderClause = 'e.title ASC'; break;
      default: orderClause = 'e.start_date ASC';
    }

    const perPage = Math.max(1, parseInt(per_page, 10));
    const currentPage = Math.max(1, parseInt(page, 10));
    const offset = (currentPage - 1) * perPage;

    const totalRow = db.prepare(`SELECT COUNT(*) as cnt FROM events e ${where}`).get(...params);
    let total = totalRow.cnt;
    let rows = db.prepare(`SELECT e.* FROM events e ${where} ORDER BY ${orderClause} LIMIT ? OFFSET ?`).all(...params, perPage, offset);

    const enriched = enrichEvents(rows);
    const lastPage = Math.ceil(total / perPage) || 1;

    res.json({
      data: enriched,
      current_page: currentPage,
      per_page: perPage,
      total,
      last_page: lastPage,
      from: total === 0 ? 0 : offset + 1,
      to: Math.min(offset + perPage, total),
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/events/:idOrSlug */
export function show(req, res, next) {
  try {
    const { idOrSlug } = req.params;
    let event = db.prepare('SELECT * FROM events WHERE id = ? OR slug = ?').get(idOrSlug, idOrSlug);
    
    if (!event) throw new NotFoundError('Événement introuvable.');

    const category = event.category_id ? db.prepare('SELECT * FROM categories WHERE id = ?').get(event.category_id) : null;
    const user = db.prepare('SELECT id, name, email, phone, role, organization_name, city, avatar FROM users WHERE id = ?').get(event.user_id);
    const needs = db.prepare('SELECT * FROM event_needs WHERE event_id = ?').all(event.id);
    const acceptedParticipationsCount = db.prepare("SELECT COUNT(*) as cnt FROM participation_requests WHERE event_id = ? AND status = 'accepted'").get(event.id).cnt;
    const acceptedPartnershipsCount = db.prepare("SELECT COUNT(*) as cnt FROM partnership_requests WHERE event_id = ? AND status = 'accepted'").get(event.id).cnt;

    let userParticipation = null;
    let userPartnership = null;
    let eventParticipations = [];
    let eventPartnerships = [];

    if (req.user) {
      userParticipation = db.prepare('SELECT * FROM participation_requests WHERE event_id = ? AND user_id = ?').get(event.id, req.user.id) || null;
      userPartnership = db.prepare('SELECT * FROM partnership_requests WHERE event_id = ? AND user_id = ?').get(event.id, req.user.id) || null;

      // Si l'utilisateur est l'organisateur (créateur) ou admin, inclure la liste complète des candidatures avec infos de contact
      if (event.user_id === req.user.id || req.user.role === 'admin') {
        eventParticipations = db.prepare('SELECT * FROM participation_requests WHERE event_id = ? ORDER BY created_at DESC').all(event.id).map(p => {
          const u = db.prepare('SELECT id, name, email, phone, city, avatar, bio, skills, availability, experience_level, created_at FROM users WHERE id = ?').get(p.user_id);
          return { ...p, user: u };
        });

        eventPartnerships = db.prepare('SELECT * FROM partnership_requests WHERE event_id = ? ORDER BY created_at DESC').all(event.id).map(p => {
          const u = db.prepare('SELECT id, name, email, phone, city, organization_name, avatar FROM users WHERE id = ?').get(p.user_id);
          const need = p.event_need_id ? db.prepare('SELECT * FROM event_needs WHERE id = ?').get(p.event_need_id) : null;
          return { ...p, user: u, need };
        });
      }
    }

    res.json({
      event: {
        ...event,
        category,
        user,
        needs,
        accepted_participations_count: acceptedParticipationsCount,
        accepted_partnerships_count: acceptedPartnershipsCount,
        participations: eventParticipations,
        partnerships: eventPartnerships,
      },
      user_participation: userParticipation,
      user_partnership: userPartnership,
    });
  } catch (err) {
    next(err);
  }
}

/** POST /api/events */
export function store(req, res, next) {
  try {
    const user = req.user;
    if (user.role !== 'association' && user.role !== 'admin') {
      throw new ForbiddenError('Seules les associations et les administrateurs peuvent publier un événement.');
    }

    const { title, category_id, description, location, address, start_date, end_date, registration_deadline, max_volunteers, banner_image, needs = [] } = req.body;
    const errors = {};

    if (!title) errors.title = ['Le titre est obligatoire.'];
    if (!category_id) errors.category_id = ['Veuillez sélectionner une catégorie.'];
    if (!description || description.length < 30) errors.description = ['La description détaillée est requise (min 30 caractères).'];
    if (!location) errors.location = ['La ville est obligatoire.'];
    if (!start_date) errors.start_date = ['La date de début est requise.'];
    if (!end_date) errors.end_date = ['La date de fin est requise.'];

    if (Object.keys(errors).length) throw new ValidationError('Validation échouée.', errors);

    const catExists = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
    if (!catExists) throw new ValidationError('Validation échouée.', { category_id: ['Catégorie invalide.'] });

    const slug = `${slugify(title)}-${randomString(6)}`;
    const now = new Date().toISOString();

    const result = db.prepare(`
      INSERT INTO events (user_id, category_id, title, slug, description, location, address, start_date, end_date, registration_deadline, max_volunteers, banner_image, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)
    `).run(
      user.id, category_id, title, slug, description, location,
      address || null, start_date, end_date,
      registration_deadline || null,
      max_volunteers || 0,
      banner_image || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80',
      now, now
    );

    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);

    if (Array.isArray(needs) && needs.length > 0) {
      const insertNeed = db.prepare(`
        INSERT INTO event_needs (event_id, type, title, description, target_quantity, current_quantity, unit, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)
      `);
      for (const n of needs) {
        insertNeed.run(event.id, n.type, n.title, n.description || null, n.target_quantity, n.unit || null, now, now);
      }
    }

    const needsList = db.prepare('SELECT * FROM event_needs WHERE event_id = ?').all(event.id);
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(category_id);

    res.status(201).json({ message: 'Événement publié avec succès !', event: { ...event, category, needs: needsList } });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/events/:id */
export function update(req, res, next) {
  try {
    const user = req.user;
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!event) throw new NotFoundError('Événement introuvable.');
    if (event.user_id !== user.id && user.role !== 'admin') {
      throw new ForbiddenError("Action non autorisée. Vous n'êtes pas l'organisateur de cet événement.");
    }

    const { title, category_id, description, location, address, start_date, end_date, registration_deadline, max_volunteers, banner_image } = req.body;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE events SET title=?, category_id=?, description=?, location=?, address=?, start_date=?, end_date=?,
      registration_deadline=?, max_volunteers=?, banner_image=?, updated_at=? WHERE id=?
    `).run(
      title, category_id, description, location, address || null,
      start_date, end_date, registration_deadline || null,
      max_volunteers || 0, banner_image || event.banner_image, now, event.id
    );

    const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(event.id);
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(updated.category_id);
    const needs = db.prepare('SELECT * FROM event_needs WHERE event_id = ?').all(updated.id);

    res.json({ message: 'Événement mis à jour avec succès.', event: { ...updated, category, needs } });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/events/:id */
export function destroy(req, res, next) {
  try {
    const user = req.user;
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!event) throw new NotFoundError('Événement introuvable.');
    if (event.user_id !== user.id && user.role !== 'admin') {
      throw new ForbiddenError("Action non autorisée. Seul l'organisateur ou un admin peut supprimer cet événement.");
    }

    db.prepare('DELETE FROM events WHERE id = ?').run(event.id);
    res.json({ message: 'Événement supprimé avec succès.' });
  } catch (err) {
    next(err);
  }
}

/** GET /api/cities */
export function cities(req, res) {
  // Liste EXCLUSIVE des villes marocaines
  const moroccanCities = [
    'Agadir',
    'Casablanca',
    'Fès',
    'Kénitra',
    'Marrakech',
    'Ouarzazate',
    'Rabat',
    'Tanger'
  ];
  res.json({ cities: moroccanCities });
}
