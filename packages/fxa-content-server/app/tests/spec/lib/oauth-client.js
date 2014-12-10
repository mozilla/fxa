/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'jquery',
  '../../lib/helpers',
  'sinon',
  'lib/session',
  'lib/oauth-client',
  'lib/oauth-errors'
],
// FxaClientWrapper is the object that is used in
// fxa-content-server views. It wraps FxaClient to
// take care of some app-specific housekeeping.
function (chai, $, testHelpers, sinon,
              Session, OAuthClient, OAuthErrors) {
  /*global beforeEach, afterEach, describe, it*/

  var OAUTH_URL = 'http://127.0.0.1:9010';
  var RP_URL = 'http://127.0.0.1:8080/api/oauth';
  var assert = chai.assert;
  var client;
  var server;

  describe('lib/oauth-client', function () {
    /* jshint camelcase: false */

    beforeEach(function () {
      server = sinon.fakeServer.create();
      server.autoRespond = true;
      Session.clear();

      client = new OAuthClient({
        oauthUrl: OAUTH_URL
      });
    });

    afterEach(function () {
      server.restore();
      Session.clear();
    });

    describe('oauth-client', function () {
      /* jshint camelcase: false */
      describe('getCode', function () {

        var params = {
          assertion: 'assertion',
          client_id: 'deadbeef',
          redirect_uri: 'http://example.com',
          scope: 'profile',
          state: 'state'
        };

        it('normally responds with a redirect', function () {
          var redirect = RP_URL + '?code=code&state=state';

          server.respondWith('POST', OAUTH_URL + '/v1/authorization',
            [200, { 'Content-Type': 'application/json' },
            '{ "redirect": "' + redirect + '" }']);

          return client.getCode(params)
            .then(function (result) {
              assert.ok(result);
              assert.equal(result.redirect, redirect);
            });
        });

        it('responds with a SERVICE_UNAVAILABLE error if the service is unavailable', function () {
          server.respondWith('POST', OAUTH_URL + '/v1/authorization',
            [0, {}, '']);

          return client.getCode(params)
            .then(function () {
              assert.fail('unexpected success');
            }, function (err) {
              assert.isTrue(OAuthErrors.is(err, 'SERVICE_UNAVAILABLE'));
            });
        });

        it('converts returned errors to OAuth error objects', function () {
          server.respondWith('POST', OAUTH_URL + '/v1/authorization',
            [400, { 'Content-Type': 'application/json' },
              JSON.stringify({
                errno: OAuthErrors.toErrno('INCORRECT_REDIRECT'),
                code: 400
              })]);


              return client.getCode(params)
                .then(function () {
                  assert.fail('unexpected success');
                }, function (err) {
                  assert.isTrue(OAuthErrors.is(err, 'INCORRECT_REDIRECT'));
                });
            });
        });

        describe('getClientInfo', function () {
          var clientId = 'clientId';

          it('normally response with a name and imageUri', function () {
            server.respondWith('GET', OAUTH_URL + '/v1/client/' + clientId,
              [200, { 'Content-Type': 'application/json' },
              '{ "name": "MozRP", "imageUri": "https://mozilla.org/firefox.png" }']);

            return client.getClientInfo(clientId)
              .then(function (result) {
                assert.ok(result);
                assert.equal(result.name, 'MozRP');
              });
          });

          it('responds with a SERVICE_UNAVAILABLE error if the service is unavailable', function () {
            var clientId = 'clientId';

            server.respondWith('GET', OAUTH_URL + '/v1/client/' + clientId,
              [0, {}, '']);

            return client.getClientInfo(clientId)
              .then(function () {
                assert.fail('unexpected success');
              }, function (err) {
                assert.isTrue(OAuthErrors.is(err, 'SERVICE_UNAVAILABLE'));
              });
          });

          it('converts returned errors to OAuth error objects', function () {
            var clientId = 'clientId';

            server.respondWith('GET', OAUTH_URL + '/v1/client/' + clientId,
              [400, { 'Content-Type': 'application/json' },
                JSON.stringify({
                  errno: OAuthErrors.toErrno('EXPIRED_CODE'),
                  code: 400
                })]);

                return client.getClientInfo(clientId)
                  .then(function () {
                    assert.fail('unexpected success');
                  }, function (err) {
                    assert.isTrue(OAuthErrors.is(err, 'EXPIRED_CODE'));
                  });
              });
          });

          describe('getToken', function () {
            it('normally responds with a token', function () {
              var token = 'access token';

              server.respondWith('POST', OAUTH_URL + '/v1/authorization',
                [200, { 'Content-Type': 'application/json' },
                '{ "scope": "profile", "token_type": "bearer", "access_token": "' + token + '" }']);

              var params = {
                assertion: 'assertion',
                client_id: 'deadbeef',
                scope: 'profile'
              };

              return client.getToken(params)
                .then(function (result) {
                  assert.ok(result);
                  assert.equal(result.access_token, 'access token');
                });
            });

            it('responds with a SERVICE_UNAVAILABLE error if the service is unavailable', function () {
              server.respondWith('POST', OAUTH_URL + '/v1/authorization',
                [0, {}, '']);

              var params = {
                assertion: 'assertion',
                client_id: 'deadbeef',
                scope: 'profile'
              };

              return client.getToken(params)
                .then(function () {
                  assert.fail('unexpected success');
                }, function (err) {
                  assert.isTrue(OAuthErrors.is(err, 'SERVICE_UNAVAILABLE'));
                });
            });

            it('converts returned errors to OAuth error objects', function () {
              server.respondWith('POST', OAUTH_URL + '/v1/authorization',
                [400, { 'Content-Type': 'application/json' },
                  JSON.stringify({
                    errno: OAuthErrors.toErrno('INVALID_ASSERTION'),
                    code: 400
                  })]);

                  var params = {
                    assertion: 'assertion',
                    client_id: 'deadbeef',
                    scope: 'profile'
                  };

                  return client.getToken(params)
                    .then(function () {
                      assert.fail('unexpected success');
                    }, function (err) {
                      assert.isTrue(OAuthErrors.is(err, 'INVALID_ASSERTION'));
                    });
                });
            });
          });

        });
      });
