/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const crypto = require('crypto');
const P = require('../promise');
const randomBytes = P.promisify(require('crypto').randomBytes);
const base32 = require('./random');

// Magic numbers from the node crypto docs:
// https://nodejs.org/api/crypto.html#crypto_crypto_scrypt_password_salt_keylen_options_callback
const DEFAULT_N = 16384;
const DEFAULT_R = 8;
const MAXMEM_MULTIPLIER = 256;
const DEFAULT_MAXMEM = MAXMEM_MULTIPLIER * DEFAULT_N * DEFAULT_R;

const scryptP = P.promisify(crypto.scrypt);
const scryptHash = (input, salt, N = 65536, r = 8, p = 1, len = 32) => {
  let maxmem = DEFAULT_MAXMEM;
  if (N > DEFAULT_N || r > DEFAULT_R) {
    // Conservatively prevent `memory limit exceeded` errors. See the docs for more info:
    // https://nodejs.org/api/crypto.html#crypto_crypto_scrypt_password_salt_keylen_options_callback
    maxmem = MAXMEM_MULTIPLIER * (N || DEFAULT_N) * (r || DEFAULT_R);
  }
  return scryptP(input, salt, len, { N, r, p, maxmem });
};

const BOUNCE_TYPES = new Map([
  ['__fxa__unmapped', 0], // a bounce type we don't yet recognize
  ['Permanent', 1], // Hard
  ['Transient', 2], // Soft
  ['Complaint', 3], // Complaint
]);

const BOUNCE_SUB_TYPES = new Map([
  ['__fxa__unmapped', 0], // a bounce type we don't yet recognize
  ['Undetermined', 1],
  ['General', 2],
  ['NoEmail', 3],
  ['Suppressed', 4],
  ['MailboxFull', 5],
  ['MessageTooLarge', 6],
  ['ContentRejected', 7],
  ['AttachmentRejected', 8],
  ['abuse', 9],
  ['auth-failure', 10],
  ['fraud', 11],
  ['not-spam', 12],
  ['other', 13],
  ['virus', 14],
]);

const VERIFICATION_METHODS = new Map([
  ['email', 0], // sign-in confirmation email link
  ['email-2fa', 1], // sign-in confirmation email code (token code)
  ['totp-2fa', 2], // TOTP code
  ['recovery-code', 3], // Recovery code
]);

module.exports = {
  mapEmailBounceType(val) {
    if (typeof val === 'number') {
      return val;
    } else {
      return BOUNCE_TYPES.get(val) || 0;
    }
  },

  mapEmailBounceSubType(val) {
    if (typeof val === 'number') {
      return val;
    } else {
      return BOUNCE_SUB_TYPES.get(val) || 0;
    }
  },

  mapVerificationMethodType(val) {
    if (typeof val === 'number') {
      return val;
    } else {
      return VERIFICATION_METHODS.get(val) || undefined;
    }
  },

  createHash() {
    const hash = crypto.createHash('sha256');
    const args = [...arguments];
    args.forEach((arg) => {
      hash.update(arg);
    });
    return hash.digest();
  },

  createHashScrypt(input) {
    // Creates an scrypt hash from string input with a randomly generated
    // salt. This matches process on auth-server.
    let salt;
    return randomBytes(32).then((result) => {
      salt = result;
      const inputBuffer = Buffer.from(input);
      return scryptHash(inputBuffer, salt).then((hash) => {
        return { hash, salt };
      });
    });
  },

  compareHashScrypt(input, verifyHash, salt) {
    const inputBuffer = Buffer.from(input);
    return scryptHash(inputBuffer, salt).then((hash) =>
      crypto.timingSafeEqual(hash, verifyHash)
    );
  },

  generateRecoveryCodes(count, length) {
    const randomCodes = [];
    for (let i = 0; i < count; i++) {
      randomCodes.push(base32(length));
    }

    return P.all(randomCodes);
  },

  // A helper function for aggregating name:value pairs into a JSON object.
  //
  // In newer versions of MySQL, there's a neat function called JSON_OBJECTAGG
  // that can be used with `GROUP BY` to collect name:value pairs into a JSON
  // object.  Given a table like this, where each `id` can have zero, one or
  // many names and a corresponding value for each:
  //
  //   +-------+-------+--------+
  //   | id    | name  | value  |
  //   +-------+-------+--------+
  //   | one   | name1 | value1 |
  //   | one   | name2 | value2 |
  //   | two   | name1 | value1 |
  //   | three | NULL  | NULL   |
  //   +-------+-------+--------+
  //
  // Then you can do a query like:
  //
  //    SELECT id, JSON_OBJECTAGG(name, value) AS result
  //    FROM data
  //    GROUP BY 1, 2
  //
  // And get a result with one row per `id`, like:
  //
  //   +-------+----------------------------------+
  //   | id    | result                           |
  //   +-------+----------------------------------+
  //   | one   | { name1: value1, name2: value2 } |
  //   | two   | { name1: value1 }                |
  //   | three | {}                               |
  //   +-------+----------------------------------+
  //
  // Unfortunately, we're not on newer versions of MySQL, so this function implements
  // the same aggregation logic in sofware.  To use it, select all the target rows
  // and ensure they're sorted by grouping id:
  //
  //    rows = db.readAllResults("
  //      SELECT id, name, value
  //      FROM data
  //      ORDER BY 1
  //    ")
  //
  // Then apply `aggregateNameValuePairs` on the rows, providing the names of the
  // columns to use for the group-by id, the keys, the values, and the resulting
  // aggregate:
  //
  //    unique_rows = aggregateNameValuePairs(rows, "id", "name", "value", "result")
  //
  // The end result will be the same as produced by JSON_OBJECTAGG, including correct
  // handling of NULL values in all columns.

  aggregateNameValuePairs(
    rows,
    idColumn,
    nameColumn,
    valueColumn,
    resultColumn
  ) {
    return rows.reduce((items, row) => {
      let curItem = items[items.length - 1];
      // Start a new aggregated item if:
      //   * we're at the start of the list, or
      //   * the upcoming row has a different id then previous.
      //   * the upcoming row has a NULL id (because NULLs never equal each other)
      if (
        !curItem ||
        !row[idColumn] ||
        !curItem[idColumn] ||
        !row[idColumn].equals(curItem[idColumn])
      ) {
        curItem = {};
        Object.keys(row).forEach((column) => {
          if (column !== nameColumn && column !== valueColumn) {
            curItem[column] = row[column];
          }
        });
        // If the id was NULL, this row must have resulted from
        // an outer join with no match in the joined table.
        // The correct aggregated result in this case is NULL.
        curItem[resultColumn] = row[idColumn] ? {} : null;
        items.push(curItem);
      }
      if (row[nameColumn]) {
        curItem[resultColumn][row[nameColumn]] = row[valueColumn];
      }
      return items;
    }, []);
  },
};
