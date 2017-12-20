/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const config = require('../../config').getProperties()
const TestServer = require('../test_server')
const Client = require('../client')()
const error = require('../../lib/error')

describe('remote tokenCodes', function () {
  let server, client, email, code
  const password = 'pssssst'

  this.timeout(10000)

  before(function () {
    return TestServer.start(config)
      .then(s => {
        server = s
      })
  })

  beforeEach(() => {
    email = server.uniqueEmail()
    return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
      .then(function (x) {
        client = x
        assert.ok(client.authAt, 'authAt was set')
      })
  })

  it('should error with invalid code', () => {
    return Client.login(config.publicUrl, email, password, {
      verificationMethod: 'email-2fa'
    })
    .then((res) => {
      client = res
      assert.equal(res.verificationMethod, 'email-2fa', 'sets correct verification method')
      return client.verifyTokenCode('BADCODE')
    })
    .then(() => {
      assert.fail('consumed invalid code')
    }, (err) => {
      assert.equal(err.errno, error.ERRNO.INVALID_TOKEN_VERIFICATION_CODE, 'correct errno')
      return client.emailStatus()
    })
    .then((status) => {
      assert.equal(status.verified, false, 'account is not verified')
      assert.equal(status.emailVerified, true, 'email is verified')
      assert.equal(status.sessionVerified, false, 'session is not verified')
    })
  })

  it('should consume valid code', () => {
    return Client.login(config.publicUrl, email, password, {
      verificationMethod: 'email-2fa'
    })
    .then((res) => {
      client = res
      assert.equal(res.verificationMethod, 'email-2fa', 'sets correct verification method')
      return client.emailStatus()
    })
    .then((status) => {
      assert.equal(status.verified, false, 'account is not verified')
      assert.equal(status.emailVerified, true, 'email is verified')
      assert.equal(status.sessionVerified, false, 'session is not verified')
      return server.mailbox.waitForEmail(email)
    })
    .then((emailData) => {
      assert.equal(emailData.headers['x-template-name'], 'verifyLoginCodeEmail', 'sign-in code sent')
      code = emailData.headers['x-signin-verify-code']
      assert.ok(code, 'code is sent')
      return client.verifyTokenCode(code)
    })
    .then((res) => {
      assert.ok(res, 'verified successful response')
      return client.emailStatus()
    })
    .then((status) => {
      assert.equal(status.verified, true, 'account is verified')
      assert.equal(status.emailVerified, true, 'email is verified')
      assert.equal(status.sessionVerified, true, 'session is verified')
    })
  })

  after(() => {
    return TestServer.stop(server)
  })
})

