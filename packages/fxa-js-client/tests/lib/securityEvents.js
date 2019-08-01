/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('chai').assert;
const Environment = require('../addons/environment');

const sinon = require('sinon');
describe('securityEvents', function() {
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

  beforeEach(() => {
    env = new Environment();
    accountHelper = env.accountHelper;
    respond = env.respond;
    requests = env.requests;
    client = env.client;
    RequestMocks = env.RequestMocks;

    return accountHelper.newVerifiedAccount().then(newAccount => {
      account = newAccount;
      xhr = env.xhr;
      xhrOpen = sinon.spy(xhr.prototype, 'open');
      xhrSend = sinon.spy(xhr.prototype, 'send');
    });
  });

  afterEach(() => {
    xhrOpen.restore();
    xhrSend.restore();
  });

  it('#securityEvents', function() {
    return respond(
      client.securityEvents(account.signIn.sessionToken),
      RequestMocks.securityEvents
    ).then(res => {
      assert.equal(xhrOpen.args[0][0], 'GET', 'method is correct');
      assert.include(xhrOpen.args[0][1], '/securityEvents', 'path is correct');
      assert.ok(res, 'got response');
      assert.equal(res.length, 2);

      assert.equal(res[0].name, 'account.login');
      assert.equal(res[0].verified, true);
      assert.equal(res[0].createdAt < new Date().getTime(), true);

      assert.equal(res[1].name, 'account.create');
      assert.equal(res[1].verified, true);
      assert.equal(res[1].createdAt < new Date().getTime(), true);
    }, assert.fail);
  });

  it('#deleteSecurityEvents', function() {
    return respond(
      client.deleteSecurityEvents(account.signIn.sessionToken),
      RequestMocks.deleteSecurityEvents
    ).then(res => {
      assert.equal(xhrOpen.args[0][0], 'DELETE', 'method is correct');
      assert.include(xhrOpen.args[0][1], '/securityEvents', 'path is correct');
      assert.ok(res, 'got response');
      assert.deepEqual(res, {});

      return respond(
        client.securityEvents(account.signIn.sessionToken),
        RequestMocks.securityEventsEmptyResponse
      ).then(res => {
        assert.equal(xhrOpen.args[1][0], 'GET', 'method is correct');
        assert.include(
          xhrOpen.args[1][1],
          '/securityEvents',
          'path is correct'
        );
        assert.ok(res, 'got response');
        assert.equal(res.length, 0);
      });
    }, assert.fail);
  });
});
