/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const url = process.env.METERING_CLICKHOUSE_URL ?? 'http://127.0.0.1:8124';
const username = process.env.METERING_CLICKHOUSE_USERNAME ?? 'metering_rw';
const password =
  process.env.METERING_CLICKHOUSE_PASSWORD ?? 'local_metering_dev';
const database = process.env.METERING_CLICKHOUSE_DATABASE ?? 'metering';

const migrationsDir = path.dirname(fileURLToPath(import.meta.url));

async function run(sql, opts = {}) {
  const target = new URL(url);
  if (opts.database) {
    target.searchParams.set('database', opts.database);
  }
  if (opts.format) {
    target.searchParams.set('default_format', opts.format);
  }
  const headers = { 'X-ClickHouse-User': username };
  if (password) {
    headers['X-ClickHouse-Key'] = password;
  }
  const response = await fetch(target, { method: 'POST', headers, body: sql });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`ClickHouse responded ${response.status}: ${body.trim()}`);
  }
  return body;
}

function patchNumber(filename) {
  return Number(filename.split('_')[0]);
}

const { level } = JSON.parse(
  await fs.readFile(path.join(migrationsDir, 'target-patch.json'), 'utf8')
);

const patches = (await fs.readdir(migrationsDir))
  .filter((name) => /^\d{3}_.*\.sql$/.test(name))
  .sort();

await run(`CREATE DATABASE IF NOT EXISTS ${database}`);
await run(
  `CREATE TABLE IF NOT EXISTS schema_migrations
   (
       name       String,
       applied_at DateTime('UTC') DEFAULT now()
   )
   ENGINE = MergeTree
   ORDER BY name`,
  { database }
);

const applied = new Set(
  (await run(`SELECT name FROM schema_migrations`, { database, format: 'TSV' }))
    .split('\n')
    .filter(Boolean)
);

let count = 0;
for (const patch of patches) {
  if (patchNumber(patch) > level) {
    console.log(`Skipping ${patch}: above target level ${level}`);
    continue;
  }
  if (applied.has(patch)) {
    continue;
  }
  const sql = await fs.readFile(path.join(migrationsDir, patch), 'utf8');
  console.log(`Applying ${patch}`);
  await run(sql, { database });
  await run(`INSERT INTO schema_migrations (name) VALUES ('${patch}')`, {
    database,
  });
  count += 1;
}

console.log(
  `Patched ${database} to level ${level}: ${count} applied, ${applied.size} already in place`
);
