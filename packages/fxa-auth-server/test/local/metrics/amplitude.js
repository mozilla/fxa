/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const amplitudeModule = require('../../../lib/metrics/amplitude');
const mocks = require('../../mocks');

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
        oauth: { clientIds: {} },
        verificationReminders: {},
      })
    );
  });

  it('throws if config argument is missing', () => {
    assert.throws(() =>
      amplitudeModule(
        {},
        { oauth: { clientIds: null }, verificationReminders: {} }
      )
    );
  });

  describe('instantiate', () => {
    let log, amplitude;

    beforeEach(() => {
      log = mocks.mockLog();
      amplitude = amplitudeModule(log, {
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

    describe('account.confirmed', () => {
      beforeEach(() => {
        const now = Date.now();
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
        assert.ok(/^[1-9][0-9]+$/.test(args[0].app_version));
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

    describe('account.verified, marketingOptIn=true', () => {
      beforeEach(() => {
        return amplitude('account.verified', mocks.mockRequest({}), {
          marketingOptIn: true,
        });
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_reg - email_confirmed');
        assert.equal(args[0].user_properties.newsletter_state, 'subscribed');
      });
    });

    describe('account.verified, marketingOptIn=false', () => {
      beforeEach(() => {
        return amplitude('account.verified', mocks.mockRequest({}), {
          marketingOptIn: false,
        });
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_reg - email_confirmed');
        assert.equal(args[0].user_properties.newsletter_state, 'unsubscribed');
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

    describe('email.newDeviceLoginEmail.bounced', () => {
      beforeEach(() => {
        return amplitude(
          'email.newDeviceLoginEmail.bounced',
          mocks.mockRequest({}),
          {
            email_domain: 'gmail',
            email_sender: 'ses',
            email_service: 'fxa-email-service',
            templateVersion: 'wibble',
          }
        );
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_email - bounced');
        assert.equal(args[0].event_properties.email_type, 'login');
        assert.equal(args[0].event_properties.email_provider, 'gmail');
        assert.equal(args[0].event_properties.email_sender, 'ses');
        assert.equal(
          args[0].event_properties.email_service,
          'fxa-email-service'
        );
        assert.equal(
          args[0].event_properties.email_template,
          'newDeviceLoginEmail'
        );
        assert.equal(args[0].event_properties.email_version, 'wibble');
      });
    });

    describe('email.newDeviceLoginEmail.sent', () => {
      beforeEach(() => {
        return amplitude(
          'email.newDeviceLoginEmail.sent',
          mocks.mockRequest({})
        );
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_email - sent');
        assert.equal(args[0].event_properties.email_type, 'login');
        assert.equal(args[0].event_properties.email_provider, undefined);
      });
    });

    describe('email.passwordChangedEmail.bounced', () => {
      beforeEach(() => {
        return amplitude(
          'email.passwordChangedEmail.bounced',
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
        assert.equal(args[0].event_properties.email_type, 'change_password');
      });
    });

    describe('email.passwordChangedEmail.sent', () => {
      beforeEach(() => {
        return amplitude(
          'email.passwordChangedEmail.sent',
          mocks.mockRequest({})
        );
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_email - sent');
        assert.equal(args[0].event_properties.email_type, 'change_password');
      });
    });

    describe('email.passwordResetEmail.bounced', () => {
      beforeEach(() => {
        return amplitude(
          'email.passwordResetEmail.bounced',
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
        assert.equal(args[0].event_properties.email_type, 'reset_password');
      });
    });

    describe('email.passwordResetEmail.sent', () => {
      beforeEach(() => {
        return amplitude(
          'email.passwordResetEmail.sent',
          mocks.mockRequest({})
        );
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_email - sent');
        assert.equal(args[0].event_properties.email_type, 'reset_password');
      });
    });

    describe('email.passwordResetRequiredEmail.bounced', () => {
      beforeEach(() => {
        return amplitude(
          'email.passwordResetRequiredEmail.bounced',
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
        assert.equal(args[0].event_properties.email_type, 'reset_password');
      });
    });

    describe('email.passwordResetRequiredEmail.sent', () => {
      beforeEach(() => {
        return amplitude(
          'email.passwordResetRequiredEmail.sent',
          mocks.mockRequest({})
        );
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_email - sent');
        assert.equal(args[0].event_properties.email_type, 'reset_password');
      });
    });

    describe('email.postRemoveSecondaryEmail.bounced', () => {
      beforeEach(() => {
        return amplitude(
          'email.postRemoveSecondaryEmail.bounced',
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
        assert.equal(args[0].event_properties.email_type, 'secondary_email');
      });
    });

    describe('email.postRemoveSecondaryEmail.sent', () => {
      beforeEach(() => {
        return amplitude(
          'email.postRemoveSecondaryEmail.sent',
          mocks.mockRequest({})
        );
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_email - sent');
        assert.equal(args[0].event_properties.email_type, 'secondary_email');
      });
    });

    describe('email.postChangePrimaryEmail.bounced', () => {
      beforeEach(() => {
        return amplitude(
          'email.postChangePrimaryEmail.bounced',
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
        assert.equal(args[0].event_properties.email_type, 'change_email');
      });
    });

    describe('email.postChangePrimaryEmail.sent', () => {
      beforeEach(() => {
        return amplitude(
          'email.postChangePrimaryEmail.sent',
          mocks.mockRequest({})
        );
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_email - sent');
        assert.equal(args[0].event_properties.email_type, 'change_email');
      });
    });

    describe('email.postVerifyEmail.bounced', () => {
      beforeEach(() => {
        return amplitude(
          'email.postVerifyEmail.bounced',
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
        assert.equal(args[0].event_properties.email_type, 'registration');
      });
    });

    describe('email.postVerifyEmail.sent', () => {
      beforeEach(() => {
        return amplitude('email.postVerifyEmail.sent', mocks.mockRequest({}));
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_email - sent');
        assert.equal(args[0].event_properties.email_type, 'registration');
      });
    });

    describe('email.postVerifySecondaryEmail.bounced', () => {
      beforeEach(() => {
        return amplitude(
          'email.postVerifySecondaryEmail.bounced',
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
        assert.equal(args[0].event_properties.email_type, 'secondary_email');
      });
    });

    describe('email.postVerifySecondaryEmail.sent', () => {
      beforeEach(() => {
        return amplitude(
          'email.postVerifySecondaryEmail.sent',
          mocks.mockRequest({})
        );
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_email - sent');
        assert.equal(args[0].event_properties.email_type, 'secondary_email');
      });
    });

    describe('email.recoveryEmail.bounced', () => {
      beforeEach(() => {
        return amplitude('email.recoveryEmail.bounced', mocks.mockRequest({}));
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_email - bounced');
        assert.equal(args[0].event_properties.email_type, 'reset_password');
      });
    });

    describe('email.recoveryEmail.sent', () => {
      beforeEach(() => {
        return amplitude('email.recoveryEmail.sent', mocks.mockRequest({}));
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_email - sent');
        assert.equal(args[0].event_properties.email_type, 'reset_password');
      });
    });

    describe('email.unblockCode.bounced', () => {
      beforeEach(() => {
        return amplitude('email.unblockCode.bounced', mocks.mockRequest({}));
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_email - bounced');
        assert.equal(args[0].event_properties.email_type, 'unblock');
      });
    });

    describe('email.unblockCode.sent', () => {
      beforeEach(() => {
        return amplitude('email.unblockCode.sent', mocks.mockRequest({}));
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_email - sent');
        assert.equal(args[0].event_properties.email_type, 'unblock');
      });
    });

    describe('email.verificationReminderFirstEmail.bounced', () => {
      beforeEach(() => {
        return amplitude(
          'email.verificationReminderFirstEmail.bounced',
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
        assert.equal(args[0].event_properties.email_type, 'registration');
      });
    });

    describe('email.verificationReminderFirstEmail.sent', () => {
      beforeEach(() => {
        return amplitude(
          'email.verificationReminderFirstEmail.sent',
          mocks.mockRequest({}),
          {
            templateVersion: 1,
          }
        );
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_email - sent');
        assert.equal(args[0].event_properties.email_type, 'registration');
        assert.equal(
          args[0].event_properties.email_template,
          'verificationReminderFirstEmail'
        );
      });
    });

    describe('email.verificationReminderSecondEmail.bounced', () => {
      beforeEach(() => {
        return amplitude(
          'email.verificationReminderSecondEmail.bounced',
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
        assert.equal(args[0].event_properties.email_type, 'registration');
      });
    });

    describe('email.verificationReminderSecondEmail.sent', () => {
      beforeEach(() => {
        return amplitude(
          'email.verificationReminderSecondEmail.sent',
          mocks.mockRequest({})
        );
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_email - sent');
        assert.equal(args[0].event_properties.email_type, 'registration');
      });
    });

    describe('email.verificationReminderThirdEmail.bounced', () => {
      beforeEach(() => {
        return amplitude(
          'email.verificationReminderThirdEmail.bounced',
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
        assert.equal(args[0].event_properties.email_type, 'registration');
      });
    });

    describe('email.verificationReminderThirdEmail.sent', () => {
      beforeEach(() => {
        return amplitude(
          'email.verificationReminderThirdEmail.sent',
          mocks.mockRequest({})
        );
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_email - sent');
        assert.equal(args[0].event_properties.email_type, 'registration');
      });
    });

    describe('email.verificationReminderFourthEmail.bounced', () => {
      beforeEach(() => {
        return amplitude(
          'email.verificationReminderFourthEmail.bounced',
          mocks.mockRequest({})
        );
      });

      it('did not call log.amplitudeEvent', () => {
        assert.equal(log.amplitudeEvent.callCount, 0);
      });
    });

    describe('email.verificationReminderFourthEmail.sent', () => {
      beforeEach(() => {
        return amplitude(
          'email.verificationReminderFourthEmail.sent',
          mocks.mockRequest({})
        );
      });

      it('did not call log.amplitudeEvent', () => {
        assert.equal(log.amplitudeEvent.callCount, 0);
      });
    });

    describe('email.verifyEmail.bounced', () => {
      beforeEach(() => {
        return amplitude('email.verifyEmail.bounced', mocks.mockRequest({}));
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_email - bounced');
        assert.equal(args[0].event_properties.email_type, 'registration');
      });
    });

    describe('email.verifyEmail.sent', () => {
      beforeEach(() => {
        return amplitude('email.verifyEmail.sent', mocks.mockRequest({}));
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_email - sent');
        assert.equal(args[0].event_properties.email_type, 'registration');
      });
    });

    describe('email.verifyLoginEmail.bounced', () => {
      beforeEach(() => {
        return amplitude(
          'email.verifyLoginEmail.bounced',
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
        assert.equal(args[0].event_properties.email_type, 'login');
      });
    });

    describe('email.verifyLoginEmail.sent', () => {
      beforeEach(() => {
        return amplitude('email.verifyLoginEmail.sent', mocks.mockRequest({}));
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_email - sent');
        assert.equal(args[0].event_properties.email_type, 'login');
      });
    });

    describe('email.verifyLoginCodeEmail.bounced', () => {
      beforeEach(() => {
        return amplitude(
          'email.verifyLoginCodeEmail.bounced',
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
        assert.equal(args[0].event_properties.email_type, 'login');
      });
    });

    describe('email.verifyLoginCodeEmail.sent', () => {
      beforeEach(() => {
        return amplitude(
          'email.verifyLoginCodeEmail.sent',
          mocks.mockRequest({})
        );
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_email - sent');
        assert.equal(args[0].event_properties.email_type, 'login');
      });
    });

    describe('email.verifyPrimaryEmail.bounced', () => {
      beforeEach(() => {
        return amplitude(
          'email.verifyPrimaryEmail.bounced',
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
        assert.equal(args[0].event_properties.email_type, 'verify');
      });
    });

    describe('email.verifyPrimaryEmail.sent', () => {
      beforeEach(() => {
        return amplitude(
          'email.verifyPrimaryEmail.sent',
          mocks.mockRequest({})
        );
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_email - sent');
        assert.equal(args[0].event_properties.email_type, 'verify');
      });
    });

    describe('email.verifySyncEmail.bounced', () => {
      beforeEach(() => {
        return amplitude(
          'email.verifySyncEmail.bounced',
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
        assert.equal(args[0].event_properties.email_type, 'registration');
      });
    });

    describe('email.verifySyncEmail.sent', () => {
      beforeEach(() => {
        return amplitude('email.verifySyncEmail.sent', mocks.mockRequest({}));
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_email - sent');
        assert.equal(args[0].event_properties.email_type, 'registration');
      });
    });

    describe('email.verifySecondaryEmail.bounced', () => {
      beforeEach(() => {
        return amplitude(
          'email.verifySecondaryEmail.bounced',
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
        assert.equal(args[0].event_properties.email_type, 'secondary_email');
      });
    });

    describe('email.verifySecondaryEmail.sent', () => {
      beforeEach(() => {
        return amplitude(
          'email.verifySecondaryEmail.sent',
          mocks.mockRequest({})
        );
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.amplitudeEvent correctly', () => {
        assert.equal(log.amplitudeEvent.callCount, 1);
        const args = log.amplitudeEvent.args[0];
        assert.equal(args[0].event_type, 'fxa_email - sent');
        assert.equal(args[0].event_properties.email_type, 'secondary_email');
      });
    });

    describe('email.wibble.bounced', () => {
      beforeEach(() => {
        return amplitude('email.wibble.bounced', mocks.mockRequest({}));
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('did not call log.amplitudeEvent', () => {
        assert.equal(log.amplitudeEvent.callCount, 0);
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
  });
});
