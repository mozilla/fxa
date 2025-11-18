#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import program from 'commander';

program
  .option('--execute', 'Perform deletions (default is dry-run)')
  .option('--limit <number>', 'Number of records to process', '100')
  .parse(process.argv);

const dryRun = !program.execute;
const limit = parseInt(program.limit, 10);

if (isNaN(limit) || limit <= 0) {
  console.error('Error: --limit must be a positive number');
  process.exit(1);
}

async function main() {
  const cfg = {
    host: process.env.MYSQL_HOST ?? 'localhost',
    user: process.env.MYSQL_USERNAME ?? 'root',
    password: process.env.MYSQL_PASSWORD ?? '',
    database: process.env.MYSQL_DATABASE ?? 'fxa',
    port: Number(process.env.MYSQL_PORT ?? 3306),
  };
  const pool = await mysql.createPool(cfg);

  const csvPath = path.join(process.cwd(), `cleanup-secondary-emails-${Date.now()}.csv`);
  const csvStream = fs.createWriteStream(csvPath, { encoding: 'utf8' });
  csvStream.write(['id', 'createdAtISO', 'email'].join(',') + '\n');

  const start = Date.now();

  console.log(`[${new Date().toISOString()}] Starting cleanup-secondary-emails:
host=${cfg.host} db=${cfg.database} port=${cfg.port} dryRun=${dryRun} limit=${limit}`);

  try {
    const [rows] = await pool.query(
      `SELECT id, email, createdAt
       FROM emails
       WHERE isVerified = 0
         AND verifiedAt IS NULL
         AND isPrimary = 0
       ORDER BY id ASC
       LIMIT ?`,
      [limit]
    );

    const candidates = rows;
    if (!candidates || candidates.length === 0) {
      console.log(`[${new Date().toISOString()}] No candidates found.`);
      return;
    }

    const ids = candidates.map((r) => r.id);

    for (const r of candidates) {
      const createdAtMs = Number(r.createdAt);
      csvStream.write([
        r.id,
        new Date(createdAtMs).toISOString(),
        JSON.stringify(r.email),
      ].join(',') + '\n');
    }

    let deleted = 0;
    if (!dryRun) {
      // mysql2 doesn't support arrays directly in IN clauses, so we build parameterized query with ? placeholders.
      // Values are passed via pool.query().
      const deleteSql = `DELETE FROM emails WHERE id IN (${ids.map(() => '?').join(',')})`;
      const [res] = await pool.query(deleteSql, ids);
      deleted = res.affectedRows;
    }

    console.log(`[${new Date().toISOString()}] Finished: candidates=${candidates.length}, deleted=${deleted}, durationMs=${Date.now() - start}, csv=${csvPath}`);
  } finally {
    csvStream.end();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, err && err.stack ? err.stack : err);
  process.exitCode = 1;
});
