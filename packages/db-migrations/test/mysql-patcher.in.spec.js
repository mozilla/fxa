/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mysql from 'mysql';
import Patcher from '../lib/mysql-patcher.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, 'fixtures', 'end-to-end');
const TEST_DB = 'test_mysql_patcher_' + process.pid;

function patchTo(level, overrides = {}) {
  return Patcher.patch({
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    database: TEST_DB,
    dir: fixturesDir,
    metaTable: 'metadata',
    patchKey: 'schema-patch-level',
    patchLevel: level,
    mysql,
    createDatabase: true,
    reversePatchAllowed: false,
    ...overrides,
  });
}

function query(sql) {
  return new Promise((resolve, reject) => {
    const conn = mysql.createConnection({
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306', 10),
      database: TEST_DB,
      multipleStatements: true,
    });
    conn.connect((err) => {
      if (err) return reject(err);
      conn.query(sql, (err, result) => {
        conn.end();
        if (err) return reject(err);
        resolve(result);
      });
    });
  });
}

function dropTestDb() {
  return new Promise((resolve, reject) => {
    const conn = mysql.createConnection({
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    });
    conn.connect((err) => {
      if (err) return reject(err);
      conn.query('DROP DATABASE IF EXISTS `' + TEST_DB + '`', (err) => {
        conn.end();
        if (err) return reject(err);
        resolve();
      });
    });
  });
}

describe('#integration - mysql-patcher', () => {
  beforeEach(async () => {
    await dropTestDb();
  });

  afterAll(async () => {
    await dropTestDb();
  });

  describe('fresh database', () => {
    it('creates database and applies all patches', async () => {
      await patchTo(3);

      const rows = await query(
        "SELECT value FROM metadata WHERE name = 'schema-patch-level'"
      );
      expect(rows[0].value).toBe('3');

      // Verify tables created by patches exist
      const tables = await query('SHOW TABLES');
      const tableNames = tables.map((r) => Object.values(r)[0]);
      expect(tableNames).toContain('metadata');
      expect(tableNames).toContain('accounts');
      expect(tableNames).toContain('kv');
    });
  });

  describe('incremental patching', () => {
    it('applies only remaining patches', async () => {
      // Patch to level 1 first
      await patchTo(1);

      let rows = await query(
        "SELECT value FROM metadata WHERE name = 'schema-patch-level'"
      );
      expect(rows[0].value).toBe('1');

      // accounts table should NOT exist yet (created in patch 1→2)
      const tablesAfter1 = await query('SHOW TABLES');
      const names1 = tablesAfter1.map((r) => Object.values(r)[0]);
      expect(names1).toContain('metadata');
      expect(names1).not.toContain('accounts');

      // Now patch to level 3
      await patchTo(3);

      rows = await query(
        "SELECT value FROM metadata WHERE name = 'schema-patch-level'"
      );
      expect(rows[0].value).toBe('3');

      const tablesAfter3 = await query('SHOW TABLES');
      const names3 = tablesAfter3.map((r) => Object.values(r)[0]);
      expect(names3).toContain('accounts');
      expect(names3).toContain('kv');
    });
  });

  describe('already at target level', () => {
    it('is a no-op when already patched', async () => {
      await patchTo(3);

      // Run again — should succeed without error
      await patchTo(3);

      const rows = await query(
        "SELECT value FROM metadata WHERE name = 'schema-patch-level'"
      );
      expect(rows[0].value).toBe('3');
    });
  });

  describe('bad SQL in patch', () => {
    it('errors and preserves last good level', async () => {
      // Patch to level 2 first
      await patchTo(2);

      // Create a temp dir with a bad patch for level 2→3
      const tmpDir = path.join(
        __dirname,
        'fixtures',
        'bad-patch-' + process.pid
      );
      fs.mkdirSync(tmpDir, { recursive: true });

      try {
        // Copy good patches for 0→1, 1→2
        fs.copyFileSync(
          path.join(fixturesDir, 'patch-000000-000001.sql'),
          path.join(tmpDir, 'patch-000000-000001.sql')
        );
        fs.copyFileSync(
          path.join(fixturesDir, 'patch-000001-000002.sql'),
          path.join(tmpDir, 'patch-000001-000002.sql')
        );

        // Write a bad patch for 2→3
        fs.writeFileSync(
          path.join(tmpDir, 'patch-000002-000003.sql'),
          'THIS IS NOT VALID SQL;'
        );

        await expect(patchTo(3, { dir: tmpDir })).rejects.toThrow();

        // DB should still be at level 2
        const rows = await query(
          "SELECT value FROM metadata WHERE name = 'schema-patch-level'"
        );
        expect(rows[0].value).toBe('2');
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });

  describe('missing patch in chain', () => {
    it('errors before running any SQL', async () => {
      // Create a dir with a gap: has 0→1 and 2→3, but missing 1→2
      const tmpDir = path.join(
        __dirname,
        'fixtures',
        'gap-patch-' + process.pid
      );
      fs.mkdirSync(tmpDir, { recursive: true });

      try {
        fs.copyFileSync(
          path.join(fixturesDir, 'patch-000000-000001.sql'),
          path.join(tmpDir, 'patch-000000-000001.sql')
        );
        fs.copyFileSync(
          path.join(fixturesDir, 'patch-000002-000003.sql'),
          path.join(tmpDir, 'patch-000002-000003.sql')
        );

        await expect(patchTo(3, { dir: tmpDir })).rejects.toThrow(
          'Patch from level 1 to 2 does not exist'
        );
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });

  describe('metadata table integrity', () => {
    it('has exactly one patch-level row after patching', async () => {
      await patchTo(3);

      const rows = await query('SELECT * FROM metadata');
      expect(rows.length).toBe(1);
      expect(rows[0].name).toBe('schema-patch-level');
      expect(rows[0].value).toBe('3');
    });
  });

  describe('patcher.mjs full flow', () => {
    it('all FxA databases are at target levels', async () => {
      const databasesDir = path.resolve(__dirname, '..', 'databases');
      const entries = fs.readdirSync(databasesDir, { withFileTypes: true });
      const databases = entries
        .filter((e) => e.isDirectory())
        .map((e) => e.name);

      for (const db of databases) {
        const targetPath = path.join(databasesDir, db, 'target-patch.json');
        const { level } = JSON.parse(fs.readFileSync(targetPath, 'utf8'));

        // Connect to each real database and verify its patch level
        const rows = await new Promise((resolve, reject) => {
          const conn = mysql.createConnection({
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            host: process.env.MYSQL_HOST || 'localhost',
            port: parseInt(process.env.MYSQL_PORT || '3306', 10),
            database: db,
          });
          conn.connect((err) => {
            if (err) return reject(err);
            conn.query(
              "SELECT value FROM dbMetadata WHERE name = 'schema-patch-level'",
              (err, result) => {
                conn.end();
                if (err) return reject(err);
                resolve(result);
              }
            );
          });
        });

        expect(+rows[0].value).toBe(level);
      }
    });
  });
});
