#!/usr/bin/env node

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

// Check for bad smells in active migrations, by:
//
//   * Looking for encoding mismatches in stored procedure arguments.
//
//   * Looking for FOREIGN KEY constraints in CREATE TABLE statements.
//
//   * Looking for calls to ROW_COUNT() inside stored procedures.
//
//   * Running an EXPLAIN for queries in stored procedures.
//
// Currently the EXPLAIN only works on SELECT queries. If we find it adds
// value for those, it should be pretty straightforward to write some logic
// that transforms an INSERT, UPDATE or DELETE into a similar SELECT and
// constructs the EXPLAIN for that instead.
//
// The SQL parsing is very crude and some fundamental assumptions are made
// about our SQL source:
//
//   * There are never multiple queries on a single line.
//   * `CREATE PROCEDURE` and its matching `END;` always start at column 1.
//   * Arguments to procedures are always named either `inXxx` or `xxxArg`.
//   * SQL comment delimiters never appear inside string literals.
//
// Non-conformance to those assumptions is not fatal. It just means we'll
// fail to EXPLAIN the non-conforming queries.

/* eslint-disable indent, no-console, no-useless-escape */

'use strict';

const config = require('../config');
const crypto = require('crypto');
const cp = require('child_process');
const fs = require('fs');
const Mysql = require('../lib/db/mysql');
const Promise = require('../lib/promise');
const { normalizeEmail } = require('fxa-shared/email/helpers');

const log = {
  error: () => {},
  info: () => {},
  stat: () => {},
  trace: () => {},
};

const PRODUCTION = /^prod/i;
const RECORD_COUNT = 100;
const RETURN_STRING = { encoding: 'utf8' };
const CREATE_TABLE = /^CREATE TABLE (?:IF NOT EXISTS )?`?([A-Z]+)/i;
const END_STATEMENT = /;/;
const FOREIGN_KEY = /^\s*FOREIGN KEY \([A-Z, ]+\) REFERENCES ([A-Z]+)/i;
const CREATE_PROCEDURE = /^CREATE PROCEDURE `?([A-Z]+_[0-9]+)/i;
const UNENCODED_EMAIL_ARG = /^\s*IN `?((?:in)?(?:Normalized)?Email(?:Arg)?)`? VARCHAR\([0-9]+\)\s*,?\s*$/i;
const END_PROCEDURE = /^END;$/i;
const SELECT = /^\s*SELECT/i;
const COMMENT = /--.+$/;
const TYPE_FULL_TABLE_SCAN = /^all$/i;
const TYPE_FULL_INDEX_SCAN = /^index$/i;
const EXTRA_FILESORT = /filesort/i;
const EXTRA_TEMPORARY_TABLE = /temporary/i;
const ROW_COUNT = /\bROW_COUNT\(\)/i;

const KNOWN_ARGS = new Map([
  ['commandname', 'foo'],
  ['name', 'schema-patch-level'],
  ['reminderlimit', 3],
  ['uabrowser', 'foo'],
  ['uabrowserversion', 'bar'],
  ['uaos', 'baz'],
  ['uaosversion', 'qux'],
  ['uadevicetype', 'mobile'],
]);

if (PRODUCTION.test(process.env.NODE_ENV)) {
  console.error('Production environment detected, aborting.');
  process.exit(1);
}

