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

const NodeRSA = require('node-rsa');

const keyPath = './config/key.json';
const oldKeyPath = './config/oldKey.json';

try {
  var keysExist = fs.existsSync(keyPath) && fs.existsSync(oldKeyPath);
  assert(!keysExist, 'keys already exists');
} catch (e) {
  process.exit();
}

function main(cb) {
  var key = new NodeRSA({b: 2048});

  var genKey = {
    kty: 'RSA',
    kid: '2015.12.16-1',
    n: key.keyPair.n.toString(),
    e: key.keyPair.e.toString(),
    d: key.keyPair.d.toString()
  };

  var genOldKey = {
    kty: 'RSA',
    kid: '2015.12.16-2',
    n: key.keyPair.n.toString(),
    e: key.keyPair.e.toString()
  };

  fs.writeFileSync(keyPath, JSON.stringify(genKey));
  console.log('Key saved:', keyPath); //eslint-disable-line no-console

  fs.writeFileSync(oldKeyPath, JSON.stringify(genOldKey));
  console.log('OldKey saved:', oldKeyPath); //eslint-disable-line no-console
  cb();
}

module.exports = main;

if (require.main === module) {
  main(function () {
  });
}
