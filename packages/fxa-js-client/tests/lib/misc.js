/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'tests/addons/environment'
], function (tdd, assert, Environment) {

  with (tdd) {
    suite('misc', function () {
      var respond;
      var client;
      var RequestMocks;

      beforeEach(function () {
        var env = new Environment();
        respond = env.respond;
        client = env.client;
        RequestMocks = env.RequestMocks;
      });

      test('#getRandomBytes', function () {

        return respond(client.getRandomBytes(), RequestMocks.getRandomBytes)
          .then(
            function(res) {
              assert.property(res, 'data');
            },
            assert.notOk
          );
      });

    });
  }
});
