#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*

 Usage:
 scripts/gen_keys.js

 Will create these files

 ./config/key.json
 ./config/oldKey.json

 If these files already exist, this script will show an error message
 and exit. You must remove both keys if you want to generate a new
 keypair.
 */

const fs = require('fs');
const assert = require('assert');
const crypto = require('crypto');
const generateRSAKeypair = require('keypair');
const JwTool = require('fxa-jwtool');

const keyPath = './fxa-oauth-server/config/key.json';
const oldKeyPath = './fxa-oauth-server/config/oldKey.json';

try {
  var keysExist = fs.existsSync(keyPath) && fs.existsSync(oldKeyPath);
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
function makeKeyProperties(kp) {
  var now = new Date();
  return {
    // Key id based on timestamp and hash of public key.
    kid:
      now.toISOString().slice(0, 10) +
      '-' +
      crypto
        .createHash('sha256')
        .update(kp.public)
        .digest('hex')
        .slice(0, 32),
    // Timestamp to nearest hour; consumers don't need to know the precise time.
    'fxa-createdAt': Math.round(now / 1000 / 3600) * 3600,
  };
}

function main(cb) {
  var kp = generateRSAKeypair();
  var privKey = JwTool.JWK.fromPEM(kp.private, makeKeyProperties(kp));
  try {
    fs.mkdirSync('./fxa-oauth-server/config');
  } catch (accessEx) {}

  fs.writeFileSync(keyPath, JSON.stringify(privKey.toJSON(), undefined, 2));
  console.log('Key saved:', keyPath); //eslint-disable-line no-console

  // The "old key" is not used to sign anything, so we don't need to store
  // the private component, we just need to serve the public component
  // so that old signatures can be verified correctly.
  kp = generateRSAKeypair();
  var pubKey = JwTool.JWK.fromPEM(kp.public, makeKeyProperties(kp));
  fs.writeFileSync(oldKeyPath, JSON.stringify(pubKey.toJSON(), undefined, 2));
  console.log('OldKey saved:', oldKeyPath); //eslint-disable-line no-console
  cb();
}

module.exports = main;

if (require.main === module) {
  main(function() {});
}
