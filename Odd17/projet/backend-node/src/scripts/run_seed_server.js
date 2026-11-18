import express from 'express';
import db from '../config/db.js';
import { seedODD17Events } from './seed_odd17.js';

const app = express();
app.get('/run-seed', (req, res) => {
  const result = seedODD17Events();
  const allEvents = db.prepare('SELECT id, title, slug, location, status FROM events').all();
  res.json({ result, total: allEvents.length, events: allEvents });
});
app.listen(8001, () => {
  console.log('Seed runner listening on http://localhost:8001/run-seed');
});

