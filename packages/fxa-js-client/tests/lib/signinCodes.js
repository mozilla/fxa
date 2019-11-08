/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var SIGNIN_CODE = '123456-_';
var FLOW_ID =
  '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
var FLOW_BEGIN_TIME = Date.now();

const assert = require('chai').assert;
const Environment = require('../addons/environment');

describe('signinCodes', function() {
  var respond;
  var client;
  var RequestMocks;
  let env;
  let remoteServer;

  beforeEach(function() {
    env = new Environment();
    remoteServer = env.useRemoteServer;
    respond = env.respond;
    client = env.client;
    RequestMocks = env.RequestMocks;
  });

  // This test is intended to run against a local auth-server. To test
  // against a mock auth-server would be pointless for this assertion.
  it('consumeSigninCode with invalid signinCode', function() {
    if (!remoteServer) {
      return this.skip();
    }

    return client.consumeSigninCode(SIGNIN_CODE, FLOW_ID, FLOW_BEGIN_TIME).then(
      function() {
        assert.fail(
          'client.consumeSigninCode should reject if signinCode is invalid'
        );
      },
      function(err) {
        assert.ok(err, 'client.consumeSigninCode should return an error');
        assert.equal(
          err.code,
          400,
          'client.consumeSigninCode should return a 400 response'
        );
        assert.equal(
          err.errno,
          146,
          'client.consumeSigninCode should return errno 146'
        );
      }
    );
  });

  // This test is intended to run against a mock auth-server. To test
  // against a local auth-server, we'd need to know a valid signinCode.
  it('consumeSigninCode', function() {
    if (remoteServer) {
      return this.skip();
    }
    return respond(
      client.consumeSigninCode(SIGNIN_CODE, FLOW_ID, FLOW_BEGIN_TIME),
      RequestMocks.consumeSigninCode
    ).then(assert.ok, assert.fail);
  });

  it('consumeSigninCode with missing code', function() {
    return client.consumeSigninCode(null, FLOW_ID, FLOW_BEGIN_TIME).then(
      function() {
        assert.fail(
          'client.consumeSigninCode should reject if code is missing'
        );
      },
      function(err) {
        assert.equal(err.message, 'Missing code');
      }
    );
  });

  it('consumeSigninCode with missing flowId', function() {
    return client.consumeSigninCode(SIGNIN_CODE, null, FLOW_BEGIN_TIME).then(
      function() {
        assert.fail(
          'client.consumeSigninCode should reject if flowId is missing'
        );
      },
      function(err) {
        assert.equal(err.message, 'Missing flowId');
      }
    );
  });

  it('consumeSigninCode with missing flowBeginTime', function() {
    return client.consumeSigninCode(SIGNIN_CODE, FLOW_ID, null).then(
      function() {
        assert.fail(
          'client.consumeSigninCode should reject if flowBeginTime is missing'
        );
      },
      function(err) {
        assert.equal(err.message, 'Missing flowBeginTime');
      }
    );
  });
});
