#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

if (process.argv.length !== 4) {
  console.error(
    'Usage: node generate-client-for-ops.js "client-name" "client-redirect-url"'
  );
  process.exit(1);
}

var crypto = require('crypto');

var id = crypto.randomBytes(8).toString('hex');
var secret = crypto.randomBytes(32);
var hashedSecret = crypto.createHash('sha256').update(secret).digest('hex');
secret = secret.toString('hex');

var client = {
  id: id,
  name: process.argv[2],
  hashedSecret: hashedSecret,
  redirectUri: process.argv[3],
  imageUri: '',
  canGrant: false,
  termsUri: '',
  privacyUri: '',
  trusted: true,
};

console.log('# Secret to GPG encrypt and send to requestor #');
console.log(secret);
console.log();

console.log('# Data to add to deployment config #');
console.log(JSON.stringify(client, null, 2));
console.log();

var sql = `INSERT INTO clients (id, name, hashedSecret, redirectUri, imageUri, canGrant, termsUri, privacyUri, trusted)
  VALUES (unhex('${client.id}'), '${client.name}', unhex('${
  client.hashedSecret
}'), '${client.redirectUri}', '${client.imageUri}',
  '${client.canGrant ? 1 : 0}', '${client.termsUri}', '${
  client.privacyUri
}', '${client.trusted ? 1 : 0}');`;

console.log('# Data to insert into database #');
console.log(sql);
console.log();
