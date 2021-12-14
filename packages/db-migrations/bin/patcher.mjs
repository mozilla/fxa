/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { promisify } from 'util';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import mysql from 'mysql';
import patcher from 'mysql-patcher';
import convict from 'convict';
import { makeMySQLConfig } from 'fxa-shared/db/config.js';
const patch = promisify(patcher.patch);

convict.addFormats(import('convict-format-with-moment'));
convict.addFormats(import('convict-format-with-validator'));

const databasesDir = path.resolve(
  new URL('.', import.meta.url).pathname,
  '../databases'
);

const conf = convict({
  env: {
    default: 'development',
    doc: 'The current node.js environment',
    env: 'NODE_ENV',
    format: ['development', 'test', 'stage', 'production'],
  },
  fxa: makeMySQLConfig('AUTH', 'fxa'),
  fxa_profile: makeMySQLConfig('PROFILE', 'fxa_profile'),
  fxa_oauth: makeMySQLConfig('OAUTH', 'fxa_oauth'),
});

let envConfig = path.join(databasesDir, `${conf.get('env')}.json`);
envConfig = `${envConfig},${process.env.CONFIG_FILES || ''}`;
const files = envConfig.split(',').filter(existsSync);
conf.loadFile(files);
conf.validate({ allowed: 'strict' });

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
    let cfg = conf.get(db);
    await patch({
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
  } catch (error) {
    // fyi these logs show up in `pm2 logs mysql`
    console.error(error);
    console.error(db, 'failed to patch to', level);
    process.exit(2);
  }
}
