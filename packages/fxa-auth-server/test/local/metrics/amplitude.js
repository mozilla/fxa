/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const amplitudeModule = require('../../../lib/metrics/amplitude')
const mocks = require('../../mocks')

describe('metrics/amplitude', () => {
  it('interface is correct', () => {
    assert.equal(typeof amplitudeModule, 'function')
    assert.equal(amplitudeModule.length, 1)
  })

  it('returns undefined if log argument is missing', () => {
    assert.equal(amplitudeModule(), undefined)
  })

  describe('instantiate', () => {
    let log, amplitude

    beforeEach(() => {
      log = mocks.spyLog()
      amplitude = amplitudeModule(log)
    })

    it('interface is correct', () => {
      assert.equal(typeof amplitude, 'function')
      assert.equal(amplitude.length, 2)
    })

    describe('empty event argument', () => {
      beforeEach(() => {
        amplitude('', mocks.mockRequest({}))
      })

      it('called log.error correctly', () => {
        assert.equal(log.error.callCount, 1)
        assert.equal(log.error.args[0].length, 1)
        assert.deepEqual(log.error.args[0][0], {
          op: 'amplitudeMetrics',
          err: 'Bad argument',
          event: '',
          hasRequest: true
        })
      })

      it('did not call log.amplitudeEvent', () => {
        assert.equal(log.amplitudeEvent.callCount, 0)
      })
    })

    describe('missing request argument', () => {
      beforeEach(() => {
        amplitude('foo')
      })

      it('called log.error correctly', () => {
        assert.equal(log.error.callCount, 1)
        assert.equal(log.error.args[0].length, 1)
        assert.deepEqual(log.error.args[0][0], {
          op: 'amplitudeMetrics',
          err: 'Bad argument',
          event: 'foo',
          hasRequest: false
        })
      })

      it('did not call log.amplitudeEvent', () => {
        assert.equal(log.amplitudeEvent.callCount, 0)
      })
    })

    describe('account.confirmed', () => {
      beforeEach(() => {
        amplitude('account.confirmed', mocks.mockRequest({
          uaBrowser: 'foo',
          uaBrowserVersion: 'bar',
          uaOS: 'baz',
          uaOSVersion: 'qux',
          uaDeviceType: 'qux',
          uaFormFactor: 'qux',
          locale: 'wibble',
          credentials: {
            uid: 'blee'
          },
          query: {
            service: 'melm'
          },
          payload: {
            service: 'piff',
            metricsContext: {
              deviceId: 'juff',
              flowId: 'udge',
              flowBeginTime: 'kwop'
            }
          }
        }))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args.length, 1)
        assert.equal(args[0].device_id, 'juff')
        assert.equal(args[0].user_id, 'blee')
        assert.equal(args[0].event_type, 'fxa_login - email_confirmed')
        assert.equal(args[0].session_id, 'kwop')
        assert.equal(args[0].language, 'wibble')
        assert.deepEqual(args[0].event_properties, {
          device_id: args[0].device_id,
          service: 'melm'
        })
        assert.deepEqual(args[0].user_properties, {
          flow_id: 'udge',
          ua_browser: 'foo',
          ua_version: 'bar',
          ua_os: 'baz',
          fxa_uid: args[0].user_id
        })
        assert.ok(args[0].time > Date.now() - 1000)
        assert.ok(/^[1-9][0-9]+$/.test(args[0].app_version))
      })
    })

    describe('account.created', () => {
      beforeEach(() => {
        amplitude('account.created', mocks.mockRequest({
          uaBrowser: 'a',
          uaBrowserVersion: 'b',
          uaOS: 'c',
          uaOSVersion: 'd',
          uaDeviceType: 'd',
          uaFormFactor: 'd',
          locale: 'e',
          credentials: {
            uid: 'f'
          },
          payload: {
            service: 'g'
          }
        }))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].device_id, undefined)
        assert.equal(args[0].user_id, 'f')
        assert.equal(args[0].event_type, 'fxa_reg - created')
        assert.equal(args[0].session_id, undefined)
        assert.equal(args[0].language, 'e')
        assert.deepEqual(args[0].event_properties, {
          device_id: undefined,
          service: 'g'
        })
        assert.deepEqual(args[0].user_properties, {
          flow_id: undefined,
          ua_browser: 'a',
          ua_version: 'b',
          ua_os: 'c',
          fxa_uid: args[0].user_id
        })
      })
    })

    describe('account.login', () => {
      beforeEach(() => {
        amplitude('account.login', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_login - success')
      })
    })

    describe('account.login.blocked', () => {
      beforeEach(() => {
        amplitude('account.login.blocked', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_login - blocked')
      })
    })

    describe('account.login.confirmedUnblockCode', () => {
      beforeEach(() => {
        amplitude('account.login.confirmedUnblockCode', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_login - unblock_success')
      })
    })

    describe('account.reset', () => {
      beforeEach(() => {
        amplitude('account.reset', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_login - forgot_complete')
      })
    })

    describe('account.signed', () => {
      beforeEach(() => {
        amplitude('account.signed', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_activity - cert_signed')
      })
    })

    describe('account.verified', () => {
      beforeEach(() => {
        amplitude('account.verified', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_reg - email_confirmed')
      })
    })

    describe('flow.complete (sign-up)', () => {
      beforeEach(() => {
        amplitude('flow.complete', mocks.mockRequest({}), {}, {
          flowType: 'registration'
        })
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_reg - complete')
      })
    })

    describe('flow.complete (sign-in)', () => {
      beforeEach(() => {
        amplitude('flow.complete', mocks.mockRequest({}), {}, {
          flowType: 'login'
        })
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_login - complete')
      })
    })

    describe('flow.complete (reset)', () => {
      beforeEach(() => {
        amplitude('flow.complete', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('did not call log.amplitudeEvent', () => {
        assert.equal(log.amplitudeEvent.callCount, 0)
      })
    })

    describe('sms.installFirefox.sent', () => {
      beforeEach(() => {
        amplitude('sms.installFirefox.sent', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_sms - sent')
      })
    })

    describe('device.created', () => {
      beforeEach(() => {
        amplitude('device.created', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('did not call log.amplitudeEvent', () => {
        assert.equal(log.amplitudeEvent.callCount, 0)
      })
    })

    describe('email.newDeviceLoginEmail.bounced', () => {
      beforeEach(() => {
        amplitude('email.newDeviceLoginEmail.bounced', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - bounced')
        assert.equal(args[0].event_properties.email_type, 'login')
      })
    })

    describe('email.newDeviceLoginEmail.sent', () => {
      beforeEach(() => {
        amplitude('email.newDeviceLoginEmail.sent', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - sent')
        assert.equal(args[0].event_properties.email_type, 'login')
      })
    })

    describe('email.passwordChangedEmail.bounced', () => {
      beforeEach(() => {
        amplitude('email.passwordChangedEmail.bounced', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - bounced')
        assert.equal(args[0].event_properties.email_type, 'change_password')
      })
    })

    describe('email.passwordChangedEmail.sent', () => {
      beforeEach(() => {
        amplitude('email.passwordChangedEmail.sent', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - sent')
        assert.equal(args[0].event_properties.email_type, 'change_password')
      })
    })

    describe('email.passwordResetEmail.bounced', () => {
      beforeEach(() => {
        amplitude('email.passwordResetEmail.bounced', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - bounced')
        assert.equal(args[0].event_properties.email_type, 'reset_password')
      })
    })

    describe('email.passwordResetEmail.sent', () => {
      beforeEach(() => {
        amplitude('email.passwordResetEmail.sent', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - sent')
        assert.equal(args[0].event_properties.email_type, 'reset_password')
      })
    })

    describe('email.passwordResetRequiredEmail.bounced', () => {
      beforeEach(() => {
        amplitude('email.passwordResetRequiredEmail.bounced', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - bounced')
        assert.equal(args[0].event_properties.email_type, 'reset_password')
      })
    })

    describe('email.passwordResetRequiredEmail.sent', () => {
      beforeEach(() => {
        amplitude('email.passwordResetRequiredEmail.sent', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - sent')
        assert.equal(args[0].event_properties.email_type, 'reset_password')
      })
    })

    describe('email.postRemoveSecondaryEmail.bounced', () => {
      beforeEach(() => {
        amplitude('email.postRemoveSecondaryEmail.bounced', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - bounced')
        assert.equal(args[0].event_properties.email_type, 'secondary_email')
      })
    })

    describe('email.postRemoveSecondaryEmail.sent', () => {
      beforeEach(() => {
        amplitude('email.postRemoveSecondaryEmail.sent', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - sent')
        assert.equal(args[0].event_properties.email_type, 'secondary_email')
      })
    })

    describe('email.postVerifyEmail.bounced', () => {
      beforeEach(() => {
        amplitude('email.postVerifyEmail.bounced', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - bounced')
        assert.equal(args[0].event_properties.email_type, 'registration')
      })
    })

    describe('email.postVerifyEmail.sent', () => {
      beforeEach(() => {
        amplitude('email.postVerifyEmail.sent', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - sent')
        assert.equal(args[0].event_properties.email_type, 'registration')
      })
    })

    describe('email.postVerifySecondaryEmail.bounced', () => {
      beforeEach(() => {
        amplitude('email.postVerifySecondaryEmail.bounced', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - bounced')
        assert.equal(args[0].event_properties.email_type, 'secondary_email')
      })
    })

    describe('email.postVerifySecondaryEmail.sent', () => {
      beforeEach(() => {
        amplitude('email.postVerifySecondaryEmail.sent', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - sent')
        assert.equal(args[0].event_properties.email_type, 'secondary_email')
      })
    })

    describe('email.recoveryEmail.bounced', () => {
      beforeEach(() => {
        amplitude('email.recoveryEmail.bounced', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - bounced')
        assert.equal(args[0].event_properties.email_type, 'reset_password')
      })
    })

    describe('email.recoveryEmail.sent', () => {
      beforeEach(() => {
        amplitude('email.recoveryEmail.sent', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - sent')
        assert.equal(args[0].event_properties.email_type, 'reset_password')
      })
    })

    describe('email.unblockCode.bounced', () => {
      beforeEach(() => {
        amplitude('email.unblockCode.bounced', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - bounced')
        assert.equal(args[0].event_properties.email_type, 'unblock')
      })
    })

    describe('email.unblockCode.sent', () => {
      beforeEach(() => {
        amplitude('email.unblockCode.sent', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - sent')
        assert.equal(args[0].event_properties.email_type, 'unblock')
      })
    })

    describe('email.verificationReminderFirstEmail.bounced', () => {
      beforeEach(() => {
        amplitude('email.verificationReminderFirstEmail.bounced', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - bounced')
        assert.equal(args[0].event_properties.email_type, 'registration')
      })
    })

    describe('email.verificationReminderFirstEmail.sent', () => {
      beforeEach(() => {
        amplitude('email.verificationReminderFirstEmail.sent', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - sent')
        assert.equal(args[0].event_properties.email_type, 'registration')
      })
    })

    describe('email.verificationReminderSecondEmail.bounced', () => {
      beforeEach(() => {
        amplitude('email.verificationReminderSecondEmail.bounced', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - bounced')
        assert.equal(args[0].event_properties.email_type, 'registration')
      })
    })

    describe('email.verificationReminderSecondEmail.sent', () => {
      beforeEach(() => {
        amplitude('email.verificationReminderSecondEmail.sent', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - sent')
        assert.equal(args[0].event_properties.email_type, 'registration')
      })
    })

    describe('email.verificationReminderEmail.bounced', () => {
      beforeEach(() => {
        amplitude('email.verificationReminderEmail.bounced', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - bounced')
        assert.equal(args[0].event_properties.email_type, 'registration')
      })
    })

    describe('email.verificationReminderEmail.sent', () => {
      beforeEach(() => {
        amplitude('email.verificationReminderEmail.sent', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - sent')
        assert.equal(args[0].event_properties.email_type, 'registration')
      })
    })

    describe('email.verifyEmail.bounced', () => {
      beforeEach(() => {
        amplitude('email.verifyEmail.bounced', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - bounced')
        assert.equal(args[0].event_properties.email_type, 'registration')
      })
    })

    describe('email.verifyEmail.sent', () => {
      beforeEach(() => {
        amplitude('email.verifyEmail.sent', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - sent')
        assert.equal(args[0].event_properties.email_type, 'registration')
      })
    })

    describe('email.verifyLoginEmail.bounced', () => {
      beforeEach(() => {
        amplitude('email.verifyLoginEmail.bounced', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - bounced')
        assert.equal(args[0].event_properties.email_type, 'login')
      })
    })

    describe('email.verifyLoginEmail.sent', () => {
      beforeEach(() => {
        amplitude('email.verifyLoginEmail.sent', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - sent')
        assert.equal(args[0].event_properties.email_type, 'login')
      })
    })

    describe('email.verifySyncEmail.bounced', () => {
      beforeEach(() => {
        amplitude('email.verifySyncEmail.bounced', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - bounced')
        assert.equal(args[0].event_properties.email_type, 'registration')
      })
    })

    describe('email.verifySyncEmail.sent', () => {
      beforeEach(() => {
        amplitude('email.verifySyncEmail.sent', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - sent')
        assert.equal(args[0].event_properties.email_type, 'registration')
      })
    })

    describe('email.verifySecondaryEmail.bounced', () => {
      beforeEach(() => {
        amplitude('email.verifySecondaryEmail.bounced', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - bounced')
        assert.equal(args[0].event_properties.email_type, 'secondary_email')
      })
    })

    describe('email.verifySecondaryEmail.sent', () => {
      beforeEach(() => {
        amplitude('email.verifySecondaryEmail.sent', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].event_type, 'fxa_email - sent')
        assert.equal(args[0].event_properties.email_type, 'secondary_email')
      })
    })

    describe('email.wibble.bounced', () => {
      beforeEach(() => {
        amplitude('email.wibble.bounced', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('did not call log.amplitudeEvent', () => {
        assert.equal(log.amplitudeEvent.callCount, 0)
      })
    })

    describe('email.wibble.sent', () => {
      beforeEach(() => {
        amplitude('email.wibble.sent', mocks.mockRequest({}))
      })

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0)
      })

      it('did not call log.amplitudeEvent', () => {
        assert.equal(log.amplitudeEvent.callCount, 0)
      })
    })

    describe('with data', () => {
      beforeEach(() => {
        amplitude('account.signed', mocks.mockRequest({
          credentials: {
            uid: 'foo'
          },
          payload: {
            service: 'bar'
          },
          query: {
            service: 'baz'
          }
        }), {
          service: 'zang',
          uid: 'frip'
        })
      })

      it('data properties were set', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].user_id, 'frip')
        assert.equal(args[0].event_properties.service, 'zang')
        assert.equal(args[0].user_properties.fxa_uid, args[0].user_id)
      })
    })

    describe('with metricsContext', () => {
      beforeEach(() => {
        amplitude('sms.installFirefox.sent', mocks.mockRequest({
          payload: {
            metricsContext: {
              deviceId: 'foo',
              flowId: 'bar',
              flowBeginTime: 'baz'
            }
          }
        }), {}, {
          device_id: 'plin',
          flow_id: 'gorb',
          flowBeginTime: 'yerx',
          time: 'wenf'
        })
      })

      it('metricsContext properties were set', () => {
        assert.equal(log.amplitudeEvent.callCount, 1)
        const args = log.amplitudeEvent.args[0]
        assert.equal(args[0].device_id, 'plin')
        assert.equal(args[0].event_properties.device_id, args[0].device_id)
        assert.equal(args[0].user_properties.flow_id, 'gorb')
        assert.equal(args[0].session_id, 'yerx')
        assert.equal(args[0].time, 'wenf')
      })
    })
  })
})
