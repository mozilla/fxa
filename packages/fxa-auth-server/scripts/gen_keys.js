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

function main(cb) {
  var privKey = JwTool.JWK.fromPEM(generateRSAKeypair().private, {
    kid: '2015.12.16-1'
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
  var pubKey = JwTool.JWK.fromPEM(generateRSAKeypair().public, {
    kid: '2015.12.16-2'
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
