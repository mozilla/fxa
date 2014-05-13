/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'tests/addons/environment',
  'client/lib/request',
  'tests/mocks/errors'
], function (tdd, assert, Environment, Request, ErrorMocks) {
  with (tdd) {
    suite('request module', function () {
      var RequestMocks;
      var request;
      var env;

      beforeEach(function () {
        env = new Environment();
        RequestMocks = env.RequestMocks;
        request = new Request(env.authServerUrl, env.xhr);
      });

      test('#heartbeat', function () {
        var heartbeatRequest = env.respond(request.send("/__heartbeat__", "GET"), RequestMocks.heartbeat)
          .then(
            function (res) {
              assert.ok(res);
            },
            assert.notOk
          );

        return heartbeatRequest;
      });

      test('#error', function () {
        request = new Request('http://', env.xhr);

        request.send("/", "GET")
          .then(
            assert.notOk,
            function () {
              assert.ok(true);
            }
          );

      });

      test('#timeout', function () {
        request = new Request('http://google.com:81', env.xhr, { timeout: 200 });

        var timeoutRequest = env.respond(request.send("/", "GET"), ErrorMocks.timeout);

        return timeoutRequest.then(
          assert.notOk,
          function (err) {
            assert.equal(err.error, 'Timeout error');
          }
        );
      });
    });
  }
});
