import db from '../config/db.js';
import { seedODD17Events } from '../scripts/seed_odd17.js';

/** GET /api/ping */
export function ping(req, res) {
  try {
    const seedResult = seedODD17Events();
    const count = db.prepare('SELECT count(*) as cnt FROM events').get().cnt;
    const events = db.prepare('SELECT id, title, start_date, location, status FROM events').all();
    const cats = db.prepare('SELECT id, name, slug FROM categories').all();
    const users = db.prepare('SELECT id, name, email, role FROM users').all();
    res.json({
      status: 'ok',
      seedResult,
      total_events_in_db: count,
      events,
      categories: cats,
      users,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.json({ status: 'error', error: err.message, stack: err.stack });
  }
}
