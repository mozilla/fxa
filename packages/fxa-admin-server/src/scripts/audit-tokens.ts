/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import program from 'commander';
import { StatsD } from 'hot-shots';
import {
  setupAuthDatabase,
  setupDatabase,
  setupProfileDatabase,
} from 'fxa-shared/db';
import packageJson from '../../package.json';
import Config from '../config';
import mozlog from 'mozlog';
import { ILogger } from 'fxa-shared/log';

const config = Config.getProperties();

const statsd = new StatsD(config.metrics);
const knexForFxa = setupAuthDatabase({
  ...config.database.fxa,
});

const knexForProfile = setupProfileDatabase({
  ...config.database.fxa_oauth,
});

const knexForOAuth = setupDatabase({
  ...config.database.profile,
});

function getKnex(table: string) {
  if (table.startsWith('fxa.')) {
    return knexForFxa;
  } else if (table.startsWith('fxa_oauth.')) {
    return knexForOAuth;
  } else if (table.startsWith('fxa_profile.')) {
    return knexForProfile;
  } else {
    throw new Error(`Unsupported table! ${table}.`);
  }
}

const logFactory = mozlog(config.log);
let log: ILogger = logFactory('default');

//#region Table Definitions
/** Defines table and key column */
type TargetTable = { name: string; keyCol: string };

/** Prefixes table names with db name. */
const toTable = (name: string, db = 'fxa') => `${db}.${name}`;

/* Holds on to row counts per table. These are useful for other statistics. */
const rowCounts: Map<string, number> = new Map();

/** List of common tables */
const tables = {
  accountCustomers: toTable('accountCustomers'),
  accountResetTokens: toTable('accountResetTokens'),
  accounts: toTable('accounts'),
  devices: toTable('devices'),
  deviceCommands: toTable('deviceCommands'),
  emails: toTable('emails'),
  emailBounces: toTable('emailBounces'),
  keyFetchTokens: toTable('keyFetchTokens'),
  linkedAccounts: toTable('linkedAccounts'),
  passwordChangeTokens: toTable('passwordChangeTokens'),
  passwordForgotTokens: toTable('passwordForgotTokens'),
  paypalCustomers: toTable('paypalCustomers'),
  recoveryCodes: toTable('recoveryCodes'),
  recoveryKeys: toTable('recoveryCodes'),
  securityEvents: toTable('securityEvents'),
  sentEmails: toTable('sentEmails'),
  sessionTokens: toTable('sessionTokens'),
  signinCodes: toTable('signinCodes'),
  totp: toTable('totp'),
  unblockCodes: toTable('unblockCodes'),
  unverifiedTokens: toTable('unverifiedTokens'),
  verificationReminders: toTable('verificationReminders'),

  // OAuth tables
  oauthCodes: toTable('codes', 'fxa_oauth'),
  oauthRefreshTokens: toTable('refreshTokens', 'fxa_oauth'),
  oauthTokens: toTable('tokens', 'fxa_oauth'),

  // Profile tables
  profile: toTable('profile', 'fxa_profile'),
  avatars: toTable('avatars', 'fxa_profile'),
};

//#endregion

//#region Result Handling
export function formatStatLabel(label: string) {
  let cleaned = label;
  cleaned = cleaned.replace(/^\.|\.$/g, '');
  cleaned = cleaned.replace(/(fxa|fxa_profile|fxa_oauth)\./g, '$1_');
  cleaned = cleaned.replace(/\.+/g, '.');
  return cleaned;
}

function formatResult(result: any) {
  let formatted: any;

  // For key value pairs pivot the result
  if (result?.[0]?.[0]?.group_key && result?.[0]?.[0]?.group_value) {
    const pivotResult: any = {};
    for (const row of result[0] || []) {
      pivotResult[row.group_key] = row.group_value;
    }
    formatted = pivotResult;
  } else {
    // Return the first row
    formatted = result?.[0]?.[0];
  }

  return formatted;
}

export function emitStats(name: string, result: any) {
  if (!result) {
    return;
  }

  Object.entries(result).forEach(([key, val]) => {
    if (typeof val === 'number') {
      const label = formatStatLabel(`db-audit.${name}.${key}`);
      statsd.gauge(label, val);
      log.debug('emit-stats', { label });
    }
  });
}

export function logResult(name: string, query: string, result: any) {
  log.info('result', { name, result });

  if (program.verbose) {
    console.log(
      `\n-- AUDIT: ${name}\n-- QUERY:\n${query}\n${resultSummary()}\n\n\n`
    );
  }

  function resultSummary() {
    if (result) {
      const pairs = Object.entries(result)
        .map(([k, v]) => `\n-- ${k}: ${v}`)
        .join('');

      return `\n-- RESULT SUMMARY:\n${pairs}`;
    }

    return '-- RESULT SUMMARY: No Result';
  }
}
//#endregion

//#region Audits

