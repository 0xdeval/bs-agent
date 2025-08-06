import { PGlite } from '@electric-sql/pglite';
import { pgDump } from '@electric-sql/pglite-tools/pg_dump';

import fs from 'fs';

const dbPath = process.env.PGLITE_DATA_DIR || '.eliza';

if (!fs.existsSync(dbPath)) {
  console.error(`Database file not found on the following path: ${dbPath}`);
  process.exit(1);
}

console.log(`Exporting database from ${dbPath}`);

const db = await PGlite.create(dbPath);
const tables = await db.query("SELECT tablename FROM pg_tables WHERE schemaname='public';");
console.log(tables.rows);

const logs = await db.query('SELECT * FROM central_messages');

console.log(logs.rows);
