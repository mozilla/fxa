#!/usr/bin/env node

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

const fs = require('fs');
const assert = require('assert');

const NodeRSA = require('node-rsa');

const config = require('../config');

const pubKeyFile = config.publicKeyFile;
const secretKeyFile = config.secretKeyFile;

try {
  var keysExist = fs.existsSync(pubKeyFile) && fs.existsSync(secretKeyFile);
  assert(!keysExist, 'keys already exists');
} catch(e) {
  process.exit();
}

function main(cb) {
  var key = new NodeRSA({b: 2048});

  // Format according to "generate-keypair script bundled with jwcrypto."
  // See https://developer.mozilla.org/en-US/Persona/Implementing_a_Persona_IdP#Creating_the_browserid_document
  var pubKey = {
    algorithm: 'RS',
    n: key.keyPair.n.toString(),
    e: key.keyPair.e.toString()
  };

  var secretKey = {
    algorithm: 'RS',
    n: key.keyPair.n.toString(),
    e: key.keyPair.e.toString(),
    d: key.keyPair.d.toString()
  };

  fs.writeFileSync(pubKeyFile, JSON.stringify(pubKey));
  console.log('Public Key saved:', pubKeyFile); //eslint-disable-line no-console

  fs.writeFileSync(secretKeyFile, JSON.stringify(secretKey));
  console.log('Secret Key saved:', secretKeyFile); //eslint-disable-line no-console
  cb();
}

module.exports = main;

if (require.main === module) {
  main(function () {});
}
