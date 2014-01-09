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

const jwcrypto = require("jwcrypto")
const fs = require('fs')
const assert = require("assert")
const config = require('../config')

const pubKeyFile = config.get('publicKeyFile')
const secretKeyFile = config.get('secretKeyFile')

require("jwcrypto/lib/algs/rs")

try {
  assert(! fs.existsSync(pubKeyFile), "public key file: [" + pubKeyFile + "] already exists")
  assert(! fs.existsSync(secretKeyFile), "secret key file: [" + secretKeyFile + "] already exists")
} catch(e) {
  console.error("Error: " + e.message)
  process.exit(1)
}

console.log("Generating keypair. (install libgmp if this takes more than a second)")

// wondering about `keysize: 256`?
// well, 257 = 2048bit key
// still confused? see: https://github.com/mozilla/jwcrypto/blob/master/lib/algs/ds.js#L37-L57

function main(cb) {
  jwcrypto.generateKeypair(
    { algorithm: 'RS', keysize: 256 },
    function(err, keypair) {

      var pubKey = keypair.publicKey.serialize()
      var secretKey = keypair.secretKey.serialize()


      fs.writeFileSync(pubKeyFile, pubKey)
      console.log("Public Key saved:", pubKeyFile)

      fs.writeFileSync(secretKeyFile, secretKey)
      console.log("Secret Key saved:", secretKeyFile)
      cb()
    }
  )
}

module.exports = main

if (require.main === module) {
  main(function () {})
}
