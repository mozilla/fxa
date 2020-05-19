#!/usr/bin/env ts-node-script

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*

 Usage:
 scripts/oauth_gen_keys.js

 Will create these files

 ./config/key.json
 ./config/newKey.json
 ./config/oldKey.json

 This script is used for initializing keys in a dev environment.
 If these files already exist, this script will show an error message
 and exit. If you want to generate a new keypair, either use one of
 the key-rotation scripts (e.g. 'prepare-new-signing-key.js') or just
 delete the existing key file (hey, only it's a dev environment!).
 */

//eslint-disable no-console

// If you're running this script, you probably don't have keys created yet.
// This bypasses config checks that would otherwise prevent us from running
// without a properly-configured active key.
process.env.FXA_OPENID_UNSAFELY_ALLOW_MISSING_ACTIVE_KEY = true;

const fs = require('fs');
const path = require('path');
const keys = require('../lib/oauth/keys');
const config = require('../config');

function writeJSONFile(filePath, data) {
  try {
    fs.mkdirSync(filePath.dirname(filePath));
  } catch (accessEx) {}
  fs.writeFileSync(filePath, JSON.stringify(data, undefined, 2));
}

function main(cb) {
  cb = cb || (() => {});

  let keyPath = config.get('oauthServer.openid.keyFile');
  const newKeyPath = config.get('oauthServer.openid.newKeyFile');
  let oldKeyPath = config.get('oauthServer.openid.oldKeyFile');

  // Default fallbacks for running in various dev environments.
  if (!keyPath) {
    keyPath = path.resolve(__dirname, '../config/key.json');
  }
  if (!oldKeyPath) {
    oldKeyPath = path.resolve(__dirname, '../config/oldKey.json');
  }

  var keysExist =
    (keyPath && fs.existsSync(keyPath)) ||
    (newKeyPath && fs.existsSync(newKeyPath)) ||
    (oldKeyPath && fs.existsSync(oldKeyPath));
  if (keysExist) {
    return cb();
  }

  const privKey = keys.generatePrivateKey();
  writeJSONFile(keyPath, privKey);
  console.log('Key saved:', keyPath);

  // The "old key" is not used to sign anything, so we don't need to store
  // the private component, we just need to serve the public component
  // so that old signatures can be verified correctly.  In dev we just
  // write a fake one for testing purposes.
  if (oldKeyPath) {
    const pubKey = keys.extractPublicKey(keys.generatePrivateKey());
    writeJSONFile(oldKeyPath, pubKey);
    console.log('OldKey saved:', oldKeyPath);
  }

  console.log('Please restart the server to begin using the new keys');
  return cb();
}

module.exports = main;

if (require.main === module) {
  main();
}
