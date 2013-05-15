/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const jwcrypto = require('jwcrypto');
const config = require('../lib/config')

require('jwcrypto/lib/algs/rs')
require('jwcrypto/lib/algs/ds')

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
      issuer: config.domain,
      issuedAt: new Date(now),
      expiresAt: new Date(now + message.duration)
    },
    null,
    config.idpSecretKey,
    function (err, cert) {
    	process.send({ err: err, cert: cert})
    }
  )
})
