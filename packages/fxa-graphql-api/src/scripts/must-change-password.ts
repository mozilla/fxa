#!/usr/bin/env node -r esbuild-register
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/*
 Usage:

 dist/fxa-graphql-api/src/scripts/must-change-password.js -i ./reset.txt

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
import { StatsD } from 'hot-shots';
import { setupAuthDatabase, setupDatabase } from 'fxa-shared/db';
import { batchAccountUpdate } from 'fxa-shared/db/models/auth';
import { uuidTransformer } from 'fxa-shared/db/transformers';
import { NotifierService, setupSns } from '@fxa/shared/notifier';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { ConfigService } from '@nestjs/config';

const config = Config.getProperties();
const logger = mozlog(config.log)('must-change-password');

const metrics = config.metrics?.host
  ? new StatsD({
      ...config.metrics,
      errorHandler: (err) => {
        // eslint-disable-next-line no-use-before-define
        logger.error('statsd.error', { err });
      },
    })
  : undefined;

program
  .option('-e, --emails [emails]', 'Email addresses')
  .option('-u, --uids [uids]', 'User IDs')
  .option('-i, --input <filename>', 'Input filename from which to read input')
  .option(
    '-b, --batch-size <count>',
    'How many records to update in a single db UPDATE.'
  )
  .parse(process.argv);

if (!program.input) {
  console.error(`-i, --input required`);
  process.exit(1);
} else if (!program.emails && !program.uids) {
  console.error('One of `emails` or `uids` must be specified');
  process.exit(1);
} else if (program.emails && program.uids) {
  console.error('Only one of `emails` or `uids` can be specified, not both');
  process.exit(1);
}

let emails = [];
let uids = [];

if (program.emails) {
  emails = getItems();
} else if (program.uids) {
  uids = getItems();
}

if (!emails.length && !uids.length) {
  console.error('No `emails` or `uids` found inside the specified file');
  process.exit(1);
}

function getItems() {
  try {
    const input = fs.readFileSync(path.resolve(program.input)).toString('utf8');

    return adjustText(input);
  } catch (err) {
    console.error('No such file or directory');
    process.exit(1);
  }
}

function adjustText(input = '') {
  if (!input.length) {
    return [];
  }

  return input
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter((s) => !!s.length);
}

async function main() {
  const batchSize = program.batchSize ?? 10;
  const authKnex = setupAuthDatabase(
    config.database.mysql.auth,
    logger,
    metrics
  );
  const oauthKnex = setupDatabase(config.database.mysql.oauth, logger, metrics);

  const sns = setupSns({
    snsTopicArn: config.notifier.sns.snsTopicArn || '',
    snsTopicEndpoint: config.notifier.sns.snsTopicEndpoint || '',
  });
  const notifier = new NotifierService(
    Config as unknown as ConfigService,
    logger as MozLoggerService,
    sns,
    metrics
  );

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

    for (const uid in uids) {
      await notifier.send({
        event: 'profileDataChange',
        data: {
          ts: Date.now() / 1000,
          uid,
        },
      });
    }

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
