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
      let account;
      let accountHelper;
      let env;
      let respond;
      let requests;
      let client;
      let RequestMocks;
      let xhr;
      let xhrOpen;
      let xhrSend;

      beforeEach(function() {
        env = new Environment();
        accountHelper = env.accountHelper;
        requests = env.requests;
        respond = env.respond;
        client = env.client;
        RequestMocks = env.RequestMocks;

        return accountHelper.newVerifiedAccount().then(newAccount => {
          account = newAccount;
          xhr = env.xhr;
          xhrOpen = sinon.spy(xhr.prototype, 'open');
          xhrSend = sinon.spy(xhr.prototype, 'send');
        });
      });

      afterEach(function() {
        xhrOpen.restore();
        xhrSend.restore();
      });

      test('#securityEvents', function() {
        return respond(
          client.securityEvents(account.signIn.sessionToken),
          RequestMocks.securityEvents
        ).then(res => {
          assert.equal(xhrOpen.args[0][0], 'GET', 'method is correct');
          assert.include(
            xhrOpen.args[0][1],
            '/securityEvents',
            'path is correct'
          );
          assert.ok(res, 'got response');
          assert.equal(res.length, 2);

          assert.equal(res[0].name, 'account.create');
          assert.equal(res[0].verified, true);
          // isBelow is not a function, how to test createdAt field
          // assert.isBelow(res[0].createdAt, new Date().getTime());

          assert.equal(res[1].name, 'account.login');
          assert.equal(res[1].verified, true);
          // isBelow is not a function, how to test createdAt field
          // assert.isBelow(res[1].createdAt, new Date().getTime());
        }, assert.notOk);
      });

      test('#deleteSecurityEvents', function() {
        return respond(
          client.deleteSecurityEvents(account.signIn.sessionToken),
          RequestMocks.deleteSecurityEvents
        ).then(res => {
          assert.equal(xhrOpen.args[0][0], 'DELETE', 'method is correct');
          assert.include(
            xhrOpen.args[0][1],
            '/securityEvents',
            'path is correct'
          );
          assert.ok(res, 'got response');
          assert.deepEqual(res, {});
        }, assert.notOk);
      });
    });
  }
});
