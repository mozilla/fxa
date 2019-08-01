/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('chai').assert;
const Environment = require('../addons/environment');

var PHONE_NUMBER = '+14168483114';
var MESSAGE_ID = 1;

describe('sms', function() {
  var accountHelper;
  var respond;
  var client;
  var RequestMocks;
  let env;

  beforeEach(function() {
    env = new Environment();
    accountHelper = env.accountHelper;
    respond = env.respond;
    client = env.client;
    RequestMocks = env.RequestMocks;
  });

  it('#send connect device', function() {
    return accountHelper
      .newVerifiedAccount()
      .then(function(account) {
        return respond(
          client.sendSms(account.signIn.sessionToken, PHONE_NUMBER, MESSAGE_ID),
          RequestMocks.sendSmsConnectDevice
        );
      })
      .then(function(resp) {
        assert.ok(resp);
      }, assert.fail);
  });

  it('status', function() {
    return accountHelper
      .newVerifiedAccount()
      .then(function(account) {
        return respond(
          client.smsStatus(account.signIn.sessionToken),
          RequestMocks.smsStatus
        );
      })
      .then(function(resp) {
        assert.ok(resp);
        assert.ok(resp.ok);
      }, assert.fail);
  });

  it('status with country', function() {
    return accountHelper
      .newVerifiedAccount()
      .then(function(account) {
        return respond(
          client.smsStatus(account.signIn.sessionToken, { country: 'US' }),
          RequestMocks.smsStatus
        );
      })
      .then(function(resp) {
        assert.ok(resp);
        assert.ok(resp.ok);
        assert.ok(resp.country, 'US');
      }, assert.fail);
  });
});
