import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');
const dbPath = path.resolve(projectRoot, process.env.DB_PATH || './database.sqlite');

if (!fs.existsSync(dbPath)) {
  console.error(`[DB] SQLite file not found at: ${dbPath}`);
  console.error('[DB] Set DB_PATH in .env to point at the correct database.sqlite file.');
  process.exit(1);
}

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

console.log(`[DB] Connected to SQLite: ${dbPath}`);

export default db;
