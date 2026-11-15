import db from '../config/db.js';

console.log('Categories:', db.prepare('SELECT id, name, slug FROM categories').all());
console.log('Users (associations/admins):', db.prepare("SELECT id, name, email, role FROM users WHERE role IN ('association', 'admin')").all());
console.log('Existing events:', db.prepare('SELECT id, title, start_date, location FROM events').all());

