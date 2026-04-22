/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Account } from 'fxa-shared/db/models/auth/account';

const mockReportValidationError = jest.fn();
jest.mock('fxa-shared/sentry/report-validation-error', () => ({
  reportValidationError: mockReportValidationError,
}));

const EndpointError = require('poolee/lib/error')(require('util').inherits);
const { AppError: error } = require('@fxa/accounts/errors');
const knownIpLocation = require('../test/known-ip-location');
const mocks = require('../test/mocks');
const server = require('./server');

const glean = mocks.mockGlean();
const customs = mocks.mockCustoms();

describe('lib/server', () => {
  describe('trimLocale', () => {
    it('trims given locale', () => {
      expect(server._trimLocale('   fr-CH, fr;q=0.9    ')).toBe(
        'fr-CH, fr;q=0.9'
      );
    });
  });

  describe('logEndpointErrors', () => {
    const msg = 'Timeout';
    const reason = 'Socket fail';
    const response: any = {
      __proto__: {
        name: 'EndpointError',
      },
      message: msg,
      reason: reason,
    };

    it('logs an endpoint error', (done) => {
      const mockLog = {
        error: (op: string, err: any) => {
          expect(op).toBe('server.EndpointError');
          expect(err.message).toBe(msg);
          expect(err.reason).toBe(reason);
          done();
        },
      };
      server._logEndpointErrors(response, mockLog);
    });

    it('logs an endpoint error with a method', (done) => {
      response.attempt = {
        method: 'PUT',
      };

      const mockLog = {
        error: (op: string, err: any) => {
          expect(op).toBe('server.EndpointError');
          expect(err.message).toBe(msg);
          expect(err.reason).toBe(reason);
          expect(err.method).toBe('PUT');
          done();
        },
      };
      server._logEndpointErrors(response, mockLog);
    });
  });

  describe('logValidationError', () => {
    const msg = 'Invalid response payload';
    const response = {
      __proto__: {
        name: 'ValidationError',
      },
      message: msg,
      stack: 'ValidationError: "[0].plan_id" is required',
    };

    afterEach(() => {
      mockReportValidationError.mockClear();
    });

    it('logs a validation error', () => {
      const mockLog = {
        error: (op: string, err: any) => {
          expect(op).toBe('server.ValidationError');
          expect(err.message).toBe(msg);
        },
      };
      server._logValidationError(response, mockLog);
    });

    it('reports a validation error to Sentry', () => {
      const mockLog = {
        error: () => {},
      };
      server._logValidationError(response, mockLog);
      expect(mockReportValidationError).toHaveBeenCalledTimes(1);
      expect(mockReportValidationError).toHaveBeenCalledWith(
        response.stack,
        response
      );
    });
  });

  describe('set up mocks:', () => {
    let config: any, log: any, routes: any, response: any, statsd: any;

    beforeEach(() => {
      config = getConfig();
      log = mocks.mockLog();
      routes = getRoutes();
      statsd = { timing: jest.fn() };
    });

    describe('create:', () => {
      let db: any, instance: any;

      beforeEach(async () => {
        db = mocks.mockDB({
          devices: [{ id: 'fake device id' }],
        });

        instance = await server.create(
          log,
          error,
          config,
          routes,
          db,
          statsd,
          glean,
          customs
        );
      });

      describe('server.start:', () => {
        beforeEach(() => instance.start());
        afterEach(() => instance.stop());

        it('did not call log.begin', () => {
          expect(log.begin).toHaveBeenCalledTimes(0);
        });

        it('did not call log.summary', () => {
          expect(log.summary).toHaveBeenCalledTimes(0);
        });

        it('rejected invalid subscription shared secret', async () => {
          const { statusCode, result } = await instance.inject({
            headers: {
              authorization: 'abcabc',
            },
            method: 'GET',
            url: '/oauth/subscriptions/clients',
          });
          expect(statusCode).toBe(401);
          expect(result.code).toBe(401);
          expect(result.errno).toBe(error.ERRNO.INVALID_TOKEN);
          expect(statsd.timing.mock.calls[0][0]).toBe('url_request');
          expect(statsd.timing.mock.calls[0][3].path).toBe(
            'oauth_subscriptions_clients'
          );
          expect(statsd.timing.mock.calls[0][3].statusCode).toBe(statusCode);
          expect(statsd.timing.mock.calls[0][3].method).toBe('GET');
          expect(statsd.timing.mock.calls[0][3].errno).toBe(
            error.ERRNO.INVALID_TOKEN
          );
        });

        it('authenticated valid subscription shared secret', async () => {
          const { statusCode } = await instance.inject({
            headers: {
              authorization: 'abc',
            },
            method: 'GET',
            url: '/oauth/subscriptions/clients',
          });
          expect(statusCode).toBe(200);
        });

        describe('isMetricsEnabled', () => {
          let request: any;
          beforeEach(async () => {
            response = 'ok';
            const res = await instance.inject({
              auth: {
                credentials: {
                  uid: 'fake uid',
                },
                strategy: 'default',
              },
              method: 'POST',
              url: '/account/create',
              payload: {
                features: ['signinCodes'],
              },
              remoteAddress: knownIpLocation.ip,
            });
            request = res.request;
          });
          afterEach(() => {
            jest.restoreAllMocks();
          });

          it('should return request.auth.credentials.metricsOptOutAt', async () => {
            const accountStub = jest
              .spyOn(Account, 'metricsEnabled')
              .mockResolvedValue(false);
            request.auth.credentials.uid = 'fake uid';
            request.auth.credentials.metricsOptOutAt = 123456789;

            const expected = !request.auth.credentials.metricsOptOutAt;
            const result = await request.app.isMetricsEnabled;
            expect(result).toBe(expected);
            expect(accountStub).not.toHaveBeenCalled();
          });

          it('should return Account.metricsEnabled if request.auth.credentials.user is provided', async () => {
            request.auth.credentials.uid = null;
            request.auth.credentials.user = 'fake uid';
            const expected = false;
            const accountStub = jest
              .spyOn(Account, 'metricsEnabled')
              .mockResolvedValue(expected);
            const result = await request.app.isMetricsEnabled;
            expect(accountStub).toHaveBeenCalled();
            expect(result).toBe(expected);
          });

          it('should return Account.metricsEnabled if request.payload.uid is provided', async () => {
            request.auth.credentials.uid = null;
            request.payload.uid = 'fake uid';
            const expected = false;
            const accountStub = jest
              .spyOn(Account, 'metricsEnabled')
              .mockResolvedValue(expected);
            const result = await request.app.isMetricsEnabled;
            expect(accountStub).toHaveBeenCalled();
            expect(result).toBe(expected);
          });

          it('should return Account.metricsEnabled if request.app.metricsEventUid is provided', async () => {
            request.auth.credentials.uid = null;
            request.app.metricsEventUid = 'fake uid';
            const expected = false;
            const accountStub = jest
              .spyOn(Account, 'metricsEnabled')
              .mockResolvedValue(expected);
            const result = await request.app.isMetricsEnabled;
            expect(accountStub).toHaveBeenCalled();
            expect(result).toBe(expected);
          });

          it('should return Account.metricsEnabled if request.payload.email is provided', async () => {
            request.auth.credentials.uid = null;
            request.payload.email = 'fake@email.com';
            const expected = false;
            const accountStub = jest
              .spyOn(Account, 'metricsEnabled')
              .mockResolvedValue(expected);
            const accountEmailStub = jest
              .spyOn(Account, 'findByPrimaryEmail')
              .mockResolvedValue({ uid: 'emailUID' });
            const result = await request.app.isMetricsEnabled;
            expect(accountStub).toHaveBeenCalled();
            expect(accountEmailStub).toHaveBeenCalled();
            expect(result).toBe(expected);
          });

          it('should return true if Account.findByPrimaryEmail rejects', async () => {
            request.auth.credentials.uid = null;
            request.payload.email = 'fake@email.com';
            const expected = true;
            const accountStub = jest
              .spyOn(Account, 'metricsEnabled')
              .mockResolvedValue(expected);
            const accountEmailStub = jest
              .spyOn(Account, 'findByPrimaryEmail')
              .mockImplementation(() => {
                throw new Error();
              });
            const result = await request.app.isMetricsEnabled;
            expect(accountEmailStub).toHaveBeenCalled();
            expect(accountStub).not.toHaveBeenCalled();
            expect(result).toBe(expected);
          });

          it('should return true if no uid is found', async () => {
            request.auth.credentials.uid = null;
            const expected = true;
            const accountStub = jest
              .spyOn(Account, 'metricsEnabled')
              .mockResolvedValue(expected);
            const result = await request.app.isMetricsEnabled;
            expect(accountStub).not.toHaveBeenCalled();
            expect(result).toBe(expected);
          });
        });

        describe('successful request, authenticated, acceptable locale, signinCodes feature enabled:', () => {
          let request: any;

          beforeEach(async () => {
            response = 'ok';
            const res = await instance.inject({
              auth: {
                credentials: {
                  uid: 'fake uid',
                },
                strategy: 'default',
              },
              headers: {
                'accept-language': 'fr-CH, fr;q=0.9, en-GB, en;q=0.5',
                'user-agent':
                  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:57.0) Gecko/20100101 Firefox/57.0',
                'x-forwarded-for': `${knownIpLocation.ip} , moo , 1.2.3.4`,
              },
              method: 'POST',
              url: '/account/create',
              payload: {
                features: ['signinCodes'],
              },
              remoteAddress: knownIpLocation.ip,
            });
            request = res.request;
          });

          it('called log.begin correctly', () => {
            expect(log.begin).toHaveBeenCalledTimes(1);
            const args = log.begin.mock.calls[0];
            expect(args.length).toBe(2);
            expect(args[0]).toBe('server.onRequest');
            expect(args[1]).toBeTruthy();
            expect(args[1].path).toBe('/account/create');
            expect(args[1].app.locale).toBe('fr');
          });

          it('called log.summary correctly', () => {
            expect(log.summary).toHaveBeenCalledTimes(1);
            const args = log.summary.mock.calls[0];
            expect(args.length).toBe(2);
            expect(args[0]).toBe(log.begin.mock.calls[0][1]);
            expect(args[1]).toBeTruthy();
            expect(args[1].isBoom).toBeUndefined();
            expect(args[1].errno).toBeUndefined();
            expect(args[1].statusCode).toBe(200);
            expect(args[1].source).toBe('ok');
          });

          it('did not call log.error', () => {
            expect(log.error).toHaveBeenCalledTimes(0);
          });

          it('parsed features correctly', () => {
            expect(request.app.features).toBeTruthy();
            expect(typeof request.app.features.has).toBe('function');
            expect(request.app.features.has('signinCodes')).toBe(true);
          });

          it('parsed remote address chain correctly', () => {
            expect(Array.isArray(request.app.remoteAddressChain)).toBe(true);
            expect(request.app.remoteAddressChain.length).toBe(3);
            expect(request.app.remoteAddressChain[0]).toBe(knownIpLocation.ip);
            expect(request.app.remoteAddressChain[1]).toBe('1.2.3.4');
            expect(request.app.remoteAddressChain[2]).toBe(
              request.app.remoteAddressChain[0]
            );
          });

          it('parsed client address correctly', () => {
            expect(request.app.clientAddress).toBe(knownIpLocation.ip);
          });

          it('parsed accept-language correctly', () => {
            expect(request.app.acceptLanguage).toBe(
              'fr-CH, fr;q=0.9, en-GB, en;q=0.5'
            );
          });

          it('parsed locale correctly', () => {
            // Note that fr-CH would be the correct language, but it is not in the list of supported
            // languages so it defaults to fr.
            expect(request.app.locale).toBe('fr');
          });

          it('parsed user agent correctly', () => {
            expect(request.app.ua).toBeTruthy();
            expect(request.app.ua.browser).toBe('Firefox');
            expect(request.app.ua.browserVersion).toBe('57.0');
            expect(request.app.ua.os).toBe('Mac OS X');
            expect(request.app.ua.osVersion).toBe('10.11');
            expect(request.app.ua.deviceType).toBeNull();
            expect(request.app.ua.formFactor).toBeNull();
          });

          it('parsed location correctly', () => {
            const geo = request.app.geo;
            expect(geo).toBeTruthy();
            expect(knownIpLocation.location.city.has(geo.location.city)).toBe(
              true
            );
            expect(geo.location.country).toBe(knownIpLocation.location.country);
            expect(geo.location.countryCode).toBe(
              knownIpLocation.location.countryCode
            );
            expect(geo.location.state).toBe(knownIpLocation.location.state);
            expect(geo.location.stateCode).toBe(
              knownIpLocation.location.stateCode
            );
            expect(geo.timeZone).toBe(knownIpLocation.location.tz);
          });

          it('fetched devices correctly', async () => {
            expect(request.app.devices).toBeTruthy();
            expect(typeof request.app.devices.then).toBe('function');
            expect(db.devices).toHaveBeenCalledTimes(1);
            expect(db.devices).toHaveBeenNthCalledWith(1, 'fake uid');
            const devices = await request.app.devices;
            expect(devices).toEqual([{ id: 'fake device id' }]);
          });

          describe('successful request, unauthenticated, uid in payload:', () => {
            let secondRequest: any;

            beforeEach(async () => {
              response = 'ok';
              const res = await instance.inject({
                headers: {
                  'accept-language': 'fr-CH, en-GB, en;q=0.5',
                  'user-agent': 'Firefox-Android-FxAccounts/34.0a1 (Nightly)',
                  'x-forwarded-for': ' 194.12.187.0 , 194.12.187.1 ',
                },
                method: 'POST',
                url: '/account/create',
                payload: {
                  features: ['signinCodes'],
                  uid: 'another fake uid',
                },
                remoteAddress: knownIpLocation.ip,
              });
              secondRequest = res.request;
            });

            it('second request has its own remote address chain', () => {
              expect(request).not.toBe(secondRequest);
              expect(request.app.remoteAddressChain).not.toBe(
                secondRequest.app.remoteAddressChain
              );
              expect(secondRequest.app.remoteAddressChain.length).toBe(3);
              expect(secondRequest.app.remoteAddressChain[0]).toBe(
                '194.12.187.0'
              );
              expect(secondRequest.app.remoteAddressChain[1]).toBe(
                '194.12.187.1'
              );
              expect(secondRequest.app.remoteAddressChain[2]).toBe(
                knownIpLocation.ip
              );
            });

            it('second request has correct client address', () => {
              expect(secondRequest.app.clientAddress).toBe(knownIpLocation.ip);
            });

            it('second request has its own accept-language', () => {
              expect(secondRequest.app.acceptLanguage).toBe(
                'fr-CH, en-GB, en;q=0.5'
              );
            });

            it('second request has its own locale', () => {
              // Note that fr-CH would be the correct language, but it is not in the list of supported
              // languages so it defaults to fr.
              expect(secondRequest.app.locale).toBe('fr');
            });

            it('second request has its own user agent info', () => {
              expect(request.app.ua).not.toBe(secondRequest.app.ua);
              expect(secondRequest.app.ua.browser).toBe('Nightly');
              expect(secondRequest.app.ua.browserVersion).toBe('34.0a1');
              expect(secondRequest.app.ua.os).toBe('Android');
              expect(secondRequest.app.ua.osVersion ?? null).toBeNull();
              expect(secondRequest.app.ua.deviceType).toBe('mobile');
              expect(secondRequest.app.ua.formFactor ?? null).toBeNull();
            });

            it('second request has its own location info', () => {
              const geo = secondRequest.app.geo;
              expect(request.app.geo).not.toBe(secondRequest.app.geo);
              expect(knownIpLocation.location.city.has(geo.location.city)).toBe(
                true
              );
              expect(geo.location.country).toBe(
                knownIpLocation.location.country
              );
              expect(geo.location.countryCode).toBe(
                knownIpLocation.location.countryCode
              );
              expect(geo.location.state).toBe(knownIpLocation.location.state);
              expect(geo.location.stateCode).toBe(
                knownIpLocation.location.stateCode
              );
              expect(geo.timeZone).toBe(knownIpLocation.location.tz);
            });

            it('second request fetched devices correctly', async () => {
              expect(request.app.devices).not.toBe(secondRequest.app.devices);
              expect(db.devices).toHaveBeenCalledTimes(2);
              expect(db.devices).toHaveBeenNthCalledWith(2, 'another fake uid');
              const devices = await secondRequest.app.devices;
              expect(devices).toEqual([{ id: 'fake device id' }]);
            });
          });
        });

        describe('successful request, unacceptable locale, no features enabled:', () => {
          let request: any;

          beforeEach(async () => {
            response = 'ok';
            const res = await instance.inject({
              headers: {
                'accept-language': 'fr-CH, fr;q=0.9',
                'user-agent':
                  'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1',
              },
              method: 'POST',
              url: '/account/create',
              payload: {},
              remoteAddress: 'this is not an ip address',
            });
            request = res.request;
          });

          it('called log.begin correctly', () => {
            expect(log.begin).toHaveBeenCalledTimes(1);
            const args = log.begin.mock.calls[0];
            expect(args[1].app.locale).toBe('fr');
            expect(args[1].app.ua.browser).toBe('Chrome Mobile iOS');
            expect(args[1].app.ua.browserVersion).toBe('56.0.2924');
            expect(args[1].app.ua.os).toBe('iOS');
            expect(args[1].app.ua.osVersion).toBe('10.3');
            expect(args[1].app.ua.deviceType).toBe('mobile');
            expect(args[1].app.ua.formFactor).toBe('iPhone');
          });

          it('called log.summary once', () => {
            expect(log.summary).toHaveBeenCalledTimes(1);
          });

          it('did not call log.error', () => {
            expect(log.error).toHaveBeenCalledTimes(0);
          });

          it('parsed features correctly', () => {
            expect(request.app.features).toBeTruthy();
            expect(request.app.features.has('signinCodes')).toBe(false);
          });

          it('ignored invalid remoteAddress', () => {
            expect(request.app.clientAddress).toBeUndefined();
          });
        });

        describe('unsuccessful request:', () => {
          const expectedResp = {
            code: 400,
            errno: 125,
            error: 'Request blocked',
            info: 'https://mozilla.github.io/ecosystem-platform/api#section/Response-format',
            message: 'The request was blocked for security reasons',
            retryAfter: undefined,
            retryAfterLocalized: undefined,
          };
          beforeEach(async () => {
            glean.registration.error.mockClear();
            jest.spyOn(Date, 'now').mockReturnValue(1584397692000);
            response = error.requestBlocked();
            try {
              await instance.inject({
                method: 'POST',
                url: '/account/create',
                payload: {},
              });
            } catch (e) {
              // expected
            }
          });
          afterEach(() => (Date.now as jest.Mock).mockRestore());

          it('called log.begin', () => {
            expect(log.begin).toHaveBeenCalledTimes(1);
          });

          it('called log.summary correctly', () => {
            expect(log.summary).toHaveBeenCalledTimes(1);
            const args = log.summary.mock.calls[0];
            expect(args.length).toBe(2);
            expect(args[0]).toBe(log.begin.mock.calls[0][1]);
            expect(args[1]).toBeTruthy();
            expect(args[1].statusCode).toBe(400);
            expect(String(args[1].headers.Timestamp)).toBe('1584397692');
            expect(args[1].source).toEqual(expectedResp);
          });

          it('did not call log.error', () => {
            expect(log.error).toHaveBeenCalledTimes(0);
          });

          it('did log an error with glean', () => {
            expect(glean.registration.error).toHaveBeenCalledTimes(1);
          });
        });

        describe('unsuccessful request, db error:', () => {
          beforeEach(async () => {
            response = new EndpointError('request failed', {
              reason: 'because i said so',
            });
            try {
              await instance.inject({
                method: 'POST',
                url: '/account/create',
                payload: {},
              });
            } catch (e) {
              // expected
            }
          });

          it('called log.begin', () => {
            expect(log.begin).toHaveBeenCalledTimes(1);
          });

          it('called log.summary', () => {
            expect(log.summary).toHaveBeenCalledTimes(1);
          });

          it('called log.error correctly', () => {
            expect(log.error.mock.calls.length).toBeGreaterThanOrEqual(1);
            expect(log.error).toHaveBeenNthCalledWith(
              1,
              'server.EndpointError',
              {
                message: 'request failed',
                reason: 'because i said so',
              }
            );
          });
        });

        describe('authenticated request, session token not expired:', () => {
          beforeEach(async () => {
            response = 'ok';
            const auth = { header: `Hawk id="deadbeef"` };
            await instance.inject({
              headers: {
                authorization: auth.header,
              },
              method: 'GET',
              url: '/account/status',
            });
          });

          it('called db.sessionToken correctly', () => {
            expect(db.sessionToken).toHaveBeenCalledTimes(1);
            expect(db.sessionToken).toHaveBeenNthCalledWith(1, 'deadbeef');
          });

          it('did not call db.pruneSessionTokens', () => {
            expect(db.pruneSessionTokens).toHaveBeenCalledTimes(0);
          });
        });

        describe('general rate limiting error', () => {
          beforeEach(() => {
            customs.checkIpOnly.mockClear();
            customs.v2Enabled.mockClear();
          });

          afterEach(() => {
            const temp = mocks.mockCustoms();
            customs.checkIpOnly = temp.checkIpOnly;
            customs.v2Enabled = temp.v2Enabled;
          });

          async function query(endpoint: string) {
            return instance.inject({
              headers: {
                authorization: `Hawk id="deadbeef"`,
              },
              method: 'GET',
              url: endpoint,
              app: {
                clientAddress: '127.0.0.1',
              },
            });
          }

          it('called customs', async () => {
            await query('/account/status');

            expect(customs.checkIpOnly).toHaveBeenCalledTimes(1);
            expect(customs.checkIpOnly).toHaveBeenNthCalledWith(
              1,
              expect.any(Object),
              'get__account_status'
            );
            expect(log.error).toHaveBeenCalledTimes(0);
          });

          it('handles customs block', async () => {
            customs.checkIpOnly = jest.fn(async () => {
              throw error.tooManyRequests(100, 'foo');
            });

            const { statusCode, result } = await query('/account/status');

            expect(customs.checkIpOnly).toHaveBeenCalledTimes(1);
            expect(statusCode).toBe(429);
            expect(result).toEqual({
              code: 429,
              errno: 114,
              error: 'Too Many Requests',
              info: 'https://mozilla.github.io/ecosystem-platform/api#section/Response-format',
              message: 'Client has sent too many requests',
              retryAfter: 100,
              retryAfterLocalized: 'foo',
            });
          });

          for (const endpoint of [
            '/__lbheartbeat__',
            '/config',
            '/__heartbeat__',
            '/__version__',
          ]) {
            it('will skip ' + endpoint, async () => {
              customs.checkIpOnly = jest.fn(async () => {
                throw error.tooManyRequests(100, 'foo');
              });
              await query(endpoint);
              expect(customs.checkIpOnly).toHaveBeenCalledTimes(0);
            });
          }
        });
      });
    });

    describe('authenticated request, session token expired:', () => {
      let db: any, instance: any, statsd: any;

      beforeEach(async () => {
        response = 'ok';
        db = mocks.mockDB({
          sessionTokenId: 'wibble',
          uid: 'blee',
          expired: true,
        });
        statsd = { increment: jest.fn(), timing: jest.fn() };

        instance = await server.create(
          log,
          error,
          config,
          routes,
          db,
          statsd,
          glean,
          customs
        );
        await instance.start();
        const auth = {
          header: `Hawk id="deadbeef"`,
        };
        await instance.inject({
          headers: {
            authorization: auth.header,
          },
          method: 'GET',
          url: '/account/status',
        });
      });

      afterEach(() => instance.stop());

      it('called db.sessionToken', () => {
        expect(db.sessionToken).toHaveBeenCalledTimes(1);
      });

      it('called db.pruneSessionTokens correctly', () => {
        expect(db.pruneSessionTokens).toHaveBeenCalledTimes(1);
        const args = db.pruneSessionTokens.mock.calls[0];
        expect(args.length).toBe(2);
        expect(args[0]).toBe('blee');
        expect(Array.isArray(args[1])).toBe(true);
        expect(args[1].length).toBe(1);
        expect(args[1][0].id).toBe('wibble');
      });
    });

    function getRoutes() {
      return [
        {
          path: '/config',
          method: 'GET',
          handler() {
            return response;
          },
        },
        {
          path: '/__lbheartbeat__',
          method: 'GET',
          handler() {
            return response;
          },
        },
        {
          path: '/__version__',
          method: 'GET',
          handler() {
            return response;
          },
        },
        {
          path: '/__heartbeat__',
          method: 'GET',
          handler() {
            return response;
          },
        },
        {
          path: '/account/create',
          method: 'POST',
          handler() {
            return response;
          },
        },
        {
          path: '/account/status',
          method: 'GET',
          config: {
            auth: {
              mode: 'required',
              strategy: 'sessionToken',
            },
          },
          handler() {
            return response;
          },
        },
        {
          path: '/oauth/subscriptions/clients',
          method: 'GET',
          config: {
            auth: {
              mode: 'required',
              strategy: 'subscriptionsSecret',
            },
          },
          handler() {
            return {};
          },
        },
      ];
    }
  });
});