/** Helper function to determine the number of rows to query. */
function getSampleSize(_tableName: string) {
  // We probably are fine just using a large number for sample size. Down
  // the road we might consider doing something fancier and try to calculate
  // a minimum population size based on a confidence interval and current
  // std dev. Setting this to any 'large' value is probably adequate to
  // get a feel for the data at the current moment.
  return program.maxSampleSize;
}

/** Looks up the table size, i.e. row count on the table. */
function getTableSize(tableName: string) {
  const size = rowCounts.get(tableName);
  if (size === undefined) {
    throw new Error(`Could not locate table, ${tableName}`);
  }
  return size;
}

/* Helper function for producing a SQL 'limit clause' */
function buildLimit(table: string) {
  const sampleSize = getSampleSize(table);
  if (sampleSize) {
    return `LIMIT ${sampleSize}`;
  }
  return '';
}

/** Adds the number of rows sampled and the total table size to each result set. This can be useful metadata when graphing metrics. */
function decorateResultWithTableStats(table: string, result: any) {
  const tableSize = getTableSize(table);
  let sampleSize = getSampleSize(table);
  if (tableSize < sampleSize) {
    sampleSize = tableSize;
  }
  result.table_size = tableSize;
  result.sample_size = sampleSize;
}

/** Conducts audit with a sql query that outputs a single row stats. */
async function audit(name: string, raw: string) {
  // Make sure query passes filter. We always run the RowCount tests since they
  // are needed by other audits.
  const filter = program.grep ? new RegExp(program.grep) : undefined;
  const skip = !/RowCount/i.test(name) && filter && !filter.test(name);
  if (skip) {
    log.info('audit', { msg: `-- Excluding ${name} due to grep filter.` });

    if (program.verbose) {
      console.log(`-- Excluding ${name} due to grep filter.`);
    }

    return;
  }

  if (program.dry) {
    logResult(name, raw, '');
    return '';
  }

  try {
    const knex = getKnex(name);
    const isolationLevel = 'read uncommitted';
    const trx = await knex.transaction({ isolationLevel });
    const rawResult = await trx.raw(raw);
    await trx.commit();
    return formatResult(rawResult);
  } catch (err) {
    log.error('audit-tokens', err);
    if (program.verbose) {
      console.log(err);
    }
  }
}

/** Queries for current row counts. */
export async function auditRowCounts(table: string) {
  function buildQuery(table: string) {
    return `
  SELECT
    table_rows AS table_size
  FROM INFORMATION_SCHEMA.TABLES
  WHERE table_schema = '${table.split('.')[0]}' and table_name = '${
      table.split('.')[1]
    }'
  `;
  }

  const name = `${table}.RowCount.`;
  const query = buildQuery(table);
  const result = await audit(name, query);

  logResult(name, query, result);
  emitStats(name, result);

  if (typeof result.table_size === 'number') {
    rowCounts.set(table, result?.table_size);
  }

  return result;
}

/** Groups tables by year month and gets counts. */
export async function auditAge(
  table: string,
  colName: string,
  colSort: string
) {
  function buildQuery(table: string, timeCol: string, sortCol: string) {
    return `
  SELECT
    DATE_FORMAT(FROM_UNIXTIME(${timeCol} / 1000), "%Y-%M") as group_key,
    COUNT(${sortCol}) as group_value
  FROM
  (
    SELECT ${sortCol} ${sortCol !== timeCol ? `, ${timeCol}` : ''}
    FROM ${table}
    ORDER BY ${sortCol}
    ${buildLimit(table)}
  ) as times
  GROUP BY group_key
  `;
  }

  const name = `${table}.AgeAudit.${colName}.`;
  const query = buildQuery(table, colName, colSort);
  const result = await audit(name, query);

  logResult(name, query, result);
  emitStats(name, result);

  return result;
}

/** Looks for rows missing an implied parent relationship */
export async function auditOrphanedRows(
  child: TargetTable,
  parent: TargetTable
) {
  function buildQuery() {
    return `
  SELECT
    total_missing,
    CASE when total > 0 THEN 100 * total_missing / total ELSE 0 END AS percent_missing
  FROM (
    SELECT
      COUNT(*) total,
      COUNT(IF(parent.${parent.keyCol} is NULL, 1, NULL)) AS total_missing
    FROM
      (SELECT ${child.keyCol} FROM ${child.name} ${buildLimit(
      child.name
    )}) as child
        LEFT JOIN ${parent.name} parent ON child.${child.keyCol} = parent.${
      parent.keyCol
    }
    ${buildLimit(child.name)}
  ) AS missing;
  `;
  }

  const query = buildQuery();
  const name = `${child.name}.OrphanedRows.On-${parent.name}`;
  const result = await audit(name, query);
  decorateResultWithTableStats(child.name, result);
  logResult(name, query, result);
  emitStats(name, result);
  return result;
}

