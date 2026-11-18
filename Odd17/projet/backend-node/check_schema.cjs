const Database = require('better-sqlite3');
const db = new Database('./database.sqlite');
console.log(JSON.stringify(db.prepare('PRAGMA table_info(users)').all(), null, 2));

