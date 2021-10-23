/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import mysql from 'mysql';
import patcher from 'mysql-patcher';
const patch = promisify(patcher.patch);

const databasesDir = path.resolve(
  new URL('.', import.meta.url).pathname,
  '../databases'
);

const databases = (
  await fs.readdir(databasesDir, {
    withFileTypes: true,
  })
)
  .filter((x) => x.isDirectory())
  .map((x) => x.name);

for (const db of databases) {
  const { level } = JSON.parse(
    await fs.readFile(path.resolve(databasesDir, db, 'target-patch.json'))
  );
  try {
    await patch({
      user: 'root',
      password: '',
      host: 'localhost',
      port: 3306,
      dir: path.resolve(databasesDir, db, 'patches'),
      patchKey: 'schema-patch-level',
      metaTable: 'dbMetadata',
      patchLevel: level,
      mysql,
      createDatabase: true,
      reversePatchAllowed: false,
      database: db,
    });
  } catch (error) {
    // fyi these logs show up in `pm2 logs mysql`
    console.error(error);
    console.error(db, 'failed to patch to', level);
    process.exit(2);
  }
}