function getConfig() {
  return {
    publicUrl: 'http://example.org/',
    corsOrigin: ['*'],
    maxEventLoopDelay: 0,
    listen: {
      host: 'localhost',
      port: 9000,
    },
    useHttps: false,
    oauth: {
      clientIds: {},
      url: 'http://localhost:9000',
      keepAlive: false,
    },
    env: 'prod',
    redis: {
      metrics: {
        enabled: false,
      },
    },
    metrics: {
      flow_id_expiry: 7200000,
      flow_id_key: 'wibble',
    },
    subscriptions: {
      sharedSecret: 'abc',
    },
    supportPanel: {
      secretBearerToken: 'topsecrets',
    },
    pubsub: {
      authenticate: false,
      verificationToken: '',
    },
    verificationReminders: {},
    support: {
      secretBearerToken: 'topsecrets',
      ticketPayloadLimit: 131072,
    },
    sentry: {
      dsn: '',
      env: 'local',
    },
    cloudTasks: {
      oidc: {
        aud: 'cloud-tasks',
        serviceAccountEmail: 'testo@iam.gcp.g.co',
      },
    },
    cloudScheduler: {
      oidc: {
        aud: 'cloud-scheduler',
        serviceAccountEmail: 'testo@iam.gcp.g.co',
      },
    },
    geodb: {
      locationOverride: knownIpLocation.location,
    },
    rateLimit: {
      checkAllEndpoints: true,
      skipEndpoints: [
        '/__lbheartbeat__',
        '/config',
        '/__heartbeat__',
        '/__version__',
      ],
    },
  };
}
