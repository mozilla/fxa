/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const { version } = require('../../../package.json');
const { StatsD } = require('hot-shots');
const { Container } = require('typedi');
const sinon = require('sinon');

const amplitudeModule = require('../../../lib/metrics/amplitude');
const mocks = require('../../mocks');
const mockAmplitudeConfig = {
  schemaValidation: true,
  rawEvents: false,
};

const DAY = 1000 * 60 * 60 * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 28;

describe('metrics/amplitude', () => {
  it('interface is correct', () => {
    assert.equal(typeof amplitudeModule, 'function');
    assert.equal(amplitudeModule.length, 2);
  });

  it('throws if log argument is missing', () => {
    assert.throws(() =>
      amplitudeModule(null, {
        amplitude: mockAmplitudeConfig,
        oauth: { clientIds: {} },
        verificationReminders: {},
      })
    );
  });

  it('throws if config argument is missing', () => {
    assert.throws(() =>
      amplitudeModule(
        {},
        {
          amplitude: mockAmplitudeConfig,
          oauth: { clientIds: null },
          verificationReminders: {},
        }
      )
    );
  });

  describe('instantiate', () => {
    let log, amplitude;

    beforeEach(() => {
      log = mocks.mockLog();
      mockAmplitudeConfig.rawEvents = false;
      amplitude = amplitudeModule(log, {
        amplitude: mockAmplitudeConfig,
        oauth: {
          clientIds: {
            0: 'amo',
            1: 'pocket',
          },
        },
        verificationReminders: {
          firstInterval: 1000,
          secondInterval: 2000,
          thirdInterval: 3000,
        },
      });
    });

    it('interface is correct', () => {
      assert.equal(typeof amplitude, 'function');
      assert.equal(amplitude.length, 2);
    });

    describe('empty event argument', () => {
      beforeEach(() => {
        return amplitude('', mocks.mockRequest({}));
      });

      it('called log.error correctly', () => {
        assert.equal(log.error.callCount, 1);
        assert.equal(log.error.args[0].length, 2);
        assert.equal(log.error.args[0][0], 'amplitude.badArgument');
        assert.deepEqual(log.error.args[0][1], {
          err: 'Bad argument',
          event: '',
          hasRequest: true,
        });
      });

      it('did not call log.amplitudeEvent', () => {
        assert.equal(log.amplitudeEvent.callCount, 0);
      });
    });

    describe('missing request argument', () => {
      beforeEach(() => {
        return amplitude('foo');
      });

      it('called log.error correctly', () => {
        assert.equal(log.error.callCount, 1);
        assert.equal(log.error.args[0].length, 2);
        assert.equal(log.error.args[0][0], 'amplitude.badArgument');
        assert.deepEqual(log.error.args[0][1], {
          err: 'Bad argument',
          event: 'foo',
          hasRequest: false,
        });
      });

      it('did not call log.amplitudeEvent', () => {
        assert.equal(log.amplitudeEvent.callCount, 0);
      });
    });

    describe('raw events enabled', () => {
      it('logged a raw event', async () => {
        const statsd = { increment: sinon.spy() };
        Container.set(StatsD, statsd);
        mockAmplitudeConfig.rawEvents = true;
        const now = Date.now();
        await amplitude(
          'account.confirmed',
          mocks.mockRequest({
            uaBrowser: 'foo',
            uaBrowserVersion: 'bar',
            uaOS: 'baz',
            uaOSVersion: 'qux',
            uaDeviceType: 'pawk',
            uaFormFactor: 'melm',
            locale: 'wibble',
            credentials: {
              uid: 'blee',
            },
            devices: [],
            geo: {
              location: {
                country: 'United Kingdom',
                state: 'England',
              },
            },
            query: {
              service: '0',
            },
            payload: {
              metricsContext: {
                deviceId: 'juff',
                flowId: 'udge',
                flowBeginTime: 'kwop',
              },
            },
          }),
          { useless: 'junk', utm_source: 'quuz' },
          { time: now }
        );
        const expectedEvent = {
          time: now,
          type: 'account.confirmed',
        };
        const expectedContext = {
          deviceId: 'juff',
          devices: [],
          emailDomain: undefined,
          emailSender: undefined,
          emailService: undefined,
          emailTypes: {
            downloadSubscription: 'subscription_download',
            lowRecoveryCodes: '2fa',
            newDeviceLogin: 'login',
            passwordChanged: 'change_password',
            passwordReset: 'reset_password',
            passwordResetAccountRecovery: 'account_recovery',
            passwordResetRequired: 'reset_password',
            postAddAccountRecovery: 'account_recovery',
            postAddTwoStepAuthentication: '2fa',
            postChangePrimary: 'change_email',
            postConsumeRecoveryCode: '2fa',
            postNewRecoveryCodes: '2fa',
            postRemoveAccountRecovery: 'account_recovery',
            postRemoveSecondary: 'secondary_email',
            postRemoveTwoStepAuthentication: '2fa',
            postVerify: 'registration',
            postVerifyAddRecoveryKey: 'registration',
            postVerifyAddSecondary: 'registration',
            postVerifySecondary: 'secondary_email',
            recovery: 'reset_password',
            subscriptionUpgrade: 'subscription_upgrade',
            subscriptionDowngrade: 'subscription_downgrade',
            subscriptionPaymentExpired: 'subscription_payment_expired',
            subscriptionPaymentFailed: 'subscription_payment_failed',
            subscriptionAccountDeletion: 'subscription_account_deletion',
            subscriptionCancellation: 'subscription_cancellation',
            subscriptionFirstInvoice: 'subscription_first_invoice',
            subscriptionSubsequentInvoice: 'subscription_subsequent_invoice',
            unblockCode: 'unblock',
            verificationReminderFirst: 'registration',
            verificationReminderFirstEmail: 'registration',
            verificationReminderSecond: 'registration',
            verificationReminderSecondEmail: 'registration',
            verificationReminderThirdEmail: 'registration',
            verify: 'registration',
            verifyLogin: 'login',
            verifyLoginCode: 'login',
            verifyPrimary: 'verify',
            verifySecondary: 'secondary_email',
            verifySecondaryCode: 'secondary_email',
            verifyShortCode: 'registration',
          },
          eventSource: 'auth',
          flowBeginTime: 'kwop',
          flowId: 'udge',
          formFactor: 'melm',
          lang: 'wibble',
          location: {
            country: 'United Kingdom',
            state: 'England',
          },
          planId: undefined,
          productId: undefined,
          service: '0',
          uid: 'blee',
          userAgent: 'test user-agent',
          utm_source: 'quuz',
          version,
        };
        assert.deepEqual(log.info.args[0][1]['event'], expectedEvent);
        assert.deepEqual(log.info.args[0][1]['context'], expectedContext);
        assert.isTrue(log.info.calledOnceWith('rawAmplitudeData'), {
          event: expectedEvent,
          context: expectedContext,
        });
        sinon.assert.calledTwice(statsd.increment);
        sinon.assert.calledWith(
          statsd.increment.firstCall,
          'amplitude.event.raw'
        );
        sinon.assert.calledWith(statsd.increment.secondCall, 'amplitude.event');
      });
    });

    describe('account.confirmed', () => {
      beforeEach(() => {
        const now = Date.now();
        Container.set(StatsD, { increment: sinon.spy() });
        return amplitude(
          'account.confirmed',
          mocks.mockRequest({
            uaBrowser: 'foo',
            uaBrowserVersion: 'bar',
            uaOS: 'baz',
            uaOSVersion: 'qux',
            uaDeviceType: 'pawk',
            uaFormFactor: 'melm',
            locale: 'wibble',
            credentials: {
              uid: 'blee',
            },
            devices: [
              { lastAccessTime: now - DAY + 10000 },
              { lastAccessTime: now - WEEK + 10000 },
              { lastAccessTime: now - MONTH + 10000 },
              { lastAccessTime: now - MONTH - 1 },
            ],
            geo: {
              location: {
                country: 'United Kingdom',
                state: 'England',
              },
            },
            query: {
              service: '0',
            },
            payload: {
              metricsContext: {
                deviceId: 'juff',
                flowId: 'udge',
                flowBeginTime: 'kwop',
              },
            },
          })
        );
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args.length, 1);
        assert.equal(args[0].device_id, 'juff');
        assert.equal(args[0].user_id, 'blee');
        assert.equal(args[0].event_type, 'fxa_login - email_confirmed');
        assert.equal(args[0].session_id, 'kwop');
        assert.equal(args[0].language, 'wibble');
        assert.equal(args[0].country, 'United Kingdom');
        assert.equal(args[0].region, 'England');
        assert.equal(args[0].os_name, 'baz');
        assert.equal(args[0].os_version, 'qux');
        assert.equal(args[0].device_model, 'melm');
        assert.deepEqual(args[0].event_properties, {
          service: 'amo',
          oauth_client_id: '0',
        });
        assert.deepEqual(args[0].user_properties, {
          flow_id: 'udge',
          sync_active_devices_day: 1,
          sync_active_devices_week: 2,
          sync_active_devices_month: 3,
          sync_device_count: 4,
          ua_browser: 'foo',
          ua_version: 'bar',
          $append: {
            fxa_services_used: 'amo',
          },
        });
        assert.ok(args[0].time > Date.now() - 1000);
        assert.ok(/^([0-9]+)\.([0-9])$/.test(args[0].app_version));
        const statsd = Container.get(StatsD);
        sinon.assert.calledWith(statsd.increment.firstCall, 'amplitude.event');
      });
    });

    describe('account.created', () => {
      beforeEach(() => {
        const request = mocks.mockRequest({
          uaBrowser: 'a',
          uaBrowserVersion: 'b',
          uaOSVersion: 'd',
          uaDeviceType: 'e',
          uaFormFactor: 'f',
          locale: 'g',
          credentials: {
            uid: 'h',
          },
          devices: [],
          query: {
            service: '0',
          },
          payload: {
            service: '1',
          },
        });
        // mockRequest forces uaOS if it's not set
        request.app.ua.os = '';
        return amplitude('account.created', request);
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].device_id, undefined);
        assert.equal(args[0].user_id, 'h');
        assert.equal(args[0].event_type, 'fxa_reg - created');
        assert.equal(args[0].session_id, undefined);
        assert.equal(args[0].language, 'g');
        assert.equal(args[0].country, 'United States');
        assert.equal(args[0].region, 'California');
        assert.equal(args[0].os_name, undefined);
        assert.equal(args[0].os_version, undefined);
        assert.equal(args[0].device_model, 'f');
        assert.deepEqual(args[0].event_properties, {
          service: 'pocket',
          oauth_client_id: '1',
        });
        assert.deepEqual(args[0].user_properties, {
          sync_active_devices_day: 0,
          sync_active_devices_week: 0,
          sync_active_devices_month: 0,
          sync_device_count: 0,
          ua_browser: 'a',
          ua_version: 'b',
          $append: {
            fxa_services_used: 'pocket',
          },
        });
      });
    });

    describe('account.login', () => {
      beforeEach(() => {
        return amplitude(
          'account.login',
          mocks.mockRequest(
            {
              query: {
                service: '2',
              },
            },
            {
              devices: {},
            }
          )
        );
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_login - success');
        assert.equal(args[0].event_properties.service, 'undefined_oauth');
        assert.equal(args[0].event_properties.oauth_client_id, '2');
        assert.deepEqual(args[0].user_properties['$append'], {
          fxa_services_used: 'undefined_oauth',
        });
        assert.equal(
          args[0].user_properties.sync_active_devices_day,
          undefined
        );
        assert.equal(
          args[0].user_properties.sync_active_devices_week,
          undefined
        );
        assert.equal(
          args[0].user_properties.sync_active_devices_month,
          undefined
        );
        assert.equal(args[0].user_properties.sync_device_count, undefined);
      });
    });

    describe('account.login.blocked', () => {
      beforeEach(() => {
        return amplitude(
          'account.login.blocked',
          mocks.mockRequest({
            payload: {
              service: 'sync',
            },
          })
        );
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_login - blocked');
        assert.equal(args[0].event_properties.service, 'sync');
        assert.equal(args[0].event_properties.oauth_client_id, undefined);
        assert.deepEqual(args[0].user_properties['$append'], {
          fxa_services_used: 'sync',
        });
      });
    });

    describe('account.login.confirmedUnblockCode', () => {
      beforeEach(() => {
        return amplitude(
          'account.login.confirmedUnblockCode',
          mocks.mockRequest({})
        );
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_login - unblock_success');
      });
    });

    describe('account.reset', () => {
      beforeEach(() => {
        return amplitude('account.reset', mocks.mockRequest({}));
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 2);
        let args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_login - forgot_complete');
        args = log.amplitudeEvent.args[1];
        assert.equal(args[0].event_type, 'fxa_login - complete');
        assert.isAbove(args[0].time, log.amplitudeEvent.args[0][0].time);
      });
    });

    describe('account.signed', () => {
      beforeEach(() => {
        return amplitude(
          'account.signed',
          mocks.mockRequest({
            payload: {
              service: 'content-server',
            },
          })
        );
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_activity - cert_signed');
        assert.equal(args[0].event_properties.service, undefined);
        assert.equal(args[0].event_properties.oauth_client_id, undefined);
        assert.equal(args[0].user_properties['$append'], undefined);
      });
    });

    describe('account.verified', () => {
      beforeEach(() => {
        return amplitude('account.verified', mocks.mockRequest({}));
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_reg - email_confirmed');
        assert.equal(args[0].user_properties.newsletter_state, undefined);
      });
    });

    describe('account.verified, newsletters is empty', () => {
      beforeEach(() => {
        return amplitude('account.verified', mocks.mockRequest({}), {
          newsletters: [],
        });
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_reg - email_confirmed');
        assert.deepEqual(args[0].user_properties.newsletters, []);
      });
    });

    describe('account.verified, subscribe to beta newsletters', () => {
      beforeEach(() => {
        return amplitude('account.verified', mocks.mockRequest({}), {
          newsletters: ['test-pilot'],
        });
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_reg - email_confirmed');
        assert.deepEqual(args[0].user_properties.newsletters, ['test_pilot']);
      });
    });

    describe('flow.complete (sign-up)', () => {
      beforeEach(() => {
        return amplitude(
          'flow.complete',
          mocks.mockRequest({}),
          {},
          {
            flowType: 'registration',
          }
        );
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_reg - complete');
      });
    });

    describe('flow.complete (sign-in)', () => {
      beforeEach(() => {
        return amplitude(
          'flow.complete',
          mocks.mockRequest({}),
          {},
          {
            flowType: 'login',
          }
        );
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_login - complete');
      });
    });

    describe('flow.complete (reset)', () => {
      beforeEach(() => {
        return amplitude('flow.complete', mocks.mockRequest({}));
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('did not call log.amplitudeEvent', () => {
        assert.equal(log.amplitudeEvent.callCount, 0);
      });
    });

    describe('sms.installFirefox.sent', () => {
      beforeEach(() => {
        return amplitude('sms.installFirefox.sent', mocks.mockRequest({}));
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_sms - sent');
      });
    });

    describe('device.created', () => {
      beforeEach(() => {
        return amplitude('device.created', mocks.mockRequest({}));
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('did not call log.amplitudeEvent', () => {
        assert.equal(log.amplitudeEvent.callCount, 0);
      });
    });

    describe('email templates', () => {
      const templates = require('../../../lib/senders/templates/_versions');
      const emailTypes = amplitudeModule.EMAIL_TYPES;

      for (const template in templates) {
        // Ignore sms based templates since they don't have the
        // same sent/bounce/delivered logic as emails
        if (template.includes('sms')) {
          continue;
        }

        it(`${template} should be in amplitudes email types`, () => {
          assert.hasAnyKeys(emailTypes, template);
        });

        describe(`email.${template}.bounced`, () => {
          beforeEach(() => {
            return amplitude(
              `email.${template}.bounced`,
              mocks.mockRequest({})
            );
          });

          it('did not call log.error', () => {
            assert.equal(log.error.callCount, 0);
          });

          it('called log.amplitudeEvent correctly', () => {
            assert.equal(log.amplitudeEvent.callCount, 1);
            const args = log.amplitudeEvent.args[0];
            assert.equal(args[0].event_type, 'fxa_email - bounced');
            assert.equal(
              args[0].event_properties.email_type,
              emailTypes[template]
            );
          });
        });

        describe(`email.${template}.sent`, () => {
          beforeEach(() => {
            return amplitude(`email.${template}.sent`, mocks.mockRequest({}));
          });

          it('did not call log.error', () => {
            assert.equal(log.error.callCount, 0);
          });

          it('called log.amplitudeEvent correctly', () => {
            assert.equal(log.amplitudeEvent.callCount, 1);
            const args = log.amplitudeEvent.args[0];
            assert.equal(args[0].event_type, 'fxa_email - sent');
            assert.equal(
              args[0].event_properties.email_type,
              emailTypes[template]
            );
          });
        });

        describe(`email.${template}.bounced`, () => {
          beforeEach(() => {
            return amplitude(
              `email.${template}.bounced`,
              mocks.mockRequest({})
            );
          });

          it('did not call log.error', () => {
            assert.equal(log.error.callCount, 0);
          });

          it('called log.amplitudeEvent correctly', () => {
            assert.equal(log.amplitudeEvent.callCount, 1);
            const args = log.amplitudeEvent.args[0];
            assert.equal(args[0].event_type, 'fxa_email - bounced');
            assert.equal(
              args[0].event_properties.email_type,
              emailTypes[template]
            );
          });
        });
      }
    });

    describe('email.wibble.bounced', () => {
      beforeEach(() => {
        Container.set(StatsD, { increment: sinon.spy() });
        return amplitude('email.wibble.bounced', mocks.mockRequest({}));
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('did not call log.amplitudeEvent', () => {
        assert.equal(log.amplitudeEvent.callCount, 0);
      });

      it('incremented amplitude dropped', () => {
        const statsd = Container.get(StatsD);
        sinon.assert.calledTwice(statsd.increment);
        sinon.assert.calledWith(statsd.increment.firstCall, 'amplitude.event');
        sinon.assert.calledWith(
          statsd.increment.secondCall,
          'amplitude.event.dropped'
        );
      });
    });

    describe('email.wibble.sent', () => {
      beforeEach(() => {
        return amplitude('email.wibble.sent', mocks.mockRequest({}));
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('did not call log.amplitudeEvent', () => {
        assert.equal(log.amplitudeEvent.callCount, 0);
      });
    });

    describe('with data', () => {
      beforeEach(() => {
        return amplitude(
          'account.signed',
          mocks.mockRequest({
            credentials: {
              uid: 'foo',
            },
            payload: {
              service: 'bar',
            },
            query: {
              service: 'baz',
            },
          }),
          {
            service: 'zang',
            uid: 'frip',
          }
        );
      });

      it('data properties were set', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].user_id, 'frip');
        assert.equal(args[0].event_properties.service, 'undefined_oauth');
        assert.equal(args[0].event_properties.oauth_client_id, 'zang');
      });
    });

    describe('with metricsContext', () => {
      beforeEach(() => {
        return amplitude(
          'sms.installFirefox.sent',
          mocks.mockRequest({
            payload: {
              metricsContext: {
                deviceId: 'foo',
                flowId: 'bar',
                flowBeginTime: 'baz',
              },
            },
          }),
          {},
          {
            device_id: 'plin',
            flow_id: 'gorb',
            flowBeginTime: 'yerx',
            service: '0',
            time: 'wenf',
          }
        );
      });

      it('metricsContext properties were set', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].device_id, 'plin');
        assert.equal(args[0].event_properties.service, 'amo');
        assert.equal(args[0].user_properties.flow_id, 'gorb');
        assert.equal(
          args[0].user_properties['$append'].fxa_services_used,
          'amo'
        );
        assert.equal(args[0].session_id, 'yerx');
        assert.equal(args[0].time, 'wenf');
      });
    });

    describe('with subscription', () => {
      beforeEach(() => {
        return amplitude(
          'sms.installFirefox.sent',
          mocks.mockRequest({
            payload: {
              metricsContext: {
                planId: 'bar',
                productId: 'foo',
              },
            },
          }),
          {},
          {}
        );
      });

      it('subscription properties were set', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_properties.plan_id, 'bar');
        assert.equal(args[0].event_properties.product_id, 'foo');
      });
    });
  });
});
