/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*global describe,it*/
var nock = require('nock');

var CUSTOMS_URL_REAL = 'http://127.0.0.1:7000';

var customs = require('../lib/customs.js')({
  url: CUSTOMS_URL_REAL,
});

const assert = require('insist');

var customsServer = nock(CUSTOMS_URL_REAL).defaultReplyHeaders({
  'Content-Type': 'application/json',
});

describe('avatarUpload /checkAuthenticated', function(t) {
  it('should rate limit', function() {
    var request = newRequest();
    var action = 'avatarUpload';
    var ip = request.app.clientAddress;
    var uid = 'foo';

    function checkRequestBody(body) {
      assert.deepEqual(
        body,
        {
          action: action,
          ip: ip,
          uid: uid,
        },
        'call to /checkAuthenticated had expected request params'
      );
      return true;
    }

    customsServer
      .post('/checkAuthenticated', checkRequestBody)
      .reply(200, '{"block":false,"retryAfter":0}')
      .post('/checkAuthenticated', checkRequestBody)
      .reply(200, '{"block":false,"retryAfter":0}')
      .post('/checkAuthenticated', checkRequestBody)
      .reply(200, '{"block":false,"retryAfter":0}')
      .post('/checkAuthenticated', checkRequestBody)
      .reply(200, '{"block":false,"retryAfter":0}')
      .post('/checkAuthenticated', checkRequestBody)
      .reply(200, '{"block":false,"retryAfter":0}')
      .post('/checkAuthenticated', checkRequestBody)
      .reply(200, '{"block":true,"retryAfter":10001}');

    return customs
      .checkAuthenticated(action, ip, uid)
      .then(
        function(result) {
          assert.equal(
            result,
            undefined,
            'Nothing is returned when /checkAuthenticated succeeds - 1'
          );
          return customs.checkAuthenticated(action, ip, uid);
        },
        function(error) {
          assert.fail(
            'We should not have failed here for /checkAuthenticated : err=' +
              error
          );
        }
      )
      .then(
        function(result) {
          assert.equal(
            result,
            undefined,
            'Nothing is returned when /checkAuthenticated succeeds - 2'
          );
          return customs.checkAuthenticated(action, ip, uid);
        },
        function(error) {
          assert.fail(
            'We should not have failed here for /checkAuthenticated : err=' +
              error
          );
        }
      )
      .then(
        function(result) {
          assert.equal(
            result,
            undefined,
            'Nothing is returned when /checkAuthenticated succeeds - 3'
          );
          return customs.checkAuthenticated(action, ip, uid);
        },
        function(error) {
          assert.fail(
            'We should not have failed here for /checkAuthenticated : err=' +
              error
          );
        }
      )
      .then(
        function(result) {
          assert.equal(
            result,
            undefined,
            'Nothing is returned when /checkAuthenticated succeeds - 4'
          );
          return customs.checkAuthenticated(action, ip, uid);
        },
        function(error) {
          assert.fail(
            'We should not have failed here for /checkAuthenticated : err=' +
              error
          );
        }
      )
      .then(function() {
        // request is blocked
        return customs.checkAuthenticated(action, ip, uid);
      })
      .then(
        function(result) {
          assert.fail(
            'This should have failed the check since it should be blocked'
          );
        },
        function(error) {
          assert.ok('Since we faked a block, we should have arrived here');
          assert.equal(error.errno, 114, 'Error number is correct');
          assert.equal(
            error.message,
            'Client has sent too many requests',
            'Error message is correct'
          );
          assert.ok(error.isBoom, 'The error causes a boom');
          assert.equal(error.output.statusCode, 429, 'Status Code is correct');
          assert.equal(
            error.output.payload.retryAfter,
            10001,
            'retryAfter is correct'
          );
          assert.equal(
            error.output.headers['retry-after'],
            10001,
            'retryAfter header is correct'
          );
        }
      );
  });
});

function newIp() {
  return [
    '' + Math.floor(Math.random() * 256),
    '' + Math.floor(Math.random() * 256),
    '' + Math.floor(Math.random() * 256),
    '' + Math.floor(Math.random() * 256),
  ].join('.');
}

function newRequest() {
  return {
    app: {
      clientAddress: newIp(),
    },
    headers: {},
    query: {},
    payload: {},
  };
}
