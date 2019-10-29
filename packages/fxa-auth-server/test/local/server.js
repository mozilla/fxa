/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

const { assert } = require('chai');
const EndpointError = require('poolee/lib/error')(require('util').inherits);
const error = require(`${ROOT_DIR}/lib/error`);
const hawk = require('hawk');
const knownIpLocation = require('../known-ip-location');
const mocks = require('../mocks');
const server = require(`${ROOT_DIR}/lib/server`);
const sinon = require('sinon');

describe('lib/server', () => {
  describe('trimLocale', () => {
    it('trims given locale', () => {
      assert.equal(
        server._trimLocale('   fr-CH, fr;q=0.9    '),
        'fr-CH, fr;q=0.9'
      );
    });
  });

  describe('logEndpointErrors', () => {
    const msg = 'Timeout';
    const reason = 'Socket fail';
    const response = {
      __proto__: {
        name: 'EndpointError',
      },
      message: msg,
      reason: reason,
    };

    it('logs an endpoint error', done => {
      const mockLog = {
        error: (op, err) => {
          assert.equal(op, 'server.EndpointError');
          assert.equal(err.message, msg);
          assert.equal(err.reason, reason);
          done();
        },
      };
      assert.equal(server._logEndpointErrors(response, mockLog));
    });

    it('logs an endpoint error with a method', done => {
      response.attempt = {
        method: 'PUT',
      };

      const mockLog = {
        error: (op, err) => {
          assert.equal(op, 'server.EndpointError');
          assert.equal(err.message, msg);
          assert.equal(err.reason, reason);
          assert.equal(err.method, 'PUT');
          done();
        },
      };
      assert.equal(server._logEndpointErrors(response, mockLog));
    });
  });

  describe('set up mocks:', () => {
    let config, log, locale, routes, Token, oauthdb, translator, response;

    beforeEach(() => {
      config = getConfig();
      locale = 'en';
      log = mocks.mockLog();
      routes = getRoutes();
      Token = require(`${ROOT_DIR}/lib/tokens`)(log, config);
      oauthdb = {};
      translator = {
        getTranslator: sinon.spy(() => ({
          en: { format: () => {}, language: 'en' },
        })),
        getLocale: sinon.spy(() => locale),
      };
    });

    describe('create:', () => {
      let db, instance;

      beforeEach(() => {
        db = mocks.mockDB({
          devices: [{ id: 'fake device id' }],
        });

        return server
          .create(log, error, config, routes, db, oauthdb, translator, Token)
          .then(s => {
            instance = s;
          });
      });

      describe('server.start:', () => {
        beforeEach(() => instance.start());
        afterEach(() => instance.stop());

        it('did not call log.begin', () => {
          assert.equal(log.begin.callCount, 0);
        });

        it('did not call log.summary', () => {
          assert.equal(log.summary.callCount, 0);
        });

        it('rejected invalid subscription shared secret', async () => {
          const { statusCode, result } = await instance.inject({
            headers: {
              authorization: 'abcabc',
            },
            method: 'GET',
            url: '/oauth/subscriptions/clients',
          });
          assert.equal(statusCode, 401);
          assert.equal(result.code, 401);
          assert.equal(result.errno, error.ERRNO.INVALID_TOKEN);
        });

        it('authenticated valid subscription shared secret', async () => {
          const { statusCode } = await instance.inject({
            headers: {
              authorization: 'abc',
            },
            method: 'GET',
            url: '/oauth/subscriptions/clients',
          });
          assert.equal(statusCode, 200);
        });

        describe('successful request, authenticated, acceptable locale, signinCodes feature enabled:', () => {
          let request;

          beforeEach(() => {
            response = 'ok';
            return instance
              .inject({
                credentials: {
                  uid: 'fake uid',
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
              })
              .then(response => (request = response.request));
          });

          it('called log.begin correctly', () => {
            assert.equal(log.begin.callCount, 1);
            const args = log.begin.args[0];
            assert.equal(args.length, 2);
            assert.equal(args[0], 'server.onRequest');
            assert.ok(args[1]);
            assert.equal(args[1].path, '/account/create');
            assert.equal(args[1].app.locale, 'en');
          });

          it('called log.summary correctly', () => {
            assert.equal(log.summary.callCount, 1);
            const args = log.summary.args[0];
            assert.equal(args.length, 2);
            assert.equal(args[0], log.begin.args[0][1]);
            assert.ok(args[1]);
            assert.equal(args[1].isBoom, undefined);
            assert.equal(args[1].errno, undefined);
            assert.equal(args[1].statusCode, 200);
            assert.equal(args[1].source, 'ok');
          });

          it('did not call log.error', () => {
            assert.equal(log.error.callCount, 0);
          });

          it('parsed features correctly', () => {
            assert.ok(request.app.features);
            assert.equal(typeof request.app.features.has, 'function');
            assert.equal(request.app.features.has('signinCodes'), true);
          });

          it('parsed remote address chain correctly', () => {
            assert.ok(Array.isArray(request.app.remoteAddressChain));
            assert.equal(request.app.remoteAddressChain.length, 3);
            assert.equal(request.app.remoteAddressChain[0], knownIpLocation.ip);
            assert.equal(request.app.remoteAddressChain[1], '1.2.3.4');
            assert.equal(
              request.app.remoteAddressChain[2],
              request.app.remoteAddressChain[0]
            );
          });

          it('parsed client address correctly', () => {
            assert.equal(request.app.clientAddress, knownIpLocation.ip);
          });

          it('parsed accept-language correctly', () => {
            assert.equal(
              request.app.acceptLanguage,
              'fr-CH, fr;q=0.9, en-GB, en;q=0.5'
            );
          });

          it('parsed locale correctly', () => {
            assert.equal(translator.getLocale.callCount, 0);
            assert.equal(request.app.locale, 'en');
            assert.equal(translator.getLocale.callCount, 1);
          });

          it('parsed user agent correctly', () => {
            assert.ok(request.app.ua);
            assert.equal(request.app.ua.browser, 'Firefox');
            assert.equal(request.app.ua.browserVersion, '57.0');
            assert.equal(request.app.ua.os, 'Mac OS X');
            assert.equal(request.app.ua.osVersion, '10.11');
            assert.equal(request.app.ua.deviceType, null);
            assert.equal(request.app.ua.formFactor, null);
          });

          it('parsed location correctly', () => {
            const geo = request.app.geo;
            assert.ok(geo);
            assert.ok(knownIpLocation.location.city.has(geo.location.city));
            assert.equal(
              geo.location.country,
              knownIpLocation.location.country
            );
            assert.equal(
              geo.location.countryCode,
              knownIpLocation.location.countryCode
            );
            assert.equal(geo.location.state, knownIpLocation.location.state);
            assert.equal(
              geo.location.stateCode,
              knownIpLocation.location.stateCode
            );
            assert.equal(geo.timeZone, knownIpLocation.location.tz);
          });

          it('fetched devices correctly', () => {
            assert.ok(request.app.devices);
            assert.equal(typeof request.app.devices.then, 'function');
            assert.equal(db.devices.callCount, 1);
            assert.equal(db.devices.args[0].length, 1);
            assert.equal(db.devices.args[0][0], 'fake uid');
            return request.app.devices.then(devices => {
              assert.deepEqual(devices, [{ id: 'fake device id' }]);
            });
          });

          describe('successful request, unauthenticated, uid in payload:', () => {
            let secondRequest;

            beforeEach(() => {
              response = 'ok';
              locale = 'fr';
              return instance
                .inject({
                  headers: {
                    'accept-language': 'fr-CH, fr;q=0.9, en-GB, en;q=0.5',
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
                })
                .then(response => (secondRequest = response.request));
            });

            it('second request has its own remote address chain', () => {
              assert.notEqual(request, secondRequest);
              assert.notEqual(
                request.app.remoteAddressChain,
                secondRequest.app.remoteAddressChain
              );
              assert.equal(secondRequest.app.remoteAddressChain.length, 3);
              assert.equal(
                secondRequest.app.remoteAddressChain[0],
                '194.12.187.0'
              );
              assert.equal(
                secondRequest.app.remoteAddressChain[1],
                '194.12.187.1'
              );
              assert.equal(
                secondRequest.app.remoteAddressChain[2],
                knownIpLocation.ip
              );
            });

            it('second request has correct client address', () => {
              assert.equal(secondRequest.app.clientAddress, knownIpLocation.ip);
            });

            it('second request has its own accept-language', () => {
              assert.equal(
                secondRequest.app.acceptLanguage,
                'fr-CH, fr;q=0.9, en-GB, en;q=0.5'
              );
            });

            it('second request has its own locale', () => {
              assert.equal(translator.getLocale.callCount, 0);
              assert.equal(secondRequest.app.locale, 'fr');
              assert.equal(translator.getLocale.callCount, 1);
            });

            it('second request has its own user agent info', () => {
              assert.notEqual(request.app.ua, secondRequest.app.ua);
              assert.equal(secondRequest.app.ua.browser, 'Nightly');
              assert.equal(secondRequest.app.ua.browserVersion, '34.0a1');
              assert.equal(secondRequest.app.ua.os, 'Android');
              assert.equal(secondRequest.app.ua.osVersion, null);
              assert.equal(secondRequest.app.ua.deviceType, 'mobile');
              assert.equal(secondRequest.app.ua.formFactor, null);
            });

            it('second request has its own location info', () => {
              const geo = secondRequest.app.geo;
              assert.notEqual(request.app.geo, secondRequest.app.geo);
              assert.ok(knownIpLocation.location.city.has(geo.location.city));
              assert.equal(
                geo.location.country,
                knownIpLocation.location.country
              );
              assert.equal(
                geo.location.countryCode,
                knownIpLocation.location.countryCode
              );
              assert.equal(geo.location.state, knownIpLocation.location.state);
              assert.equal(
                geo.location.stateCode,
                knownIpLocation.location.stateCode
              );
              assert.equal(geo.timeZone, knownIpLocation.location.tz);
            });

            it('second request fetched devices correctly', () => {
              assert.notEqual(request.app.devices, secondRequest.app.devices);
              assert.equal(db.devices.callCount, 2);
              assert.equal(db.devices.args[1].length, 1);
              assert.equal(db.devices.args[1][0], 'another fake uid');
              return request.app.devices.then(devices => {
                assert.deepEqual(devices, [{ id: 'fake device id' }]);
              });
            });
          });
        });

        describe('successful request, unacceptable locale, no features enabled:', () => {
          let request;

          beforeEach(() => {
            response = 'ok';
            return instance
              .inject({
                headers: {
                  'accept-language': 'fr-CH, fr;q=0.9',
                  'user-agent':
                    'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1',
                },
                method: 'POST',
                url: '/account/create',
                payload: {},
                remoteAddress: 'this is not an ip address',
              })
              .then(response => (request = response.request));
          });

          it('called log.begin correctly', () => {
            assert.equal(log.begin.callCount, 1);
            const args = log.begin.args[0];
            assert.equal(args[1].app.locale, 'en');
            assert.equal(args[1].app.ua.browser, 'Chrome Mobile iOS');
            assert.equal(args[1].app.ua.browserVersion, '56.0.2924');
            assert.equal(args[1].app.ua.os, 'iOS');
            assert.equal(args[1].app.ua.osVersion, '10.3');
            assert.equal(args[1].app.ua.deviceType, 'mobile');
            assert.equal(args[1].app.ua.formFactor, 'iPhone');
          });

          it('called log.summary once', () => {
            assert.equal(log.summary.callCount, 1);
          });

          it('did not call log.error', () => {
            assert.equal(log.error.callCount, 0);
          });

          it('parsed features correctly', () => {
            assert.ok(request.app.features);
            assert.equal(request.app.features.has('signinCodes'), false);
          });

          it('ignored invalid remoteAddress', () => {
            assert.equal(request.app.clientAddress, undefined);
          });
        });

        describe('unsuccessful request:', () => {
          beforeEach(() => {
            response = error.requestBlocked();
            return instance
              .inject({
                method: 'POST',
                url: '/account/create',
                payload: {},
              })
              .catch(() => {});
          });

          it('called log.begin', () => {
            assert.equal(log.begin.callCount, 1);
          });

          it('called log.summary correctly', () => {
            assert.equal(log.summary.callCount, 1);
            const args = log.summary.args[0];
            assert.equal(args.length, 2);
            assert.equal(args[0], log.begin.args[0][1]);
            assert.ok(args[1]);
            assert.equal(args[1].statusCode, undefined);
            assert.equal(args[1].source, undefined);
            assert.equal(args[1].isBoom, true);
            assert.equal(
              args[1].message,
              'The request was blocked for security reasons'
            );
            assert.equal(args[1].errno, 125);
          });

          it('did not call log.error', () => {
            assert.equal(log.error.callCount, 0);
          });
        });

        describe('unsuccessful request, db error:', () => {
          beforeEach(() => {
            response = new EndpointError('request failed', {
              reason: 'because i said so',
            });
            return instance
              .inject({
                method: 'POST',
                url: '/account/create',
                payload: {},
              })
              .catch(() => {});
          });

          it('called log.begin', () => {
            assert.equal(log.begin.callCount, 1);
          });

          it('called log.summary', () => {
            assert.equal(log.summary.callCount, 1);
          });

          it('called log.error correctly', () => {
            assert.isAtLeast(log.error.callCount, 1);
            const args = log.error.args[0];
            assert.equal(args.length, 2);
            assert.equal(args[0], 'server.EndpointError');
            assert.deepEqual(args[1], {
              message: 'request failed',
              reason: 'because i said so',
            });
          });
        });

        describe('authenticated request, session token not expired:', () => {
          beforeEach(() => {
            response = 'ok';
            const auth = hawk.client.header(
              `${config.publicUrl}account/status`,
              'GET',
              {
                credentials: {
                  id: 'deadbeef',
                  key: 'baadf00d',
                  algorithm: 'sha256',
                },
              }
            );
            return instance.inject({
              headers: {
                authorization: auth.header,
              },
              method: 'GET',
              url: '/account/status',
            });
          });

          it('called db.sessionToken correctly', () => {
            assert.equal(db.sessionToken.callCount, 1);
            const args = db.sessionToken.args[0];
            assert.equal(args.length, 1);
            assert.equal(args[0], 'deadbeef');
          });

          it('did not call db.pruneSessionTokens', () => {
            assert.equal(db.pruneSessionTokens.callCount, 0);
          });
        });
      });
    });

    describe('authenticated request, session token expired:', () => {
      let db, instance;

      beforeEach(() => {
        response = 'ok';
        db = mocks.mockDB({
          sessionTokenId: 'wibble',
          uid: 'blee',
          expired: true,
        });

        return server
          .create(log, error, config, routes, db, oauthdb, translator, Token)
          .then(s => {
            instance = s;
            return instance.start().then(() => {
              const auth = hawk.client.header(
                `${config.publicUrl}account/status`,
                'GET',
                {
                  credentials: {
                    id: 'deadbeef',
                    key: 'baadf00d',
                    algorithm: 'sha256',
                  },
                }
              );
              return instance.inject({
                headers: {
                  authorization: auth.header,
                },
                method: 'GET',
                url: '/account/status',
              });
            });
          });
      });

      afterEach(() => instance.stop());

      it('called db.sessionToken', () => {
        assert.equal(db.sessionToken.callCount, 1);
      });

      it('called db.pruneSessionTokens correctly', () => {
        assert.equal(db.pruneSessionTokens.callCount, 1);
        const args = db.pruneSessionTokens.args[0];
        assert.equal(args.length, 2);
        assert.equal(args[0], 'blee');
        assert.ok(Array.isArray(args[1]));
        assert.equal(args[1].length, 1);
        assert.equal(args[1][0].id, 'wibble');
      });
    });

    function getRoutes() {
      return [
        {
          path: '/account/create',
          method: 'POST',
          handler(request) {
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
          handler(request) {
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
      host: '127.0.0.1',
      port: 9000,
    },
    useHttps: false,
    oauth: {
      clientIds: {},
      url: 'http://127.0.0.1:9000',
      keepAlive: false,
    },
    env: 'prod',
    memcached: {
      lifetime: 0,
      address: 'none',
    },
    metrics: {
      flow_id_expiry: 7200000,
      flow_id_key: 'wibble',
    },
    subscriptions: {
      sharedSecret: 'abc',
    },
    verificationReminders: {},
  };
}
