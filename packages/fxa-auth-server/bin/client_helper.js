/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('../config').root()
const Client = require('../client')
const keystretch = require('../client/keystretch')

// Monkey-patch Client lib to use configurable SCRYPT_HELPER url.
// This is awful but the whole thing is going to go away soon...
keystretch.SCRYPT_HELPER = config.scryptHelper.url

process.on('message', function (message) {
  if (message.action === 'crash') {
    throw new Error('FML')
  }

  else if (message.action === 'session/create') {
    Client.login(
      config.publicUrl,
      message.email,
      message.password
    )
    .done(
      function (client) {
        process.send({
          uid: client.uid,
          verified: client.verified,
          sessionToken: client.sessionToken.toString('hex')
        })
      },
      function (err) {
        process.send({ err: err })
      }
    )
  }

  else if (message.action === 'account/create') {
    Client.create(
      config.publicUrl,
      message.email,
      message.password,
      message.options || {}
    )
    .done(
      function (client) {
        process.send({ uid: client.uid })
      },
      function (err) {
        process.send({ err: err })
      }
    )
  }

  else if (message.action === 'password/change') {
    Client.changePassword(
      config.publicUrl,
      message.email,
      message.oldPassword,
      message.newPassword
    )
    .done(
      function (client) {
        process.send({})
      },
      function (err) {
        process.send({ err: err })
      }
    )
  }

  else if (message.action === 'password/reset') {
    var client = new Client()
    client.setupCredentials(message.email, message.newPassword)
    .then(
      function () {
        var stretching = message.passwordStretching
        stretching.salt = client.passwordSalt
        process.send({
          srp: client.srp,
          passwordStretching: stretching
        })
      },
      function (err) {
        process.send({ err: err })
      }
    )
  }

  else {
    return process.send({ err: { message: 'unknown action' } })
  }
})

process.on(
  'uncaughtException',
  function (err) {
    process.exit(8)
  }
)
