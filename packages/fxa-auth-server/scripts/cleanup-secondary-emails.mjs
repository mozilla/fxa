#!/usr/bin/env node

/*
Args:
  --execute               Perform deletions (default is dry-run)
  --batch-size=N          Max rows per batch (default 500)
  --sleep-sec=N           Seconds to sleep between batches (default 2)
*/

import fs from 'fs';
import path from 'path';
import { setTimeout as sleep } from 'timers/promises';
import mysql from 'mysql2/promise';

function parseArgs(argv) {
  let dryRun = true; // default to dry-run
  let batchSize = 500;
  let sleepSec = 2;
  const args = argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--execute') {
      dryRun = false;
      continue;
    }
    if (a.startsWith('--batch-size=')) {
      const v = parseInt(a.split('=')[1]);
      if (v > 0) batchSize = v;
      continue;
    }
    if (a.startsWith('--sleep-sec=')) {
      const v = parseInt(a.split('=')[1]);
      if (v >= 0) sleepSec = v;
      continue;
    }
  }
  return { dryRun, batchSize, sleepSec };
}

async function main() {
  const { dryRun, batchSize, sleepSec } = parseArgs(process.argv);
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
  csvStream.write(['batchId', 'id', 'createdAtISO', 'email'].join(',') + '\n');

  let totalCandidates = 0;
  let totalDeleted = 0;
  let lastId = 0;
  let batchId = 0;
  const start = Date.now();

  console.log(`[${new Date().toISOString()}] Starting cleanup-secondary-emails:
host=${cfg.host} db=${cfg.database} port=${cfg.port} dryRun=${dryRun} batchSize=${batchSize} sleepSec=${sleepSec}`);

  try {
    while (true) {
      batchId += 1;
      const [rows] = await pool.query(
        `SELECT id, email, createdAt
         FROM emails
         WHERE isVerified = 0
           AND verifiedAt IS NULL
           AND isPrimary = 0
           AND id > ?
         ORDER BY id ASC
         LIMIT ?`,
        [lastId, batchSize]
      );

      const candidates = rows;
      if (!candidates || candidates.length === 0) {
        break;
      }

      const ids = candidates.map((r) => r.id);

      for (const r of candidates) {
        const createdAtMs = Number(r.createdAt);
        csvStream.write([
          batchId,
          r.id,
          new Date(createdAtMs).toISOString(),
          r.email,
        ].join(',') + '\n');
      }

      totalCandidates += candidates.length;

      if (!dryRun) {
        const deleteSql = `DELETE FROM emails WHERE id IN (${ids.map(() => '?').join(',')})`;
        const [res] = await pool.query(deleteSql, ids);
        const affected = res.affectedRows;
        totalDeleted += affected;
      }

      const last = candidates[candidates.length - 1];
      lastId = Number(last.id);

      await sleep(sleepSec * 1000);
    }
  } finally {
    csvStream.end();
    await pool.end();
  }

  console.log(`[${new Date().toISOString()}] Finished: candidates=${totalCandidates}, deleted=${totalDeleted}, durationMs=${Date.now() - start}, csv=${csvPath}`);
}

main().catch((err) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, err && err.stack ? err.stack : err);
  process.exitCode = 1;
});
