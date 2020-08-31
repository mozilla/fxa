#!/usr/bin/env ts-node-script
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/*
 Usage:

 dist/fxa-graphql-api/src/scripts/must-change-password.js -i ./reset.json

 This script is used to put user accounts into a "must change password" state. It uses the
 same config file as the graphql-api so should be run from a production instance.

 WARNING:
 To ensure no unauthorized access in this state, ALL ATTACHED CLIENTS ARE DISCONNECTED.

 Example format for JSON file:

  [
    {"uid": "e135f25825cc4aa084f0d5190f9f8433"},
    {"uid": "2e4e1f44a58e4a319cdcf199bba2f751"}
  ]

/*/
import { program } from 'commander';
import mozlog from 'mozlog';
import path from 'path';
import fs from 'fs';

import Config from '../config';
import { setupAuthDatabase, setupDatabase } from 'fxa-shared/lib/db';
import { batchAccountUpdate } from 'fxa-shared/lib/db/models/auth';
import { uuidTransformer } from 'fxa-shared/lib/db/transformers';

const config = Config.getProperties();
const logger = mozlog(config.logging)('must-change-password');
const requiredOptions = ['input'];

program
  .option('-i, --input <filename>', 'JSON input file')
  .option(
    '-b, --batch-size <count>',
    'How many records to update in a single db UPDATE.'
  )
  .parse(process.argv);

function checkRequiredOption(optionName: string) {
  if (!program[optionName]) {
    console.error(`--${optionName} required`);
    process.exit(1);
  }
}

requiredOptions.forEach(checkRequiredOption);

async function main() {
  const batchSize = program.batchSize ?? 10;
  const authKnex = setupAuthDatabase(config.database.mysql.auth);
  const oauthKnex = setupDatabase(config.database.mysql.oauth);
  const json = JSON.parse(
    fs.readFileSync(path.resolve(program.input), { encoding: 'utf8' })
  );

  const uids: string[] = json.map((entry: any) => {
    return entry.uid;
  });

  // Start iterating through batches and updating
  let processed = 0;
  while (uids.length > 0) {
    const uidBatch = uids.splice(0, batchSize);
    const uidBuffers = uidBatch.map((uid: string) => uuidTransformer.to(uid));
    const now = Date.now();
    await batchAccountUpdate(uidBuffers, { lockedAt: now });
    await Promise.all([
      oauthKnex('refreshTokens').whereIn('userId', uidBuffers).del(),
      authKnex('sessionTokens').whereIn('uid', uidBuffers).del(),
    ]);
    processed += uidBatch.length;
  }

  logger.info('main', { accountsUpdated: processed });
  await Promise.all([authKnex.destroy(), oauthKnex.destroy()]);
  process.exit();
}

main();
