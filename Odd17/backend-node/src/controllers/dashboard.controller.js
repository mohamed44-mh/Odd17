import db from '../config/db.js';
import { ForbiddenError } from '../utils/errors.js';

function safeUser(u) {
  if (!u) return null;
  const { password, remember_token, ...rest } = u;
  return rest;
}

/** GET /api/dashboard */
export function index(req, res, next) {
  try {
    const user = req.user;
    switch (user.role) {
      case 'association': return associationDashboard(user, res);
      case 'volunteer':   return volunteerDashboard(user, res);
      case 'enterprise':  return enterpriseDashboard(user, res);
      case 'admin':       return adminDashboard(user, res);
      default:            throw new ForbiddenError('Rôle non reconnu.');
    }
  } catch (err) {
    next(err);
  }
}

function associationDashboard(user, res) {
  const myEvents = db.prepare('SELECT * FROM events WHERE user_id = ? ORDER BY created_at DESC').all(user.id).map(e => {
    const category = e.category_id ? db.prepare('SELECT * FROM categories WHERE id = ?').get(e.category_id) : null;
    const needs = db.prepare('SELECT * FROM event_needs WHERE event_id = ?').all(e.id);
    const accepted_participations_count = db.prepare("SELECT COUNT(*) as cnt FROM participation_requests WHERE event_id = ? AND status = 'accepted'").get(e.id).cnt;
    const accepted_partnerships_count = db.prepare("SELECT COUNT(*) as cnt FROM partnership_requests WHERE event_id = ? AND status = 'accepted'").get(e.id).cnt;
    return { ...e, category, needs, accepted_participations_count, accepted_partnerships_count };
  });

  const myEventIds = myEvents.map(e => e.id);
  if (!myEventIds.length) {
    return res.json({ role: 'association', stats: { my_events_count: 0, pending_participations_count: 0, accepted_volunteers_count: 0, pending_partnerships_count: 0, accepted_partnerships_count: 0, total_funds_received: 0 }, events: [], pending_participations: [], all_participations: [], pending_partnerships: [], all_partnerships: [] });
  }

  const placeholders = myEventIds.map(() => '?').join(',');

  const allParticipations = db.prepare(`SELECT * FROM participation_requests WHERE event_id IN (${placeholders}) ORDER BY created_at DESC`).all(...myEventIds).map(p => {
    const u = db.prepare('SELECT id, name, email, phone, city, role, avatar, bio, skills, availability, experience_level, created_at FROM users WHERE id = ?').get(p.user_id);
    const ev = db.prepare('SELECT id, title FROM events WHERE id = ?').get(p.event_id);
    return { ...p, user: u, event: ev };
  });

  const pendingParticipations = allParticipations.filter(p => p.status === 'pending');

  const allPartnerships = db.prepare(`SELECT * FROM partnership_requests WHERE event_id IN (${placeholders}) ORDER BY created_at DESC`).all(...myEventIds).map(p => {
    const u = db.prepare('SELECT id, name, email, phone, city, role, organization_name, avatar FROM users WHERE id = ?').get(p.user_id);
    const ev = db.prepare('SELECT id, title FROM events WHERE id = ?').get(p.event_id);
    const need = p.event_need_id ? db.prepare('SELECT * FROM event_needs WHERE id = ?').get(p.event_need_id) : null;
    return { ...p, user: u, event: ev, need };
  });

  const pendingPartnerships = allPartnerships.filter(p => p.status === 'pending');
  const totalFundsReceived = allPartnerships.filter(p => p.status === 'accepted' && p.type === 'financial').reduce((sum, p) => sum + (parseFloat(p.proposed_value) || 0), 0);

  res.json({
    role: 'association',
    stats: {
      my_events_count: myEvents.length,
      pending_participations_count: pendingParticipations.length,
      accepted_volunteers_count: allParticipations.filter(p => p.status === 'accepted').length,
      pending_partnerships_count: pendingPartnerships.length,
      accepted_partnerships_count: allPartnerships.filter(p => p.status === 'accepted').length,
      total_funds_received: totalFundsReceived,
    },
    events: myEvents,
    pending_participations: pendingParticipations,
    all_participations: allParticipations,
    pending_partnerships: pendingPartnerships,
    all_partnerships: allPartnerships,
  });
}

