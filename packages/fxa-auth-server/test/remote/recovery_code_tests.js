/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const config = require('../../config').getProperties()
const TestServer = require('../test_server')
const Client = require('../client')()
const otplib = require('otplib')
const HEX_STRING = require('../../lib/routes/validators').HEX_STRING

describe('remote recovery codes', function () {
  let server, client, email, recoveryCodes
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

            // Verify TOTP token so that initial recovery codes are generated
            const code = otplib.authenticator.generate()
            return client.verifyTotpCode(code, {metricsContext})
              .then((response) => {
                assert.equal(response.success, true, 'totp codes match')

                recoveryCodes = response.recoveryCodes
                assert.equal(response.recoveryCodes.length, 8, 'recovery codes returned')
                return server.mailbox.waitForEmail(email)
              })
              .then((emailData) => {
                assert.equal(emailData.headers['x-template-name'], 'postAddTwoStepAuthenticationEmail', 'correct template sent')
              })
          })
      })
  })

  it('should create recovery codes', () => {
    assert.ok(recoveryCodes)
    assert.equal(recoveryCodes.length, 8, 'recovery codes returned')
    recoveryCodes.forEach((code) => {
      assert.equal(code.length, 8, 'correct length')
      assert.equal(HEX_STRING.test(code), true, 'code is hex')
    })
  })

  it('should replace recovery codes', () => {
    return client.replaceRecoveryCodes()
      .then((result) => {
        assert.ok(result.recoveryCodes.length, 8, 'recovery codes returned')
        assert.notDeepEqual(result, recoveryCodes, 'recovery codes should not match')

        return server.mailbox.waitForEmail(email)
      })
      .then((emailData) => {
        assert.equal(emailData.headers['x-template-name'], 'postNewRecoveryCodesEmail', 'correct template sent')
      })
  })

  describe('recovery code verification', () => {
    beforeEach(() => {
      // Create a new unverified session to test recovery codes
      return Client.login(config.publicUrl, email, password)
        .then((response) => {
          client = response
          return client.emailStatus()
        })
        .then((res) => assert.equal(res.sessionVerified, false, 'session not verified'))
    })

    it('should fail to consume unknown recovery code', () => {
      return client.consumeRecoveryCode('1234abcd')
        .then(assert.fail, (err) => {
          assert.equal(err.code, 400, 'correct error code')
          assert.equal(err.errno, 156, 'correct error errno')
        })
    })

    it('should consume recovery and verify session', () => {
      return client.consumeRecoveryCode(recoveryCodes[0])
        .then((res) => {
          assert.equal(res.remaining, 7, 'correct remaining codes')
          return client.emailStatus()
        })
        .then((res) => {
          assert.equal(res.sessionVerified, true, 'session verified')
          return server.mailbox.waitForEmail(email)
        })
        .then((emailData) => {
          assert.equal(emailData.headers['x-template-name'], 'postConsumeRecoveryCodeEmail', 'correct template sent')
        })
    })
  })

  after(() => {
    return TestServer.stop(server)
  })
})
