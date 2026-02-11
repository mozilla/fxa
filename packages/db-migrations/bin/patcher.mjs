/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import mysql from 'mysql';
import patcher from 'mysql-patcher';
import convict from 'convict';
import { makeMySQLConfig } from 'fxa-shared/db/config';
const patch = promisify(patcher.patch);

const conf = convict({
  fxa: makeMySQLConfig('AUTH', 'fxa'),
  fxa_profile: makeMySQLConfig('PROFILE', 'fxa_profile'),
  fxa_oauth: makeMySQLConfig('OAUTH', 'fxa_oauth'),
  pushbox: makeMySQLConfig('PUSHBOX', 'pushbox'),
});
if (process.env.CONFIG_FILES) {
  const files = process.env.CONFIG_FILES.split(',');
  conf.loadFile(files);
}
conf.validate();

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
    const cfg = conf.get(db);
    console.log(`Patching ${db} to ${level}`);
    let results = await patch({
      user: cfg.user,
      password: cfg.password,
      host: cfg.host,
      port: cfg.port,
      dir: path.resolve(databasesDir, db, 'patches'),
      patchKey: 'schema-patch-level',
      metaTable: 'dbMetadata',
      patchLevel: level,
      mysql,
      createDatabase: true,
      reversePatchAllowed: false,
      database: cfg.database,
    });
    console.log(`Results: ${results}`);
    console.log(`Successfully patched ${db} to ${level}`);
  } catch (error) {
    // fyi these logs show up in `pm2 logs mysql`
    console.error(`Error: ${error}`);
    console.error(`Failed to patch ${db} to ${level}`);
    process.exit(2);
  }
}
