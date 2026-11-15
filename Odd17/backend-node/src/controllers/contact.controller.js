import db from '../config/db.js';
import { ValidationError } from '../utils/errors.js';

/** POST /api/contact */
export function store(req, res, next) {
  try {
    const { name, email, subject, message } = req.body;
    const errors = {};
    if (!name) errors.name = ['Votre nom est obligatoire.'];
    if (!email) errors.email = ['Votre adresse e-mail est obligatoire.'];
    if (!subject) errors.subject = ['Le sujet de votre message est obligatoire.'];
    if (!message || message.length < 10) errors.message = ['Votre message doit contenir au moins 10 caractères.'];
    if (Object.keys(errors).length) throw new ValidationError('Validation échouée.', errors);

    const now = new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO contact_messages (name, email, subject, message, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, email, subject, message, now, now);

    const contact = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      message: "Votre message a bien été envoyé ! Notre équipe vous répondra dans les plus brefs délais.",
      contact,
    });
  } catch (err) {
    next(err);
  }
}
