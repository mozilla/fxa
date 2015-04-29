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

const fs = require('fs')
const cp = require('child_process')
const assert = require("assert")
const config = require('../config')

const pubKeyFile = config.get('publicKeyFile')
const secretKeyFile = config.get('secretKeyFile')

try {
  var keysExist = fs.existsSync(pubKeyFile) && fs.existsSync(secretKeyFile)
  assert(!keysExist, "keys already exists")
} catch(e) {
  process.exit()
}

console.error("Generating keypair")

cp.exec(
  'openssl genrsa 2048 | ../node_modules/pem-jwk/bin/pem-jwk.js',
  {
    cwd: __dirname
  },
  function (err, stdout, stderr) {
    var secret = stdout
    fs.writeFileSync(secretKeyFile, secret)
    console.error("Secret Key saved:", secretKeyFile)
    var s = JSON.parse(secret)
    var pub = {
      kty: 'RSA',
      n: s.n,
      e: s.e
    }
    fs.writeFileSync(pubKeyFile, JSON.stringify(pub))
    console.error("Public Key saved:", pubKeyFile)
  }
)

