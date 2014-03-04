/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'tests/addons/environment',
  'client/lib/request',
  'tests/addons/sinonResponder'
], function (tdd, assert, Environment, Request, SinonResponder) {
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
    });
  }
});
