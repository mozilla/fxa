/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'tests/addons/environment',
  'tests/addons/sinon',
], function(tdd, assert, Environment, sinon) {
  with (tdd) {
    suite('securityEvents', function() {
      var accountHelper;
      var respond;
      var requests;
      var client;
      var RequestMocks;
      var ErrorMocks;
      var xhr;

      beforeEach(function() {
        var env = new Environment();
        accountHelper = env.accountHelper;
        respond = env.respond;
        requests = env.requests;
        client = env.client;
        RequestMocks = env.RequestMocks;
        ErrorMocks = env.ErrorMocks;
        xhr = env.xhr;
        sinon.spy(xhr.prototype, 'open');
        sinon.spy(xhr.prototype, 'send');
      });

      afterEach(function() {
        xhr.prototype.open.restore();
        xhr.prototype.send.restore();
      });

      test('#securityEvents', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(account => {
            return respond(
              client.securityEvents(account.signIn.sessionToken),
              RequestMocks.securityEvents
            );
          })
          .then(res => {
            assert.ok(res, 'got response');
          }, assert.notOk);
      });

      test('#deleteSecurityEvents', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(account => {
            return respond(
              client.deleteSecurityEvents(account.signIn.sessionToken),
              RequestMocks.deleteSecurityEvents
            );
          })
          .then(res => {
            assert.ok(res, 'got response');
          }, assert.notOk);
      });
    });
  }
});
