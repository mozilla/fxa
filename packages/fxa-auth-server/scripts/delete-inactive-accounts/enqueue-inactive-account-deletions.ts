#!/usr/bin/env node -r esbuild-register

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A script to start the inactive account deletion process.  It should, for every inactive account:
 *  - send a pre-deletion event to relevant RPs of the account
 *
 * This script relies on the same set of enivronment variables as the FxA auth
 * server.
 */

/**
 * The general steps are:
 *   1. Build a list of exclusion UIDs in BigQuery from the various RP
 *   exclusion lists.  This list is saved to a temp table in a BQ session.
 *   2. Query MySQL to build a list of inactive account candidates.  This is
 *   accomplished by first saving the MySQL results to a CSV and then loading
 *   them into a BQ temp table.
 *   3. Join the exclusion list with the inactive account candidates to get the
 *   final list of inactive account candidates.
 *   4. Loop through the candidates to exhaustively check whether they are
 *   inactive.
 *   5. For each inactive account, enqueue a cloud task to send the first
 *   notification email.
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { performance } from 'perf_hooks';

import { Command } from 'commander';
import { StatsD } from 'hot-shots';
import { Container } from 'typedi';
import PQueue from 'p-queue-compat';
import { BigQuery } from '@google-cloud/bigquery';

import {
  CloudTaskOptions,
  EmailTypes,
  SendEmailTaskPayload,
  SendEmailTasksFactory,
} from '@fxa/shared/cloud-tasks';

import { collect, parseBooleanArg } from '../lib/args';
import { AppConfig, AuthLogger } from '../../lib/types';
import appConfig from '../../config';
import { requestForGlean } from '../../lib/inactive-accounts';
import initLog from '../../lib/log';
import initRedis from '../../lib/redis';
import { gleanMetrics } from '../../lib/metrics/glean';
import Token from '../../lib/tokens';
import * as random from '../../lib/crypto/random';
import { createDB } from '../../lib/db';
import oauthDb from '../../lib/oauth/db';

import {
  accountWhereAndOrderByQueryBuilder,
  hasAccessToken,
  hasActiveRefreshToken,
  hasActiveSessionToken,
  IsActiveFnBuilder,
  setDateToUTC,
  buildExclusionsTempTableQuery,
} from './lib';

// {{{ constants and defaults

const emailType = EmailTypes.INACTIVE_DELETE_FIRST_NOTIFICATION;
const defaultDaysTilFirstEmail = 0;
const defaultResultsLImit = 500000;
const defaultConcurrency = 100;
const twoYearsAgo = () => {
  const x = new Date();
  x.setFullYear(x.getFullYear() - 2);
  return x;
};

const exclusionsTempTableName = 'exclusions';

// /constants and defaults }}}

const exclusionList = collect();

const init = async () => {
  const program = new Command();
  program
    .description(
      'Starts the inactive account deletion process by enqueuing the first email\n' +
        'notification for inactive accounts.  This script allows segmenting the\n' +
        'accounts to search by account creation date. It also optionally accepts a\n' +
        'date at or after when an account is active in order to be excluded.\n\n' +
        'For example, to start the inactive deletion process on accounts created\n' +
        'between 2015-01-01 and 2015-01-31 where the account is not active after\n' +
        '2024-10-31:\n' +
        '  enqueue-inactive-account-deletions.ts \\\n' +
        '    --start-date 2015-01-01 \\\n' +
        '    --end-date 2015-12-31 \\\n' +
        '    --active-by-date 2024-10-31'
    )
    .option(
      '--dry-run [true|false]',
      'Print out the argument and configuration values that will be used in the execution of the script. Defaults to true.',
      parseBooleanArg,
      true
    )
    .option(
      '--enqueue-emails [true|false]',
      'Whether to enqueue Cloud Tasks to send the first notification email.  Defaults to false.',
      parseBooleanArg,
      false
    )
    .option(
      '--save-uids [true|false]',
      'Whether to save the uid of the inactive accounts to a BQ table.  The table will expire in a week.  Defaults to false.',
      parseBooleanArg,
      false
    )
    .option(
      '--active-by-date [date]',
      'An account is considered active if it has any activity at or after this date.  Optional.  Defaults to two years ago from script execution time.',
      Date.parse
    )
    .option(
      '--start-date [date]',
      'Start of date range of account creation date, inclusive.  Optional.  Defaults to 2012-03-12.',
      Date.parse,
      '2012-03-12'
    )
    .option(
      '--end-date [date]',
      'End of date range of account creation date, inclusive.  Defaults to a day before active by date.',
      Date.parse
    )
    .option(
      '--days-til-first-email [float]',
      'The amount of time from now until the first email is sent, in days.  Defaults to 0.  Max allowed (GCP limit) is 30.',
      parseFloat
    )
    .option(
      '--results-limit [number]',
      'The number of results per accounts DB query.  Defaults to 500000.',
      (x) => parseInt(x),
      defaultResultsLImit
    )
    .option(
      '--output-path [path]',
      'File path to write the list of UIDs from MySQL.  Optional.  Defaults to CWD and filename based on the end date.'
    )
    .option(
      '--bq-dataset <string>',
      'The qualified BigQuery dataset ID, with the GCP project id, where the MySQL results will be saved.  Required.'
    )
    .option(
      '--concurrency [number]',
      'The max number of inflight active checks as well as the per second rate limit.  Defaults to 100.',
      parseInt
    )
    .option(
      '--exclusion-list [string]',
      'A fully qualified name down to the column name of a exclusion list in BigQuery, e.g. "proj_A.dataset_B.table_C.uid".  Repeatable.',
      exclusionList,
      []
    );
  // @TODO add testing related parameters, such as UID(s), time between certain actions, etc.

  // {{{ arguments

  program.parse(process.argv);

  if (!program.bqDataset) {
    throw new Error('BigQuery dataset ID is required.');
  }

  const startDate = setDateToUTC(program.startDate);
  const endDate = program.endDate
    ? setDateToUTC(program.endDate)
    : twoYearsAgo();
  const activeByDate = program.activeByDate
    ? setDateToUTC(program.activeByDate)
    : twoYearsAgo();
  const startDateTimestamp = startDate.valueOf();
  const endDateTimestamp = endDate.valueOf() + 86400000; // next day for < comparisons
  const activeByDateTimestamp = activeByDate.valueOf();

  if (endDateTimestamp <= startDateTimestamp) {
    throw new Error(
      'The end date must be on the same day or later than the start date.'
    );
  }

  const daysTilFirstEmail =
    program.daysTilFirstEmail !== undefined
      ? program.daysTilFirstEmail
      : defaultDaysTilFirstEmail;

  if (daysTilFirstEmail > 30) {
    throw new Error(
      'The maximum allowed days until first email is 30.  This is a limit of Google Cloud Tasks.'
    );
  }

  const msTilFirstEmail = daysTilFirstEmail * 86400000;
  const mysqlResCsvPath =
    program.outputPath ||
    path.join(
      process.cwd(),
      `mysql-inactive-account-uids-${endDate
        .toISOString()
        .substring(0, 10)}.csv`
    );

  // /arguments }}}

  console.log(`Save inactive account UIDs: ${program.saveUids}`);
  console.log(`Enqueue emails: ${program.enqueueEmails}`);
  console.log(`Start date: ${startDate.toISOString()}`);
  console.log(`End date: ${endDate.toISOString()}`);
  console.log(`Active by date: ${activeByDate.toISOString()}`);
  console.log(`Days 'til first email: ${daysTilFirstEmail}`);
  console.log(`Per MySQL query results limit: ${program.resultsLimit}`);

  if (program.dryRun) {
    console.log(
      'Dry run mode is on.  It is the default; use --dry-run=false when you are ready.'
    );
    return 0;
  }

  // {{{ dependencies

  const config = appConfig.getProperties();
  const log = initLog({
    ...config.log,
  });
  const statsd = new StatsD({ ...config.statsd });
  const glean = gleanMetrics(config);

  const redis = initRedis(
    { ...config.redis, ...config.redis.sessionTokens },
    log
  );
  const db = createDB(
    config,
    log,
    Token(log, config),
    random.base32(config.signinUnblock.codeLength)
  );
  const fxaDb = await db.connect(config, redis);

  Container.set(AppConfig, config);
  Container.set(AuthLogger, log);

  // /dependencies }}}

  const emitStatsdMetrics =
    <T extends (...args) => ReturnType<T>>(fn: T, name: string) =>
    async (...args: Parameters<T>) => {
      const startTime = performance.now();
      const result = await fn(...args);
      statsd.timing(`${name}.latency`, performance.now() - startTime);
      statsd.increment(`${name}.count`);
      return result;
    };

  const postfixTableName = (prefix: string) =>
    `${prefix}_${startDate
      .toISOString()
      .substring(0, 10)
      .replaceAll('-', '')}_${endDate
      .toISOString()
      .substring(0, 10)
      .replaceAll('-', '')}_${activeByDate
      .toISOString()
      .substring(0, 10)
      .replaceAll('-', '')}`;

  // {{{ build exclusions temp table in BQ and start a session

  const bq = new BigQuery();
  const exclusionsTempTableQuery = buildExclusionsTempTableQuery(
    exclusionsTempTableName,
    program.exclusionList
  );
  const [exclusionsTableJob] = await bq.createQueryJob({
    query: exclusionsTempTableQuery,
    createSession: true,
  });
  // even if we don't need any data from the results we need to await until the
  // job is done
  await exclusionsTableJob.getQueryResults();
  const bqSessionId =
    exclusionsTableJob.metadata.statistics.sessionInfo.sessionId;

  if (!bqSessionId) {
    throw new Error('BigQuery session id not found.');
  }

  console.log(`Exclusions table name: ${exclusionsTempTableName}`);
  console.log(`Exclusions table job id: ${exclusionsTableJob.id}`);
  console.log(`BQ session id: ${bqSessionId}`);

  // /build exclusions temp table in BQ and start a session }}}

  const saveUidsToBqTable = async (
    uids: string[],
    tableNamePrefix: string,
    filepath: string
  ) => {
    const fd = fs.openSync(filepath, 'w');
    fs.writeSync(fd, uids.join(os.EOL));
    fs.closeSync(fd);

    const dataset = program.bqDataset.split('.')[1];
    const tableName = postfixTableName(tableNamePrefix);

    await bq.dataset(dataset).createTable(tableName, {
      schema: [
        { name: 'uid', type: 'STRING', maxLength: '32', mode: 'REQUIRED' },
      ],
      expirationTime: `${Date.now() + 604_800_000}`, // keep for a week
    });

    await bq
      .dataset(dataset)
      .table(tableName)
      .load(filepath, { sourceFormat: 'CSV' });

    return tableName;
  };

  // {{{ write MySQL results to CSV and load into BQ temp table

  const accountQueryBuilder = () =>
    accountWhereAndOrderByQueryBuilder(
      startDateTimestamp,
      endDateTimestamp,
      activeByDateTimestamp
    )
      .select('accounts.uid')
      .limit(program.resultsLimit);

  let hasMaxResultsCount = true;
  let totalRowsReturned = 0;
  let inactiveCandidateUids: string[] = [];

  while (hasMaxResultsCount) {
    const accountsQuery = accountQueryBuilder();
    accountsQuery.offset(totalRowsReturned);

    const accounts = await emitStatsdMetrics(
      async () => await accountsQuery,
      'accounts.inactive.sql-query'
    )();

    if (!accounts.length) {
      hasMaxResultsCount = false;
      break;
    }

    inactiveCandidateUids = inactiveCandidateUids.concat(
      accounts.map((x) => x.uid)
    );

    hasMaxResultsCount = accounts.length === program.resultsLimit;
    totalRowsReturned += accounts.length;
  }

  const inactivesMySqlResultsTableName = await saveUidsToBqTable(
    inactiveCandidateUids,
    'mysql_inactive_candidates',
    mysqlResCsvPath
  );

  console.log(`MySQL results table: ${inactivesMySqlResultsTableName}`);

  //  /write MySQL results to CSV and load into BQ temp table }}}

  // {{{ build isAcitive function

  const sessionTokensFn = fxaDb.sessions.bind(fxaDb);
  const refreshTokensFn = oauthDb.getRefreshTokensByUid.bind(oauthDb);
  const accessTokensFn = oauthDb.getAccessTokensByUid.bind(oauthDb);

  const _checkActiveSessionToken = async (uid: string) =>
    await hasActiveSessionToken(sessionTokensFn, uid, activeByDateTimestamp);
  const checkActiveSessionToken = emitStatsdMetrics(
    _checkActiveSessionToken,
    'accounts.inactive.session-token-check'
  );
  const _checkRefreshToken = async (uid: string) =>
    await hasActiveRefreshToken(refreshTokensFn, uid, activeByDateTimestamp);
  const checkRefreshToken = emitStatsdMetrics(
    _checkRefreshToken,
    'accounts.inactive.refresh-token-check'
  );
  const _checkAccessToken = async (uid: string) =>
    await hasAccessToken(accessTokensFn, uid);
  const checkAccessToken = emitStatsdMetrics(
    _checkAccessToken,
    'accounts.inactive.access-token-check'
  );

  const _isActive = new IsActiveFnBuilder()
    .setActiveSessionTokenFn(checkActiveSessionToken)
    .setRefreshTokenFn(checkRefreshToken)
    .setAccessTokenFn(checkAccessToken)
    .build();

  const isActive = emitStatsdMetrics(
    _isActive,
    'accounts.inactive.active-status-check'
  );

  // /build isAcitive function }}}

  // {{{ join exclusions and build the final list of inactive candidates

  // join the MySQL results with the exclusions to get the final list of
  // candidates to process.  no need to save the results into a temp table
  // since we can run the join again if necessary.
  const inactiveCandidatesQuery = `
    SELECT \`${program.bqDataset}.${inactivesMySqlResultsTableName}\`.uid
    FROM \`${program.bqDataset}.${inactivesMySqlResultsTableName}\`
    LEFT JOIN ${exclusionsTempTableName}
    ON \`${program.bqDataset}.${inactivesMySqlResultsTableName}\`.uid = ${exclusionsTempTableName}.uid
    WHERE ${exclusionsTempTableName}.uid IS NULL
    `;

  const [inactiveCandidatesJob] = await bq.createQueryJob({
    query: inactiveCandidatesQuery,
    connectionProperties: [
      {
        key: 'session_id',
        value: bqSessionId,
      },
    ],
  });
  const [inactiveCandidateRecords] =
    await inactiveCandidatesJob.getQueryResults();

  console.log(`Exclusions join job id: ${inactiveCandidatesJob.id}`);

  // /join exclusions and build the final list of inactive candidates }}}

  const concurrency = program.concurrency || defaultConcurrency;
  const queue = new PQueue({
    concurrency,
    interval: 1000,
    intervalCap: concurrency,
  });

  // {{{ exhaustive active status check

  const inactiveAccountUids: string[] = [];
  let emailsQueued = 0;

  for (const record of inactiveCandidateRecords) {
    await queue.onSizeLessThan(concurrency * 5);

    queue.add(async () => {
      try {
        await glean.inactiveAccountDeletion.statusChecked(requestForGlean, {
          uid: record.uid,
        });

        if (!(await isActive(record.uid))) {
          inactiveAccountUids.push(record.uid);
        }
      } catch (err) {
        statsd.increment('accounts.inactive.status-check.error');
        log.error('accounts.inactive.statusCheckError', {
          err,
          uid: record.uid,
        });
      }
    });
  }

  await queue.onIdle();

  // /exhaustive active status check }}}

  // {{{ optionally save the inactive account UIDs to a BQ table

  if (program.saveUids && inactiveAccountUids.length) {
    // use the dir of the path where the CSV of MySQL results was saved since
    // we can probably write to it
    const inactiveUidsCsvPath = path.join(
      path.dirname(mysqlResCsvPath),
      `inactive-uids-${Date.now()}.csv`
    );

    const inactiveAccountUidsTableName = await saveUidsToBqTable(
      inactiveAccountUids,
      'inactive_account_uids',
      inactiveUidsCsvPath
    );

    console.log(`Inactive account UIDs table: ${inactiveAccountUidsTableName}`);
  }

  // /optionally save the inactive account UIDs to a BQ table }}}

  // {{{ enqueue google tasks for sending the first notification email

  if (program.enqueueEmails) {
    const emailCloudTasks = SendEmailTasksFactory(config, statsd);

    for (const uid of inactiveAccountUids) {
      await queue.onSizeLessThan(concurrency * 5);

      queue.add(async () => {
        // @TODO this function could be astracted and moved to InactiveAccountsManager
        const taskPayload: SendEmailTaskPayload = {
          uid,
          emailType,
        };
        const taskId = `${uid}-inactive-delete-first-email`;
        const taskOptions: CloudTaskOptions = {
          taskId,
        };

        try {
          await glean.inactiveAccountDeletion.firstEmailTaskRequest(
            requestForGlean,
            {
              uid,
            }
          );

          await emailCloudTasks.sendEmail({
            payload: taskPayload,
            emailOptions: { deliveryTime: Date.now() + msTilFirstEmail },
            taskOptions: taskOptions,
          });

          emailsQueued++;
          await glean.inactiveAccountDeletion.firstEmailTaskEnqueued(
            requestForGlean,
            {
              uid,
            }
          );
        } catch (cloudTaskQueueError) {
          // Note that the fxa cloud tasks lib already emitted some statsd metrics
          statsd.increment('cloud-tasks.send-email.enqueue.error-code', [
            cloudTaskQueueError.code as unknown as string,
          ]);
          await glean.inactiveAccountDeletion.firstEmailTaskRejected(
            requestForGlean,
            {
              uid,
            }
          );
          log.error('accounts.inactive.emailEnqueueError', {
            cloudTaskQueueError,
            uid,
          });
        }
      });
    }
    await queue.onIdle();
  }

  // /enqueue google tasks for sending the first notification email }}}

  console.log(`Number of inactive accounts: ${inactiveAccountUids.length}`);
  console.log(`Number of emails queued: ${emailsQueued}`);

  return 0;
};

if (require.main === module) {
  init()
    .catch((err: Error) => {
      console.error(err);
      process.exit(1);
    })
    .then((exitCode: number) => process.exit(exitCode));
}