function volunteerDashboard(user, res) {
  const participations = db.prepare('SELECT * FROM participation_requests WHERE user_id = ? ORDER BY created_at DESC').all(user.id).map(p => {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(p.event_id);
    const category = event?.category_id ? db.prepare('SELECT * FROM categories WHERE id = ?').get(event.category_id) : null;
    const eventUser = event?.user_id ? db.prepare('SELECT id, name, role, organization_name FROM users WHERE id = ?').get(event.user_id) : null;
    return { ...p, event: event ? { ...event, category, user: eventUser } : null };
  });

  res.json({
    role: 'volunteer',
    stats: {
      total_applications: participations.length,
      accepted_count: participations.filter(p => p.status === 'accepted').length,
      pending_count: participations.filter(p => p.status === 'pending').length,
      rejected_count: participations.filter(p => p.status === 'rejected').length,
    },
    participations,
  });
}

function enterpriseDashboard(user, res) {
  const partnerships = db.prepare('SELECT * FROM partnership_requests WHERE user_id = ? ORDER BY created_at DESC').all(user.id).map(p => {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(p.event_id);
    const category = event?.category_id ? db.prepare('SELECT * FROM categories WHERE id = ?').get(event.category_id) : null;
    const eventUser = event?.user_id ? db.prepare('SELECT id, name, role, organization_name FROM users WHERE id = ?').get(event.user_id) : null;
    const need = p.event_need_id ? db.prepare('SELECT * FROM event_needs WHERE id = ?').get(p.event_need_id) : null;
    return { ...p, event: event ? { ...event, category, user: eventUser } : null, need };
  });

  const totalFundsCommitted = partnerships.filter(p => p.status === 'accepted' && p.type === 'financial').reduce((sum, p) => sum + (parseFloat(p.proposed_value) || 0), 0);

  res.json({
    role: 'enterprise',
    stats: {
      total_proposals: partnerships.length,
      accepted_count: partnerships.filter(p => p.status === 'accepted').length,
      pending_count: partnerships.filter(p => p.status === 'pending').length,
      total_funds_committed: totalFundsCommitted,
    },
    partnerships,
  });
}

function adminDashboard(user, res) {
  const usersCount = db.prepare('SELECT COUNT(*) as cnt FROM users').get().cnt;
  const eventsCount = db.prepare('SELECT COUNT(*) as cnt FROM events').get().cnt;
  const participationsCount = db.prepare('SELECT COUNT(*) as cnt FROM participation_requests').get().cnt;
  const partnershipsCount = db.prepare('SELECT COUNT(*) as cnt FROM partnership_requests').get().cnt;

  const allUsers = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all().map(safeUser);

  const allEvents = db.prepare('SELECT * FROM events ORDER BY created_at DESC').all().map(e => {
    const u = db.prepare('SELECT id, name, email, role, organization_name FROM users WHERE id = ?').get(e.user_id);
    const category = e.category_id ? db.prepare('SELECT * FROM categories WHERE id = ?').get(e.category_id) : null;
    const acceptedParticipations = db.prepare("SELECT COUNT(*) as cnt FROM participation_requests WHERE event_id = ? AND status = 'accepted'").get(e.id).cnt;
    const acceptedPartnerships = db.prepare("SELECT COUNT(*) as cnt FROM partnership_requests WHERE event_id = ? AND status = 'accepted'").get(e.id).cnt;
    return {
      ...e,
      user: u,
      category,
      accepted_participations_count: acceptedParticipations,
      accepted_partnerships_count: acceptedPartnerships,
    };
  });

  const allParticipations = db.prepare('SELECT * FROM participation_requests ORDER BY created_at DESC').all().map(p => {
    const u = db.prepare('SELECT id, name, email, phone, city, role, avatar, bio, skills, availability, experience_level, created_at FROM users WHERE id = ?').get(p.user_id);
    const ev = db.prepare('SELECT id, title, location, user_id FROM events WHERE id = ?').get(p.event_id);
    return { ...p, user: u, event: ev };
  });

  const allPartnerships = db.prepare('SELECT * FROM partnership_requests ORDER BY created_at DESC').all().map(p => {
    const u = db.prepare('SELECT id, name, email, phone, city, role, organization_name, avatar FROM users WHERE id = ?').get(p.user_id);
    const ev = db.prepare('SELECT id, title, location, user_id FROM events WHERE id = ?').get(p.event_id);
    const need = p.event_need_id ? db.prepare('SELECT * FROM event_needs WHERE id = ?').get(p.event_need_id) : null;
    return { ...p, user: u, event: ev, need };
  });

  res.json({
    role: 'admin',
    stats: {
      users_count: usersCount,
      events_count: eventsCount,
      participations_count: participationsCount,
      partnerships_count: partnershipsCount,
    },
    events: allEvents,
    participations: allParticipations,
    partnerships: allPartnerships,
    users: allUsers,
  });
}
