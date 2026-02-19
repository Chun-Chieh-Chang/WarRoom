const Database = require('better-sqlite3');
const db = new Database('./data/system.db');

console.log('--- Experience Table ---');
const exps = db.prepare('SELECT * FROM experience').all();
console.log(`Count: ${exps.length}`);
if (exps.length > 0) console.log(exps[0]);

console.log('\n--- Actions Table ---');
const actions = db.prepare('SELECT * FROM actions').all();
console.log(`Count: ${actions.length}`);
if (actions.length > 0) console.log(actions[0]);

db.close();
