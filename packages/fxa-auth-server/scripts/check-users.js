/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

// This script is used to check accounts to see if they exist
// and if their password matches. It exports a CSV file that contains
// whether the password matches, user has MFA enabled, secondary emails and
// primary email verified.
//
// Example input file: ../test/scripts/fixtures/check_users.csv
//
// Usage: node scripts/check-users.js -i <input file> -o <output file>

const fs = require('fs');
const path = require('path');
const program = require('commander');
const pbkdf2 = require('../lib/crypto/pbkdf2');
const hkdf = require('../lib/crypto/hkdf');

program
  .option('-d, --delimiter [delimiter]', 'Delimiter for input file', ':')
  .option('-o, --output <filename>', 'Output filename to save results to')
  .option(
    '-i, --input <filename>',
    'Input filename from which to read input if not specified on the command line'
  )
  .parse(process.argv);

if (!program.input) {
  console.error('input file must be specified');
  process.exit(1);
}

const log = require('../lib/log')({});
const config = require('../config').config.getProperties();
const Token = require('../lib/tokens')(log, config);
const { createDB } = require('../lib/db');
const AuthDB = createDB(config, log, Token);
const Password = require('../lib/crypto/password')(log, config);

function sanitizeValue(v) {
  if (v === undefined || v === null) {
    return '';
  }
  return v;
}
class User {
  constructor(email, password, db) {
    this.email = email;
    this.password = password;
    this.db = db;
  }

  // FxA uses HKDF to derive the authPW from the user's password.
  // This is typically done on the client side since FxA never sees the user's
  // cleartext password.
  async getCredentials(email, password) {
    const stretch = await pbkdf2.derive(
      Buffer.from(password),
      hkdf.KWE('quickStretch', email),
      1000,
      32
    );
    this.authPW = await hkdf(stretch, 'authPW', null, 32);
    this.unwrapBKey = await hkdf(stretch, 'unwrapBKey', null, 32);
    return this;
  }

  async stats() {
    try {
      const accountRecord = await this.db.accountRecord(this.email);
      const credentials = await this.getCredentials(
        accountRecord.primaryEmail.normalizedEmail,
        this.password
      );

      // Check the user password against the stored hash in DB
      const password = new Password(
        credentials.authPW,
        accountRecord.authSalt,
        accountRecord.verifierVersion
      );
      const verifyHash = await password.verifyHash();
      const passwordMatch = await this.db.checkPassword(
        accountRecord.uid,
        verifyHash
      );

      // Check to see if user has MFA enabled
      let mfaEnabled = false;
      try {
        const totpToken = await this.db.totpToken(accountRecord.uid);
        if (totpToken) {
          mfaEnabled = true;
        }
      } catch (err) {}

      const s = {
        email: this.email,
        exists: true,
        passwordMatch: passwordMatch.match,
        mfaEnabled,
        keysChangedAt: accountRecord.keysChangedAt,
        profileChangedAt: accountRecord.profileChangedAt,
        hasSecondaryEmails: accountRecord.emails.length > 1,
        isPrimaryEmailVerified: accountRecord.primaryEmail.isVerified,
      };
      const stat = `${s.email},${s.exists},${sanitizeValue(
        s.passwordMatch
      )},${sanitizeValue(s.mfaEnabled)},${sanitizeValue(
        s.keysChangedAt
      )},${sanitizeValue(s.profileChangedAt)},${sanitizeValue(
        s.hasSecondaryEmails
      )},${sanitizeValue(s.isPrimaryEmailVerified)}`;

      // To monitor script progress, you pipe stdout to a file
      console.log(stat);

      return s;
    } catch (err) {
      return {
        exists: false,
        email: this.email,
      };
    }
  }
}

class CheckUsers {
  constructor(filename) {
    this.users = [];
    this.db = undefined;
    this.filename = filename;
  }

  getItems() {
    try {
      const input = fs
        .readFileSync(path.resolve(this.filename))
        .toString('utf8');

      if (!input.length) {
        return [];
      }

      // Parse the input file CSV style
      return input.split(/\n/).map((s) => {
        const delimiter = program.delimiter || ':';
        const email = s.substring(0, s.indexOf(delimiter));
        const password = s.substring(s.indexOf(delimiter) + 1, s.length);
        return new User(email, password, this.db);
      });
    } catch (err) {
      console.error('No such file or directory');
      process.exit(1);
    }
  }

  async load() {
    this.db = await AuthDB.connect(config);
    this.users = this.getItems();
    console.info(
      '%s accounts loaded from %s',
      this.users.length,
      this.filename
    );
  }

  async close() {
    await this.db.close();
  }

  async userStats() {
    const stats = [];
    for (const user of this.users) {
      if (user.email && user.password) {
        stats.push(await user.stats());
      }
    }
    this.stats = stats;
  }

  saveStats() {
    const stats = this.stats;
    const output = [
      'email,exists,passwordMatch,mfaEnabled,keysChangedAt,profileChangedAt,hasSecondaryEmails,isPrimaryEmailVerified',
    ];

    output.push(
      ...stats.map((s) => {
        return `${s.email},${s.exists},${sanitizeValue(
          s.passwordMatch
        )},${sanitizeValue(s.mfaEnabled)},${sanitizeValue(
          s.keysChangedAt
        )},${sanitizeValue(s.profileChangedAt)},${sanitizeValue(
          s.hasSecondaryEmails
        )},${sanitizeValue(s.isPrimaryEmailVerified)}`;
      })
    );
    const outputFile = program.output || 'stats.csv';
    fs.writeFileSync(path.resolve(outputFile), output.join('\r\n'));

    console.log(`${stats.length} User Stats saved to ${outputFile}`);

    console.table(stats);
  }
}

const checkUsers = new CheckUsers(program.input);

async function main() {
  await checkUsers.load();
  await checkUsers.userStats();
  await checkUsers.saveStats();
  await checkUsers.close();

  // For very large lists, we need to comment this out
  // or else the program will exit before writing contents to output
  if (process.env.NODE_ENV === 'dev') {
    process.exit();
  }
}

main();