Mysql(log, require('../db-server').errors)
  .connect(config)
  .then((db) => {
    return populateDatabase(db, 0).then(() => {
      const ignore = parseIgnoreFile();
      const procedures = getProcedureNames()
        .map((procedure) => ({
          procedure,
          path: getPath(procedure),
        }))
        .filter(({ path }) => !!path);

      return getSmells(db, procedures, ignore);
    });
  })
  .then(({ errors, warnings }) => {
    errors.forEach((error) => console.error(error));
    warnings.forEach((warning) => console.log(warning));
    console.log(
      `Found ${warnings.length} warnings and failed to explain ${errors.length} queries.`
    );
    process.exit(errors.length + warnings.length);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

function populateDatabase(db, iteration) {
  if (iteration === RECORD_COUNT) {
    return Promise.resolve();
  }

  // The intention here is not to produce meaningful relationships between
  // entities, but instead to make it easy to replace stored procedure args
  // with valid literal values. That's why we use the same tokenId for all
  // the different token types: when we replace `tokenIdArg` or `inTokenId`
  // with a literal value, we want to make sure that value is in the table
  // without needing to parse the table name from the query.
  return createAccount(db)
    .then((uid) => {
      return createSessionToken(db, uid).then((tokenId) => {
        return createDevice(db, uid, tokenId)
          .then(() => createKeyFetchToken(db, uid, tokenId))
          .then(() => createPasswordChangeToken(db, uid, tokenId))
          .then(() => createPasswordForgotToken(db, uid, tokenId))
          .then(() => createAccountResetToken(db, uid, tokenId));
        // TODO: Populate and set KNOWN_ARGS for the other tables
      });
    })
    .then(() => populateDatabase(db, iteration + 1));
}

function createAccount(db) {
  const email = (Math.random() + '').substr(2) + '@example.com';
  const emailCode = crypto.randomBytes(16);
  const normalizedEmail = normalizeEmail(email);
  const time = Date.now();
  const uid = crypto.randomBytes(16);

  if (!KNOWN_ARGS.has('email')) {
    KNOWN_ARGS.set('email', email);
  }

  if (!KNOWN_ARGS.has('emailcode')) {
    KNOWN_ARGS.set('emailcode', emailCode);
  }

  if (!KNOWN_ARGS.has('normalizedemail')) {
    KNOWN_ARGS.set('normalizedemail', normalizedEmail);
  }

  if (!KNOWN_ARGS.has('uid')) {
    KNOWN_ARGS.set('uid', uid);
  }

  return db
    .createAccount(uid, {
      authSalt: crypto.randomBytes(32),
      createdAt: time,
      email,
      emailCode,
      emailVerified: true,
      kA: crypto.randomBytes(32),
      locale: 'en_US',
      normalizedEmail,
      verifierVersion: 1,
      verifierSetAt: time,
      verifyHash: crypto.randomBytes(32),
      wrapWrapKb: crypto.randomBytes(32),
    })
    .then(() => {
      const secondaryEmail = (Math.random() + '').substr(2) + '@example.com';

      return db.createEmail(uid, {
        email: secondaryEmail,
        emailCode: crypto.randomBytes(16),
        normalizedEmail: normalizeEmail(secondaryEmail),
        isVerified: true,
        uid,
        verifiedAt: time,
      });
    })
    .then(() => uid);
}

function createSessionToken(db, uid) {
  const tokenId = crypto.randomBytes(32);
  const tokenVerificationId = crypto.randomBytes(16);

  if (!KNOWN_ARGS.has('sessiontokenid')) {
    KNOWN_ARGS.set('sessiontokenid', tokenId);
  }

  if (!KNOWN_ARGS.has('tokenid')) {
    KNOWN_ARGS.set('tokenid', tokenId);
  }

  if (!KNOWN_ARGS.has('tokenverificationid')) {
    KNOWN_ARGS.set('tokenverificationid', tokenVerificationId);
  }

  return db
    .createSessionToken(tokenId, {
      createdAt: Date.now(),
      data: crypto.randomBytes(32),
      tokenVerificationId,
      uaBrowser: KNOWN_ARGS.get('uabrowser'),
      uaBrowserVersion: KNOWN_ARGS.get('uabrowserversion'),
      uaDeviceType: KNOWN_ARGS.get('uadevicetype'),
      uaOS: KNOWN_ARGS.get('uaos'),
      uaOSVersion: KNOWN_ARGS.get('uaosversion'),
      uid,
    })
    .then(() => tokenId);
}

function createDevice(db, uid, sessionTokenId) {
  const deviceId = crypto.randomBytes(16);

  if (!KNOWN_ARGS.has('deviceid')) {
    KNOWN_ARGS.set('deviceid', deviceId);
  }

  if (!KNOWN_ARGS.has('id')) {
    KNOWN_ARGS.set('id', deviceId);
  }

  return db.createDevice(uid, deviceId, {
    availableCommands: { foo: 'bar', baz: 'qux' },
    createdAt: Date.now(),
    name: 'fake device name',
    sessionTokenId,
    type: KNOWN_ARGS.get('uadevicetype'),
  });
}

function createKeyFetchToken(db, uid, tokenId) {
  return db.createKeyFetchToken(tokenId, {
    authKey: crypto.randomBytes(32),
    createdAt: Date.now(),
    keyBundle: crypto.randomBytes(96),
    uid,
  });
}

function createPasswordChangeToken(db, uid, tokenId) {
  return db.createPasswordChangeToken(tokenId, {
    createdAt: Date.now(),
    data: crypto.randomBytes(32),
    uid,
  });
}

function createPasswordForgotToken(db, uid, tokenId) {
  return db.createPasswordForgotToken(tokenId, {
    createdAt: Date.now(),
    data: crypto.randomBytes(32),
    passCode: crypto.randomBytes(16),
    tries: 0,
    uid,
  });
}

function createAccountResetToken(db, uid, tokenId) {
  const passwordForgotTokenId = crypto.randomBytes(32);

  return createPasswordForgotToken(db, uid, passwordForgotTokenId).then(() =>
    db.forgotPasswordVerified(passwordForgotTokenId, {
      createdAt: Date.now(),
      data: crypto.randomBytes(32),
      tokenId,
      uid,
    })
  );
}

function parseIgnoreFile() {
  const ignore = require('../.migration-lint-ignore');
  ignore.procedures = new Set(ignore.procedures);
  ignore.tables = new Set(ignore.tables);
  return ignore;
}

function getProcedureNames() {
  return cp
    .execSync(
      // eslint-disable-next-line quotes
      `grep 'CALL ' "lib/db/mysql.js" | awk -F 'CALL +' '{print $2}' | cut -d '(' -f 1`,
      RETURN_STRING
    )
    .split('\n')
    .map((procedure) => procedure.trim())
    .filter((procedure) => !!procedure);
}

function getPath(procedure) {
  const path = cp
    .execSync(
      `git grep "${procedure}" | grep 'CREATE PROCEDURE' | sed '/^$/d'`,
      RETURN_STRING
    )
    .match(/(lib\/db\/schema\/patch-[0-9]+-[0-9]+\.sql)/);

  if (path) {
    return path[1];
  }
}

async function getSmells(db, procedures, ignore) {
  const {
    encodingMismatches,
    foreignKeys,
    rowCounts,
    selects,
  } = procedures.reduce(
    (
      { encodingMismatches, foreignKeys, rowCounts, selects },
      { path, procedure }
    ) => {
      const src = fs.readFileSync(path, RETURN_STRING);
      const lines = src.split('\n');
      return {
        encodingMismatches: encodingMismatches.concat(
          extractEncodingMismatches(lines, procedure, ignore)
        ),
        foreignKeys: foreignKeys.concat(extractForeignKeys(lines, ignore)),
        rowCounts: rowCounts.concat(extractRowCounts(lines, procedure, ignore)),
        selects: selects.concat(
          extractSelects(lines, procedure, ignore).map((select) => ({
            path,
            procedure,
            select,
          }))
        ),
      };
    },
    { encodingMismatches: [], foreignKeys: [], rowCounts: [], selects: [] }
  );

  const warnings = encodingMismatches.map(
    (em) =>
      `Warning: expected "${em.expected}" for ${em.arg} in ${em.procedure}!\n${em.line}\n`
  );
  warnings.push(
    ...foreignKeys.map(
      (fk) => `Warning: foreign key in ${fk.from}!\n${fk.line}\n`
    )
  );
  warnings.push(
    ...rowCounts.map(
      (rc) => `Warning: ROW_COUNT() in ${rc.procedure}!\n${rc.line}\n`
    )
  );

  return await selects.reduce(async (promise, query) => {
    const { errors, warnings } = await promise;
    const select = replaceArgs(query.select);

    try {
      const explainResult = await explain(db, select);
      warnings.push(
        ...warn(explainResult).map(
          (warning) =>
            `Warning: ${warning} in ${query.procedure}!\nEXPLAIN ${select}\n`
        )
      );
    } catch (error) {
      errors.push(
        `${error.stack.split('\n')[0]} in ${query.procedure}!\n${select}\n`
      );
    }

    return { errors, warnings };
  }, Promise.resolve({ errors: [], warnings }));
}

// Character encoding mismatches can confuse the query planner, see https://github.com/mozilla/fxa-auth-db-mysql/issues/440
function extractEncodingMismatches(lines, procedureName, ignore) {
  if (ignore.procedures.has(procedureName)) {
    return [];
  }

  let isProcedure = false;
  return lines.reduce((mismatches, line) => {
    line = line.replace(COMMENT, '');
    if (isProcedure) {
      if (END_PROCEDURE.test(line)) {
        isProcedure = false;
      } else {
        const matches = UNENCODED_EMAIL_ARG.exec(line);
        if (matches && matches.length === 2) {
          mismatches.push({
            arg: matches[1],
            expected: 'utf8 COLLATE utf8_bin',
            line: line.trim(),
            procedure: procedureName,
          });
        }
      }
    } else {
      const match = CREATE_PROCEDURE.exec(line);
      if (match && match.length === 2 && match[1] === procedureName) {
        isProcedure = true;
      }
    }

    return mismatches;
  }, []);
}

// FOREIGN KEY constraints can bork migrations, see https://github.com/mozilla/fxa-auth-server/issues/2695
function extractForeignKeys(lines, ignore) {
  let isCreateTable = false,
    table;
  return lines.reduce((foreignKeys, line) => {
    line = line.replace(COMMENT, '');
    if (isCreateTable) {
      if (END_STATEMENT.test(line)) {
        isCreateTable = false;
      } else {
        const matches = FOREIGN_KEY.exec(line);
        if (matches && matches.length === 2) {
          foreignKeys.push({
            from: table,
            to: matches[1],
            line: line.trim(),
          });
        }
      }
    } else {
      const matches = CREATE_TABLE.exec(line);
      if (matches && matches.length === 2 && !ignore.tables.has(matches[1])) {
        isCreateTable = true;
        table = matches[1];
      }
    }

    return foreignKeys;
  }, []);
}

// ROW_COUNT() is not safe for replication, see https://bugzilla.mozilla.org/show_bug.cgi?id=1499819
function extractRowCounts(lines, procedureName, ignore) {
  if (ignore.procedures.has(procedureName)) {
    return [];
  }

  let isProcedure = false;
  return lines.reduce((rowCounts, line) => {
    line = line.replace(COMMENT, '');
    if (isProcedure) {
      if (END_PROCEDURE.test(line)) {
        isProcedure = false;
      }

      if (ROW_COUNT.test(line)) {
        rowCounts.push({
          procedure: procedureName,
          line: line.trim(),
        });
      }
    } else {
      const match = CREATE_PROCEDURE.exec(line);
      if (match && match.length === 2 && match[1] === procedureName) {
        isProcedure = true;
      }
    }

    return rowCounts;
  }, []);
}

function extractSelects(lines, procedureName, ignore) {
  if (ignore.procedures.has(procedureName)) {
    return [];
  }

  let isProcedure = false,
    isSelect = false;
  return lines
    .reduce((selects, line) => {
      line = line.replace(COMMENT, '');
      if (isProcedure) {
        if (END_PROCEDURE.test(line)) {
          isProcedure = isSelect = false;
        } else {
          if (isSelect) {
            selects[selects.length - 1] += ` ${line.trim()}`;
          } else if (SELECT.test(line)) {
            selects.push(line.trim());
            isSelect = true;
          }

          if (END_STATEMENT.test(line)) {
            isSelect = false;
          }
        }
      } else {
        const match = CREATE_PROCEDURE.exec(line);
        if (match && match.length === 2 && match[1] === procedureName) {
          isProcedure = true;
        }
      }

      return selects;
    }, [])
    .map((select) => purgeUnbalancedParentheses(select));
}

function purgeUnbalancedParentheses(select) {
  const openingCount = select.split('(').length;
  const closingCount = select.split(')').length;

  if (openingCount < closingCount) {
    for (let i = 0; i < closingCount - openingCount; ++i) {
      const index = select.lastIndexOf(')');
      select = select.substr(0, index) + select.substr(index + 1);
    }
  } else if (openingCount > closingCount) {
    for (let i = 0; i < openingCount - closingCount; ++i) {
      const index = select.indexOf('(');
      select = select.substr(0, index) + select.substr(index + 1);
    }
  }

  return select;
}

function replaceArgs(select) {
  return select
    .replace(/([ \(])`?in((?:[A-Z][A-Za-z]+)+)`?/g, replaceArg)
    .replace(/([ \(])`?([a-z]+(?:[A-Z][A-Za-z]+)*)Arg`?/g, replaceArg);
}

function replaceArg(match, delimiter, arg) {
  arg = arg.toLowerCase();

  let value = KNOWN_ARGS.has(arg) ? KNOWN_ARGS.get(arg) : '';

  if (Buffer.isBuffer(value)) {
    value = `UNHEX("${value.toString('hex')}")`;
  } else if (typeof value === 'string') {
    value = `"${value}"`;
  }

  return `${delimiter}${value}`;
}

function explain(db, select) {
  return db.read(`EXPLAIN ${select}`, []);
}

function warn(explainRows) {
  return explainRows.reduce((warnings, row) => {
    if (TYPE_FULL_TABLE_SCAN.test(row.type)) {
      warnings.push('full table scan');
    } else if (TYPE_FULL_INDEX_SCAN.test(row.type)) {
      warnings.push('full index scan');
    }

    if (EXTRA_FILESORT.test(row.Extra)) {
      warnings.push('filesort');
    }

    if (EXTRA_TEMPORARY_TABLE.test(row.Extra)) {
      warnings.push('temporary table');
    }

    return warnings;
  }, []);
}
