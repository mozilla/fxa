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

const keyPath = './config/key.json';
const oldKeyPath = './config/oldKey.json';

try {
  var keysExist = fs.existsSync(keyPath) && fs.existsSync(oldKeyPath);
  assert(!keysExist, 'keys already exists');
} catch (e) {
  process.exit();
}

// Generate a unique key id using hash of public key, and timestamp.
// This comes out like "2017-01-23-ebe69008de771d62cd1cadf9faa6daae".
function makeKeyId(kp) {
  return [
    (new Date()).toISOString().slice(0, 10) + '-' +
    crypto.createHash('sha256').update(kp.public).digest('hex').slice(0, 32)
  ].join('-');
}

function main(cb) {
  var kp = generateRSAKeypair();
  var privKey = JwTool.JWK.fromPEM(kp.private, {
    kid: makeKeyId(kp)
  });

  try {
    fs.mkdirSync('./config');
  } catch (accessEx) {

  }

  fs.writeFileSync(keyPath, JSON.stringify(privKey.toJSON(), undefined, 2));
  console.log('Key saved:', keyPath); //eslint-disable-line no-console

  // The "old key" is not used to sign anything, so we don't need to store
  // the private component, we just need to serve the public component
  // so that old signatures can be verified correctly.
  kp = generateRSAKeypair();
  var pubKey = JwTool.JWK.fromPEM(kp.public, {
    kid: makeKeyId(kp)
  });
  fs.writeFileSync(oldKeyPath, JSON.stringify(pubKey.toJSON(), undefined, 2));
  console.log('OldKey saved:', oldKeyPath); //eslint-disable-line no-console
  cb();
}

module.exports = main;

if (require.main === module) {
  main(function () {
  });
}
