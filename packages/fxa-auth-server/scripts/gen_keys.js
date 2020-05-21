#!/usr/bin/env ts-node-script

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* scripts/gen_keys.js creates public and private keys suitable for
   key signing Persona Primary IdP's.

   Usage:
   scripts/gen_keys.js

   Will create these files

       ./config/public-key.json
       ./config/secret-key.json

   If these files already exist, this script will show an error message
   and exit. You must remove both keys if you want to generate a new
   keypair.
*/

'use strict';

const fs = require('fs');
const cp = require('child_process');
const assert = require('assert');
const crypto = require('crypto');

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'dev';
}

const config = require('../config');
const pubKeyFile = config.get('publicKeyFile');
const secretKeyFile = config.get('secretKeyFile');

try {
  const keysExist = fs.existsSync(pubKeyFile) && fs.existsSync(secretKeyFile);
  assert(!keysExist, 'keys already exists');
} catch (e) {
  process.exit();
}

// We tag our keys with their creation time, and a unique key id
// based on a hash of the public key and the timestamp.  The result
// comes out like:
//  {
//    kid: "2017-03-16-ebe69008de771d62cd1cadf9faa6daae"
//    "fxa-createdAt": 1489716000,
//  }
function addKeyProperties(key) {
  const now = new Date();
  key.kty = 'RSA';
  key.kid = `${now.toISOString().slice(0, 10)}-${crypto
    .createHash('sha256')
    .update(key.n)
    .update(key.e)
    .digest('hex')
    .slice(0, 32)}`;
  // Timestamp to nearest hour; consumers don't need to know the precise time.
  key['fxa-createdAt'] = Math.round(now / 1000 / 3600) * 3600;
  return key;
}

console.log('Generating keypair');

cp.exec(
  `openssl genrsa 2048 | ${require
    .resolve('pem-jwk')
    .replace('index.js', 'bin/pem-jwk.js')}`,
  {
    cwd: __dirname,
  },
  (err, stdout, stderr) => {
    const s = JSON.parse(stdout);
    addKeyProperties(s);
    fs.writeFileSync(secretKeyFile, JSON.stringify(s));
    console.error('Secret Key saved:', secretKeyFile);
    const pub = {
      kid: s.kid,
      kty: s.kty,
      'fxa-createdAt': s['fxa-createdAt'],
      n: s.n,
      e: s.e,
    };
    fs.writeFileSync(pubKeyFile, JSON.stringify(pub));
    console.error('Public Key saved:', pubKeyFile);
  }
);
