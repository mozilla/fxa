/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require('fs')
const jwcrypto = require('jwcrypto')
const config = require('../config')

require('jwcrypto/lib/algs/rs')
require('jwcrypto/lib/algs/ds')

const _privKey = jwcrypto.loadSecretKey(fs.readFileSync(config.get('secretKeyFile')))

process.on('message', function (message) {
  var clientKey = jwcrypto.loadPublicKey(message.publicKey)
  var now = Date.now()

  jwcrypto.cert.sign(
    {
      publicKey: clientKey,
      principal: { email: message.email },
      //TODO: kA, etc
    },
    {
      issuer: config.get('domain'),
      issuedAt: new Date(now),
      expiresAt: new Date(now + message.duration)
    },
    null,
    _privKey,
    function (err, cert) {
      process.send({ err: err, cert: cert})
    }
  )
})
