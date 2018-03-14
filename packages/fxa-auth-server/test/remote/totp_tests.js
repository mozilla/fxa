/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const config = require('../../config').getProperties()
const TestServer = require('../test_server')
const Client = require('../client')()
const otplib = require('otplib')

describe('remote totp', function () {
  let server, client, email, totpToken
  const password = 'pssssst'
  const metricsContext = {
    flowBeginTime: Date.now(),
    flowId: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
  }

  this.timeout(10000)

  otplib.authenticator.options = {
    encoding: 'hex',
    step: config.step
  }

  before(() => {
    return TestServer.start(config)
      .then(s => {
        server = s
      })
  })

  beforeEach(() => {
    email = server.uniqueEmail()
    return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
      .then((x) => {
        client = x
        assert.ok(client.authAt, 'authAt was set')
        return client.createTotpToken({metricsContext})
          .then((result) => {
            otplib.authenticator.options = {
              secret: result.secret
            }
            totpToken = result

            // Verify TOTP token
            const code = otplib.authenticator.generate()
            return client.verifyTotpCode(code, {metricsContext})
              .then((response) => {
                assert.equal(response.success, true, 'totp codes match')
              })
          })
      })
  })

  it('should create totp token', () => {
    assert.ok(totpToken)
    assert.ok(totpToken.qrCodeUrl)
  })

  it('should check if totp token exists for user', () => {
    return client.checkTotpTokenExists()
      .then((response) => {
        assert.equal(response.exists, true, 'token exists')
      })
  })

  it('should fail to create second totp token for same user', () => {
    return client.createTotpToken()
      .then(assert.fail, (err) => {
        assert.equal(err.code, 400, 'correct error code')
        assert.equal(err.errno, 154, 'correct error errno')
      })
  })

  it('should not fail to delete unknown totp token', () => {
    email = server.uniqueEmail()
    return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
      .then((x) => {
        client = x
        assert.ok(client.authAt, 'authAt was set')
        return client.deleteTotpToken()
          .then((result) => assert.ok(result, 'delete totp token successfully'))
      })
  })

  it('should delete totp token', () => {
    return client.deleteTotpToken()
      .then((result) => {
        assert.ok(result, 'delete totp token successfully')

        // Can create a new token
        return client.checkTotpTokenExists()
          .then((result) => {
            assert.equal(result.exists, false, 'token does not exist')
          })
      })
  })

  it('should request `totp-2fa` on login if user has verified totp token', () => {
    return Client.login(config.publicUrl, email, password)
      .then((response) => {
        assert.equal(response.verificationMethod, 'totp-2fa', 'verification method set')
        assert.equal(response.verificationReason, 'login', 'verification reason set')
      })
  })

  it('should login if user has unverified totp token', () => {
    return client.deleteTotpToken()
      .then(() => client.createTotpToken())
      .then(() => Client.login(config.publicUrl, email, password))
      .then((response) => {
        assert.equal(response.verificationMethod, undefined, 'verification method not set')
        assert.equal(response.verificationReason, undefined, 'verification reason not set')
      })
  })

  describe('totp code verification', () => {
    beforeEach(() => {
      // Create a new unverified session to test totp codes
      return Client.login(config.publicUrl, email, password)
        .then((response) => client = response)
    })

    it('should fail to verify totp code', () => {
      const code = otplib.authenticator.generate()
      const incorrectCode = code === '123456' ? '123455' : '123456'
      return client.verifyTotpCode(incorrectCode, {metricsContext})
        .then((result) => {
          assert.equal(result.success, false, 'failed')
        })
    })

    it('should reject non-numeric codes', () => {
      return client.verifyTotpCode('wrong', {metricsContext})
        .then( assert.fail, (err) => {
          assert.equal(err.code, 400, 'correct error code')
          assert.equal(err.errno, 107, 'correct error errno')
        })
    })

    it('should fail to verify totp code that does not have totp token', () => {
      email = server.uniqueEmail()
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then((x) => {
          client = x
          assert.ok(client.authAt, 'authAt was set')
          return client.verifyTotpCode('123456', {metricsContext})
            .then(assert.fail, (err) => {
              assert.equal(err.code, 400, 'correct error code')
              assert.equal(err.errno, 155, 'correct error errno')
            })
        })
    })

    it('should verify totp code', () => {
      const code = otplib.authenticator.generate()
      return client.verifyTotpCode(code, {metricsContext})
        .then((response) => {
          assert.equal(response.success, true, 'totp codes match')
        })
    })
  })

  after(() => {
    return TestServer.stop(server)
  })
})
