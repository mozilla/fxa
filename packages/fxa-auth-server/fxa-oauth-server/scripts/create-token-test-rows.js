#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Create token table rows with varying expiresAt values for use in testing
// ../bin/purge_expired_tokens.js

const crypto = require('crypto');
const util = require('util');

const TEST_CLIENT_IDS = [
  'deadbeefdeadbe00',
  'deadbeefdeadbe11',
  'deadbeefdeadbe22',
  'deadbeefdeadbe33',
];

function randomHash(length) {
  return crypto.randomBytes(length).toString('hex');
}

function expiresAt(yearsWindow = 3) {
  const now = Date.now();
  const oneYearMs = 365 * 86400 * 1000;
  const windowSize = yearsWindow * oneYearMs;
  const epochBase = now - windowSize;
  const expiresEpoch = Math.floor(epochBase + Math.random() * windowSize);

  return new Date(expiresEpoch)
    .toISOString()
    .replace('T', ' ')
    .replace(/\.\d{3}Z/, '');
}

function clientId() {
  const index = Math.floor(Math.random() * TEST_CLIENT_IDS.length);
  return TEST_CLIENT_IDS[index];
}

function makeInsertStatement() {
  const data = {
    token: randomHash(32),
    clientId: clientId(),
    userId: randomHash(16),
    email: 'test@example.com',
    type: 'bearer',
    scope: 'oauth',
    expiresAt: expiresAt(),
  };

  const values = util.format(
    "X'%s',X'%s',X'%s','%s','%s','%s','%s'",
    data.token,
    data.clientId,
    data.userId,
    data.email,
    data.type,
    data.scope,
    data.expiresAt
  );

  const insertFmt =
    'INSERT INTO tokens (token, clientId, userId, email, type, scope, expiresAt) VALUES (%s);\n';
  const insert = util.format(insertFmt, values);

  return insert;
}

function main() {
  console.log('DELETE FROM tokens; DELETE FROM clients;\n');

  const clientIdFmt =
    "REPLACE INTO clients VALUES(X'%s', '%s', '', '', 0, 0, NOW(), 0, '', X'%s', X'%s');\n";
  TEST_CLIENT_IDS.forEach(id => {
    process.stdout.write(
      util.format(clientIdFmt, id, id, randomHash(32), randomHash(32))
    );
  });

  const rowCount = Number(process.env.ROW_COUNT) || 1000;
  for (let i = 0; i < rowCount; ++i) {
    process.stdout.write(makeInsertStatement());
  }
}

main();
