import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { ValidationError, UnauthorizedError } from '../utils/errors.js';

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function safeUser(user) {
  if (!user) return null;
  const { password, remember_token, ...rest } = user;
  return rest;
}

/** POST /api/register */
export function register(req, res, next) {
  try {
    const {
      name,
      email,
      phone,
      password,
      password_confirmation,
      role,
      organization_name,
      city,
      terms,
      bio,
      skills,
      availability,
      experience_level,
    } = req.body;
    const errors = {};

    if (!name) errors.name = ['Le nom complet est obligatoire.'];
    if (!email) errors.email = ["L'adresse e-mail est obligatoire."];
    if (!password) errors.password = ['Le mot de passe est obligatoire.'];
    if (password && password.length < 8) errors.password = ['Le mot de passe doit comporter au moins 8 caractères.'];
    if (password !== password_confirmation) errors.password_confirmation = ['La confirmation du mot de passe ne correspond pas.'];
    if (!role || !['association', 'enterprise', 'volunteer'].includes(role)) errors.role = ['Le type de compte est obligatoire.'];
    if (['association', 'enterprise'].includes(role) && !organization_name) errors.organization_name = ["Le nom de l'organisation est obligatoire."];
    if (['association', 'enterprise'].includes(role) && !city) errors.city = ['La ville est obligatoire.'];
    if (!terms) errors.terms = ["Vous devez accepter les conditions d'utilisation."];

    if (Object.keys(errors).length > 0) throw new ValidationError('Validation échouée.', errors);

    const normalizedEmail = email.toLowerCase().trim();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) throw new ValidationError('Validation échouée.', { email: ['Cette adresse e-mail est déjà utilisée.'] });

    const hashed = bcrypt.hashSync(password, 12);
    const now = new Date().toISOString();

    const result = db.prepare(`
      INSERT INTO users (
        name, email, phone, password, role, organization_name, city, status,
        bio, skills, availability, experience_level, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?)
    `).run(
      name,
      normalizedEmail,
      phone || null,
      hashed,
      role,
      ['association', 'enterprise'].includes(role) ? (organization_name || null) : null,
      city || null,
      bio || null,
      skills || null,
      availability || null,
      experience_level || null,
      now, now
    );

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = generateToken(user.id);

    return res.status(201).json({
      message: 'Inscription réussie ! Bienvenue sur EventPartner.',
      token,
      user: safeUser(user),
    });
  } catch (err) {
    next(err);
  }
}

/** POST /api/login */
export function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const errors = {};
    if (!email) errors.email = ["L'adresse e-mail est obligatoire."];
    if (!password) errors.password = ['Le mot de passe est obligatoire.'];
    if (Object.keys(errors).length) throw new ValidationError('Validation échouée.', errors);

    const normalizedEmail = email.toLowerCase().trim();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({
        message: 'Adresse e-mail ou mot de passe incorrect.',
        errors: { email: ["Les identifiants fournis ne correspondent à aucun compte actif."] },
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        message: "Votre compte est suspendu. Veuillez contacter l'équipe support d'EventPartner.",
        status: 'suspended',
      });
    }

    const token = generateToken(user.id);
    return res.json({ message: 'Connexion réussie.', token, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
}

/** POST /api/logout */
export function logout(req, res) {
  // Stateless JWT – client simply discards the token
  res.json({ message: 'Déconnexion effectuée avec succès.' });
}

/** GET /api/user  and  GET /api/me */
export function me(req, res) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (user && user.status === 'suspended') {
    return res.status(403).json({ message: 'Votre compte a été suspendu.', status: 'suspended' });
  }
  res.json({ user: safeUser(user) });
}

/** POST /api/forgot-password */
export function forgotPassword(req, res) {
  // Generic response to avoid account enumeration (same as Laravel implementation)
  res.json({ message: "Si cette adresse correspond à un compte, un lien de réinitialisation vous a été envoyé par e-mail." });
}