/** Runs audits according to current cli arguments */
async function auditAll() {
  // We always audit row counts. These queries are fast, and
  // row counts are used by subsequent queries.
  for (const table of Object.values(tables)) {
    await auditRowCounts(table);
  }

  // If requested audit the age distribution of rows in the table.
  if (program.auditAge) {
    const set: any[] = [
      [tables.accountCustomers, 'createdAt', 'uid'],
      [tables.accountResetTokens, 'createdAt', 'tokenId'],
      [tables.accounts, 'createdAt', 'uid'],
      [tables.devices, 'createdAt', 'id'],
      [tables.emails, 'createdAt', 'id'],
      [tables.keyFetchTokens, 'createdAt', 'tokenId'],
      [tables.passwordChangeTokens, 'createdAt', 'tokenId'],
      [tables.passwordForgotTokens, 'createdAt', 'tokenId'],
      [tables.sentEmails, 'sentAt', 'id'],
      [tables.sessionTokens, 'createdAt', 'tokenId'],
      [tables.sessionTokens, 'lastAccessTime', 'tokenId'],
      [tables.totp, 'createdAt', 'uid'],
      [tables.unblockCodes, 'createdAt', 'unblockCodeHash'],
      [tables.unverifiedTokens, 'tokenVerificationCodeExpiresAt', 'tokenId'],
      [tables.verificationReminders, 'createdAt', 'uid'],
      [tables.oauthCodes, 'createdAt', 'token'],
      [tables.oauthRefreshTokens, 'createdAt', 'token'],
      [tables.oauthTokens, 'createdAt', 'token'],
    ];
    for (const [table, colName, colSort] of set) {
      await auditAge(table, colName, colSort);
    }
  }

  // If requested look for potentially orphaned rows. These are rows
  // where an implied parent key is missing. Note that we cannot audit
  // across databases... So oauth and profile tables can't be audited
  // against fxa tables.
  if (program.auditOrphanedRows) {
    let set = [
      tables.accountCustomers,
      tables.accountResetTokens,
      tables.devices,
      tables.emails,
      tables.keyFetchTokens,
      tables.linkedAccounts,
      tables.passwordChangeTokens,
      tables.passwordChangeTokens,
      tables.paypalCustomers,
      tables.recoveryCodes,
      tables.recoveryCodes,
      tables.securityEvents,
      tables.sentEmails,
      tables.sessionTokens,
      tables.signinCodes,
      tables.totp,
      tables.unblockCodes,
      tables.unverifiedTokens,
      tables.verificationReminders,
    ];
    for (const table of set) {
      await auditOrphanedRows(
        { name: table, keyCol: 'uid' },
        { name: tables.accounts, keyCol: 'uid' }
      );
    }

    set = [tables.devices];
    for (const table of set) {
      await auditOrphanedRows(
        { name: table, keyCol: 'sessionTokenId' },
        { name: tables.sessionTokens, keyCol: 'tokenId' }
      );
    }
  }
}

//#endregion

/**
 * Main routine
 * @returns
 */
export async function run() {
  try {
    program
      .version(packageJson.version)
      .option(
        '--grep <string>',
        'Regular expression to target a specific audit',
        ''
      )
      .option(
        '--maxSampleSize <number>',
        'The maximum number of rows to sample at anyone time.',
        '100000'
      )
      .option(
        '--dry',
        'Indicates that the db queries should not be executed. When combined with verbose this can be useful for generating SQL queries.'
      )
      .option(
        '--verbose',
        'Indicates to turn on verbose output. This will output raw queries to console.'
      )
      .option(
        '--auditAge',
        'Toggles auditing of age based metrics on table rows.'
      )
      .option('--auditOrphanedRows', 'Toggles auditing of orphaned rows.')
      .option(
        '--loopInterval <number>',
        'When defined puts the program into a loop that executes every X seconds.',
        '0'
      )
      .option('--console', 'When defined use the console instead of mozlogger')
      .parse(process.argv);

    if (program.console) {
      log = {
        debug: console.debug,
        warn: console.warn,
        trace: console.trace,
        info: console.info,
        error: console.error,
      };
    }

    if (parseInt(program.loopInterval)) {
      // Keep polling stats. Useful to local monitoring.
      return new Promise(() => {
        setInterval(async () => {
          await auditAll();
        }, program.loopInterval * 1000);
      }).catch((err) => {
        throw err;
      });
    } else {
      await auditAll();
    }
  } catch (err) {
    console.error(err);
    return 2;
  }
  return 0;
}

// Main entry point
if (require.main === module) {
  process.on('exit', (code) => log.info('exit', { code }));

  run()
    .then((result) => log.info('result', { result }))
    .then(() => {
      // Make sure statsd closes cleanly so we don't lose any metrics
      return new Promise((resolve) => {
        statsd.close((err) => {
          if (err) {
            log.warn('statsd', { closed: true, err });
          } else {
            log.info('statsd', { closed: true });
          }
          resolve(true);
        });
      });
    })
    .catch((error) => {
      log.error('audit-tokens', { error });
    })
    .finally(process.exit);
}
