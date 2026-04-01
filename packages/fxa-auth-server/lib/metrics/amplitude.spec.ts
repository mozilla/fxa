/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import { StatsD } from 'hot-shots';

// ---------------------------------------------------------------------------
// Ensure StatsD is available in the Container before any module-level code
// runs (amplitude.js reads Container.has(StatsD) during initialization).
// ---------------------------------------------------------------------------
Container.set(StatsD, { increment: jest.fn() });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mocks = require('../../test/mocks');
const { version } = require('../../package.json');

const amplitudeModule = require('./amplitude');

const mockAmplitudeConfig = {
  schemaValidation: true,
  rawEvents: false,
  enabled: true,
};

const DAY = 1000 * 60 * 60 * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 28;

// ---------------------------------------------------------------------------
// Tests
//
// NOTE: mocks.mockLog() returns sinon spies, so we access call data via the
// sinon API (.callCount, .args) rather than the jest mock API (.mock.calls).
// StatsD instances created with jest.fn() use the jest API.
// ---------------------------------------------------------------------------

describe('metrics/amplitude', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    Container.reset();
    // Re-seed StatsD so the next test's module-level code can find it
    Container.set(StatsD, { increment: jest.fn() });
  });

  describe('instantiate', () => {
    let log: Record<string, any>;
    let amplitude: (...args: any[]) => Promise<void>;

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

    afterEach(() => {
      mockAmplitudeConfig.enabled = true;
    });

    it('interface is correct', () => {
      expect(typeof amplitude).toBe('function');
      expect(amplitude.length).toBe(2);
    });

    describe('disabling', () => {
      it('does not log events when disabled', async () => {
        // disable config and re-instantiate amplitude for just this test
        mockAmplitudeConfig.enabled = false;
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

        return amplitude('account.created', mocks.mockRequest({})).then(() => {
          // could check other things, but this is the important one that
          // we want to disable when config.enabled is false
          expect(log.amplitudeEvent.callCount).toBe(0);
        });
      });
    });

    // -----------------------------------------------------------------------
    // empty event argument
    // -----------------------------------------------------------------------
    describe('empty event argument', () => {
      beforeEach(() => {
        return amplitude('', mocks.mockRequest({}));
      });

      it('called log.error correctly', () => {
        expect(log.error.callCount).toBe(1);
        expect(log.error.args[0].length).toBe(2);
        expect(log.error.args[0][0]).toBe('amplitude.badArgument');
        expect(log.error.args[0][1]).toEqual({
          err: 'Bad argument',
          event: '',
          hasRequest: true,
        });
      });

      it('did not call log.amplitudeEvent', () => {
        expect(log.amplitudeEvent.callCount).toBe(0);
      });
    });

    // -----------------------------------------------------------------------
    // missing request argument
    // -----------------------------------------------------------------------
    describe('missing request argument', () => {
      beforeEach(() => {
        return amplitude('foo');
      });

      it('called log.error correctly', () => {
        expect(log.error.callCount).toBe(1);
        expect(log.error.args[0].length).toBe(2);
        expect(log.error.args[0][0]).toBe('amplitude.badArgument');
        expect(log.error.args[0][1]).toEqual({
          err: 'Bad argument',
          event: 'foo',
          hasRequest: false,
        });
      });

      it('did not call log.amplitudeEvent', () => {
        expect(log.amplitudeEvent.callCount).toBe(0);
      });
    });

    // -----------------------------------------------------------------------
    // raw events enabled
    // -----------------------------------------------------------------------
    describe('raw events enabled', () => {
      it('logged a raw event', async () => {
        const statsd = { increment: jest.fn() };
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
          emailDomain: undefined,
          emailTypes: amplitudeModule.EMAIL_TYPES,
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
        expect(log.info.args[0][1]['event']).toEqual(expectedEvent);
        expect(log.info.args[0][1]['context']).toEqual(expectedContext);
        expect(log.info.calledOnce).toBe(true);
        expect(log.info.args[0][0]).toBe('rawAmplitudeData');
        expect(statsd.increment).toHaveBeenCalledTimes(2);
        expect(statsd.increment).toHaveBeenNthCalledWith(
          1,
          'amplitude.event.raw'
        );
        expect(statsd.increment).toHaveBeenNthCalledWith(2, 'amplitude.event');
      });
    });

    // -----------------------------------------------------------------------
    // sets metricsEventUid when uid specified
    // -----------------------------------------------------------------------
    describe('sets metricsEventUid when uid specified', () => {
      it('credentials with metricsOptOutAt set do not log', async () => {
        const request = mocks.mockRequest({
          credentials: {
            uid: 'blee',
          },
          auth: {
            artifacts: {},
          },
        });
        await amplitude('account.confirmed', request);
        expect(request.app.metricsEventUid).toBe('blee');
      });
    });

    // -----------------------------------------------------------------------
    // account.confirmed
    // -----------------------------------------------------------------------
    describe('account.confirmed', () => {
      beforeEach(() => {
        const now = Date.now();
        Container.set(StatsD, { increment: jest.fn() });
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
        expect(log.error.callCount).toBe(0);
      });

      it('called log.amplitudeEvent correctly', () => {
        expect(log.amplitudeEvent.callCount).toBe(1);
        const args = log.amplitudeEvent.args[0];
        expect(args.length).toBe(1);
        expect(args[0].device_id).toBe('juff');
        expect(args[0].user_id).toBe('blee');
        expect(args[0].event_type).toBe('fxa_login - email_confirmed');
        expect(args[0].session_id).toBe('kwop');
        expect(args[0].language).toBe('wibble');
        expect(args[0].country).toBe('United Kingdom');
        expect(args[0].region).toBe('England');
        expect(args[0].os_name).toBe('baz');
        expect(args[0].os_version).toBe('qux');
        expect(args[0].device_model).toBe('melm');
        expect(args[0].event_properties).toEqual({
          service: 'amo',
          oauth_client_id: '0',
        });
        expect(args[0].user_properties).toEqual({
          flow_id: 'udge',
          ua_browser: 'foo',
          ua_version: 'bar',
          $append: {
            fxa_services_used: 'amo',
          },
        });
        expect(args[0].time).toBeGreaterThan(Date.now() - 1000);
        expect(/^([0-9]+)\.([0-9]+)$/.test(args[0].app_version)).toBe(true);
        const statsd = Container.get(StatsD) as { increment: jest.Mock };
        expect(statsd.increment).toHaveBeenNthCalledWith(1, 'amplitude.event');
      });
    });

    // -----------------------------------------------------------------------
    // account.created
    // -----------------------------------------------------------------------
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
            uid: 'blee',
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
        expect(log.error.callCount).toBe(0);
      });

      it('called log.amplitudeEvent correctly', () => {
        expect(log.amplitudeEvent.callCount).toBe(1);
        const args = log.amplitudeEvent.args[0];
        expect(args[0].device_id).toBe(undefined);
        expect(args[0].user_id).toBe('blee');
        expect(args[0].event_type).toBe('fxa_reg - created');
        expect(args[0].session_id).toBe(undefined);
        expect(args[0].language).toBe('g');
        expect(args[0].country).toBe('United States');
        expect(args[0].region).toBe('California');
        expect(args[0].os_name).toBe(undefined);
        expect(args[0].os_version).toBe(undefined);
        expect(args[0].device_model).toBe('f');
        expect(args[0].event_properties).toEqual({
          service: 'pocket',
          oauth_client_id: '1',
        });
        expect(args[0].user_properties).toEqual({
          ua_browser: 'a',
          ua_version: 'b',
          $append: {
            fxa_services_used: 'pocket',
          },
        });
      });
    });

    // -----------------------------------------------------------------------
    // account.login
    // -----------------------------------------------------------------------
    describe('account.login', () => {
      beforeEach(() => {
        // The old Mocha test passed { devices: {} } as the errors arg, which
        // created an unhandled Promise.reject({}) on request.app.devices.
        // Node 22 treats unhandled rejections as fatal, so we attach a no-op
        // catch to the rejected promise to prevent the process from crashing.
        const request = mocks.mockRequest(
          {
            query: {
              service: '2',
            },
          },
          {
            devices: {},
          }
        );
        request.app.devices.catch(() => {});
        return amplitude('account.login', request);
      });

      it('did not call log.error', () => {
        expect(log.error.callCount).toBe(0);
      });

      it('called log.amplitudeEvent correctly', () => {
        expect(log.amplitudeEvent.callCount).toBe(1);
        const args = log.amplitudeEvent.args[0];
        expect(args[0].event_type).toBe('fxa_login - success');
        expect(args[0].event_properties.service).toBe('undefined_oauth');
        expect(args[0].event_properties.oauth_client_id).toBe('2');
        expect(args[0].user_properties['$append']).toEqual({
          fxa_services_used: 'undefined_oauth',
        });
        expect(args[0].user_properties.sync_active_devices_day).toBe(undefined);
        expect(args[0].user_properties.sync_active_devices_week).toBe(
          undefined
        );
        expect(args[0].user_properties.sync_active_devices_month).toBe(
          undefined
        );
        expect(args[0].user_properties.sync_device_count).toBe(undefined);
      });
    });

    // -----------------------------------------------------------------------
    // account.login.blocked
    // -----------------------------------------------------------------------
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
        expect(log.error.callCount).toBe(0);
      });

      it('called log.amplitudeEvent correctly', () => {
        expect(log.amplitudeEvent.callCount).toBe(1);
        const args = log.amplitudeEvent.args[0];
        expect(args[0].event_type).toBe('fxa_login - blocked');
        expect(args[0].event_properties.service).toBe('sync');
        expect(args[0].event_properties.oauth_client_id).toBe(undefined);
        expect(args[0].user_properties['$append']).toEqual({
          fxa_services_used: 'sync',
        });
      });
    });

    // -----------------------------------------------------------------------
    // account.login.confirmedUnblockCode
    // -----------------------------------------------------------------------
    describe('account.login.confirmedUnblockCode', () => {
      beforeEach(() => {
        return amplitude(
          'account.login.confirmedUnblockCode',
          mocks.mockRequest({})
        );
      });

      it('did not call log.error', () => {
        expect(log.error.callCount).toBe(0);
      });

      it('called log.amplitudeEvent correctly', () => {
        expect(log.amplitudeEvent.callCount).toBe(1);
        const args = log.amplitudeEvent.args[0];
        expect(args[0].event_type).toBe('fxa_login - unblock_success');
      });
    });

    // -----------------------------------------------------------------------
    // account.reset
    // -----------------------------------------------------------------------
    describe('account.reset', () => {
      beforeEach(() => {
        return amplitude('account.reset', mocks.mockRequest({}));
      });

      it('did not call log.error', () => {
        expect(log.error.callCount).toBe(0);
      });

      it('called log.amplitudeEvent correctly', () => {
        expect(log.amplitudeEvent.callCount).toBe(2);
        let args = log.amplitudeEvent.args[0];
        expect(args[0].event_type).toBe('fxa_login - forgot_complete');
        args = log.amplitudeEvent.args[1];
        expect(args[0].event_type).toBe('fxa_login - complete');
        expect(args[0].time).toBeGreaterThan(
          log.amplitudeEvent.args[0][0].time
        );
      });
    });

    // -----------------------------------------------------------------------
    // account.signed
    // -----------------------------------------------------------------------
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
        expect(log.error.callCount).toBe(0);
      });

      it('called log.amplitudeEvent correctly', () => {
        expect(log.amplitudeEvent.callCount).toBe(1);
        const args = log.amplitudeEvent.args[0];
        expect(args[0].event_type).toBe('fxa_activity - cert_signed');
        expect(args[0].event_properties.service).toBe(undefined);
        expect(args[0].event_properties.oauth_client_id).toBe(undefined);
        expect(args[0].user_properties['$append']).toBe(undefined);
      });
    });

    // -----------------------------------------------------------------------
    // account.verified
    // -----------------------------------------------------------------------
    describe('account.verified', () => {
      beforeEach(() => {
        return amplitude('account.verified', mocks.mockRequest({}));
      });

      it('did not call log.error', () => {
        expect(log.error.callCount).toBe(0);
      });

      it('called log.amplitudeEvent correctly', () => {
        expect(log.amplitudeEvent.callCount).toBe(1);
        const args = log.amplitudeEvent.args[0];
        expect(args[0].event_type).toBe('fxa_reg - email_confirmed');
        expect(args[0].user_properties.newsletter_state).toBe(undefined);
      });
    });

    // -----------------------------------------------------------------------
    // account.verified, newsletters is empty
    // -----------------------------------------------------------------------
    describe('account.verified, newsletters is empty', () => {
      beforeEach(() => {
        return amplitude('account.verified', mocks.mockRequest({}), {
          newsletters: [],
        });
      });

      it('did not call log.error', () => {
        expect(log.error.callCount).toBe(0);
      });

      it('called log.amplitudeEvent correctly', () => {
        expect(log.amplitudeEvent.callCount).toBe(1);
        const args = log.amplitudeEvent.args[0];
        expect(args[0].event_type).toBe('fxa_reg - email_confirmed');
        expect(args[0].user_properties.newsletters).toEqual([]);
      });
    });

    // -----------------------------------------------------------------------
    // account.verified, subscribe to beta newsletters
    // -----------------------------------------------------------------------
    describe('account.verified, subscribe to beta newsletters', () => {
      beforeEach(() => {
        return amplitude('account.verified', mocks.mockRequest({}), {
          newsletters: ['test-pilot'],
        });
      });

      it('did not call log.error', () => {
        expect(log.error.callCount).toBe(0);
      });

      it('called log.amplitudeEvent correctly', () => {
        expect(log.amplitudeEvent.callCount).toBe(1);
        const args = log.amplitudeEvent.args[0];
        expect(args[0].event_type).toBe('fxa_reg - email_confirmed');
        expect(args[0].user_properties.newsletters).toEqual(['test_pilot']);
      });
    });

    // -----------------------------------------------------------------------
    // subscription.ended
    // -----------------------------------------------------------------------
    describe('subscription.ended', () => {
      beforeEach(() => {
        return amplitude('subscription.ended', mocks.mockRequest({}));
      });

      it('did not call log.error', () => {
        expect(log.error.callCount).toBe(0);
      });

      it('called log.amplitudeEvent correctly', () => {
        expect(log.amplitudeEvent.callCount).toBe(1);
        const args = log.amplitudeEvent.args[0];
        expect(args[0].event_type).toBe('fxa_subscribe - subscription_ended');
      });
    });

    // -----------------------------------------------------------------------
    // flow.complete (sign-up)
    // -----------------------------------------------------------------------
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
        expect(log.error.callCount).toBe(0);
      });

      it('called log.amplitudeEvent correctly', () => {
        expect(log.amplitudeEvent.callCount).toBe(1);
        const args = log.amplitudeEvent.args[0];
        expect(args[0].event_type).toBe('fxa_reg - complete');
      });
    });

    // -----------------------------------------------------------------------
    // flow.complete (sign-in)
    // -----------------------------------------------------------------------
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
        expect(log.error.callCount).toBe(0);
      });

      it('called log.amplitudeEvent correctly', () => {
        expect(log.amplitudeEvent.callCount).toBe(1);
        const args = log.amplitudeEvent.args[0];
        expect(args[0].event_type).toBe('fxa_login - complete');
      });
    });

    // -----------------------------------------------------------------------
    // flow.complete (reset)
    // -----------------------------------------------------------------------
    describe('flow.complete (reset)', () => {
      beforeEach(() => {
        return amplitude('flow.complete', mocks.mockRequest({}));
      });

      it('did not call log.error', () => {
        expect(log.error.callCount).toBe(0);
      });

      it('did not call log.amplitudeEvent', () => {
        expect(log.amplitudeEvent.callCount).toBe(0);
      });
    });

    // -----------------------------------------------------------------------
    // oauth.token.created
    // -----------------------------------------------------------------------
    describe('oauth.token.created', () => {
      beforeEach(() => {
        const now = Date.now();
        Container.set(StatsD, { increment: jest.fn() });
        return amplitude(
          'oauth.token.created',
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
        expect(log.error.callCount).toBe(0);
      });

      it('called log.amplitudeEvent correctly', () => {
        expect(log.amplitudeEvent.callCount).toBe(1);
        const args = log.amplitudeEvent.args[0];
        expect(args[0].user_properties).toEqual({
          flow_id: 'udge',
          ua_browser: 'foo',
          ua_version: 'bar',
          $append: {
            fxa_services_used: 'amo',
          },
        });
      });
    });

    // -----------------------------------------------------------------------
    // device.created (unmapped event)
    // -----------------------------------------------------------------------
    describe('device.created', () => {
      beforeEach(() => {
        return amplitude('device.created', mocks.mockRequest({}));
      });

      it('did not call log.error', () => {
        expect(log.error.callCount).toBe(0);
      });

      it('did not call log.amplitudeEvent', () => {
        expect(log.amplitudeEvent.callCount).toBe(0);
      });
    });

    // -----------------------------------------------------------------------
    // verify.success (minimal event)
    // -----------------------------------------------------------------------
    describe('verify.success', () => {
      beforeEach(() => {
        Container.set(StatsD, { increment: jest.fn() });
        return amplitude(
          'verify.success',
          mocks.mockRequest({
            uaBrowser: 'foo',
            credentials: {
              uid: 'blee',
            },
            geo: {
              location: {
                country: 'United Kingdom',
                state: 'England',
              },
            },
            query: {
              service: '0',
            },
          })
        );
      });

      it('only includes minimal data', () => {
        expect(log.amplitudeEvent.callCount).toBe(1);
        const args = log.amplitudeEvent.args[0];
        expect(args.length).toBe(1);
        expect(args[0].user_id).toBe('blee');
        expect(args[0].country).toBe(undefined);
        expect(args[0].region).toBe(undefined);
        expect(args[0].event_properties).toEqual({
          service: 'amo',
          oauth_client_id: '0',
        });
        expect(args[0].user_properties).toEqual({
          $append: {
            fxa_services_used: 'amo',
          },
        });
      });
    });

    // -----------------------------------------------------------------------
    // email templates -- dynamically generated tests for every template
    // -----------------------------------------------------------------------
    describe('email templates', () => {
      const templates = require('../senders/emails/templates/_versions');
      const emailTypes = amplitudeModule.EMAIL_TYPES;

      for (const template in templates) {
        it(`${template} should be in amplitudes email types`, () => {
          expect(emailTypes).toHaveProperty(template);
        });

        describe(`email.${template}.bounced`, () => {
          beforeEach(() => {
            return amplitude(
              `email.${template}.bounced`,
              mocks.mockRequest({})
            );
          });

          it('did not call log.error', () => {
            expect(log.error.callCount).toBe(0);
          });

          it('called log.amplitudeEvent correctly', () => {
            expect(log.amplitudeEvent.callCount).toBe(1);
            const args = log.amplitudeEvent.args[0];
            expect(args[0].event_type).toBe('fxa_email - bounced');
            expect(args[0].event_properties.email_type).toBe(
              emailTypes[template]
            );
          });
        });

        describe(`email.${template}.sent`, () => {
          beforeEach(() => {
            return amplitude(`email.${template}.sent`, mocks.mockRequest({}));
          });

          it('did not call log.error', () => {
            expect(log.error.callCount).toBe(0);
          });

          it('called log.amplitudeEvent correctly', () => {
            expect(log.amplitudeEvent.callCount).toBe(1);
            const args = log.amplitudeEvent.args[0];
            expect(args[0].event_type).toBe('fxa_email - sent');
            expect(args[0].event_properties.email_type).toBe(
              emailTypes[template]
            );
          });
        });

        describe(`email.${template}.bounced (duplicate)`, () => {
          beforeEach(() => {
            return amplitude(
              `email.${template}.bounced`,
              mocks.mockRequest({})
            );
          });

          it('did not call log.error', () => {
            expect(log.error.callCount).toBe(0);
          });

          it('called log.amplitudeEvent correctly', () => {
            expect(log.amplitudeEvent.callCount).toBe(1);
            const args = log.amplitudeEvent.args[0];
            expect(args[0].event_type).toBe('fxa_email - bounced');
            expect(args[0].event_properties.email_type).toBe(
              emailTypes[template]
            );
          });
        });
      }
    });

    // -----------------------------------------------------------------------
    // email.wibble.bounced -- unknown template, dropped
    // -----------------------------------------------------------------------
    describe('email.wibble.bounced', () => {
      beforeEach(() => {
        Container.set(StatsD, { increment: jest.fn() });
        return amplitude('email.wibble.bounced', mocks.mockRequest({}));
      });

      it('did not call log.error', () => {
        expect(log.error.callCount).toBe(0);
      });

      it('did not call log.amplitudeEvent', () => {
        expect(log.amplitudeEvent.callCount).toBe(0);
      });

      it('incremented amplitude dropped', () => {
        const statsd = Container.get(StatsD) as { increment: jest.Mock };
        expect(statsd.increment).toHaveBeenCalledTimes(2);
        expect(statsd.increment).toHaveBeenNthCalledWith(1, 'amplitude.event');
        expect(statsd.increment).toHaveBeenNthCalledWith(
          2,
          'amplitude.event.dropped'
        );
      });
    });

    // -----------------------------------------------------------------------
    // email.wibble.sent -- unknown template, dropped
    // -----------------------------------------------------------------------
    describe('email.wibble.sent', () => {
      beforeEach(() => {
        return amplitude('email.wibble.sent', mocks.mockRequest({}));
      });

      it('did not call log.error', () => {
        expect(log.error.callCount).toBe(0);
      });

      it('did not call log.amplitudeEvent', () => {
        expect(log.amplitudeEvent.callCount).toBe(0);
      });
    });

    // -----------------------------------------------------------------------
    // with data
    // -----------------------------------------------------------------------
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
            uid: 'blee',
          }
        );
      });

      it('data properties were set', () => {
        expect(log.amplitudeEvent.callCount).toBe(1);
        const args = log.amplitudeEvent.args[0];
        expect(args[0].user_id).toBe('blee');
        expect(args[0].event_properties.service).toBe('undefined_oauth');
        expect(args[0].event_properties.oauth_client_id).toBe('zang');
      });
    });

    // -----------------------------------------------------------------------
    // with metricsContext
    // -----------------------------------------------------------------------
    describe('with metricsContext', () => {
      beforeEach(() => {
        return amplitude(
          'account.created',
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
        expect(log.amplitudeEvent.callCount).toBe(1);
        const args = log.amplitudeEvent.args[0];
        expect(args[0].device_id).toBe('plin');
        expect(args[0].event_properties.service).toBe('amo');
        expect(args[0].user_properties.flow_id).toBe('gorb');
        expect(args[0].user_properties['$append'].fxa_services_used).toBe(
          'amo'
        );
        expect(args[0].session_id).toBe('yerx');
        expect(args[0].time).toBe('wenf');
      });
    });

    // -----------------------------------------------------------------------
    // with subscription
    // -----------------------------------------------------------------------
    describe('with subscription', () => {
      beforeEach(() => {
        return amplitude(
          'account.created',
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
        expect(log.amplitudeEvent.callCount).toBe(1);
        const args = log.amplitudeEvent.args[0];
        expect(args[0].event_properties.plan_id).toBe('bar');
        expect(args[0].event_properties.product_id).toBe('foo');
      });
    });
  });
});
