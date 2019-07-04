#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*

 Usage:
 scripts/activate-new-signing-key.js

 Will copy the existing signing key from ./config/key.json into ./config/oldKey.json,
 then move the new signing key from ./config/newKey.json into ./config/key.json.

 */

//eslint-disable no-console

const fs = require('fs');
const assert = require('assert');
const keys = require('../lib/keys');
const config = require('../lib/config');

function main(cb) {
  cb = cb || (() => {});

  const keyPath = config.get('openid.keyFile');
  const key = config.get('openid.key');

  const newKeyPath = config.get('openid.newKeyFile');
  const newKey = config.get('openid.newKey');
  assert(newKey, 'missing new signing key');

  const oldKeyPath = config.get('openid.oldKeyFile');
  const oldKey = keys.extractPublicKey(key);
  fs.writeFileSync(oldKeyPath, JSON.stringify(oldKey, undefined, 2));
  console.log('OldKey saved:', keyPath);

  fs.writeFileSync(keyPath, JSON.stringify(newKey, undefined, 2));
  console.log('Key saved:', keyPath);

  fs.unlinkSync(newKeyPath);
  console.log('NewKey wiped:', keyPath);

  console.log('Please restart the server to begin using the new signing key');
  return cb();
}

module.exports = main;

if (require.main === module) {
  main();
}
