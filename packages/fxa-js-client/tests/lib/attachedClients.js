/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('chai').assert;
const Environment = require('../addons/environment');
const sinon = require('sinon');

describe('attachedClients', function () {
  var accountHelper;
  var respond;
  var client;
  var RequestMocks;
  var ErrorMocks;
  var xhr;
  let env;

  beforeEach(function () {
    env = new Environment();
    accountHelper = env.accountHelper;
    respond = env.respond;
    client = env.client;
    RequestMocks = env.RequestMocks;
    ErrorMocks = env.ErrorMocks;
    xhr = env.xhr;
    sinon.spy(xhr.prototype, 'open');
    sinon.spy(xhr.prototype, 'send');
  });

  afterEach(function () {
    xhr.prototype.open.restore();
    xhr.prototype.send.restore();
  });

  it('#attachedClients', function () {
    return accountHelper
      .newVerifiedAccount()
      .then(function (account) {
        return respond(
          client.attachedClients(account.signIn.sessionToken),
          RequestMocks.attachedClients
        );
      })
      .then(function (res) {
        assert.equal(res.length, 2);
        var s = res[0];
        assert.property(s, 'clientId');
        assert.property(s, 'deviceId');
        assert.property(s, 'deviceType');
        assert.property(s, 'refreshTokenId');
        assert.ok(s.lastAccessTime);
        assert.ok(s.lastAccessTimeFormatted);
        assert.ok(s.sessionTokenId);
        s = res[1];
        assert.property(s, 'clientId');
        assert.property(s, 'deviceId');
        assert.property(s, 'deviceType');
        assert.property(s, 'refreshTokenId');
        assert.ok(s.lastAccessTimeFormatted);
        assert.ok(s.sessionTokenId);
      }, assert.fail);
  });

  it('#attachedClients error', function () {
    return accountHelper
      .newVerifiedAccount()
      .then(function (account) {
        var fakeToken =
          'e838790265a45f6ee1130070d57d67d9bb20953706f73af0e34b0d4d92f10000';

        return respond(
          client.attachedClients(fakeToken),
          ErrorMocks.invalidAuthToken
        );
      })
      .then(assert.fail, function (err) {
        assert.equal(err.code, 401);
        assert.equal(err.errno, 110);
      });
  });

  it('#destroy', function () {
    return accountHelper
      .newVerifiedAccount()
      .then(function (account) {
        return respond(
          client.attachedClientDestroy(account.signIn.sessionToken, {
            clientId: 'dcdb5ae7add825d2',
          }),
          RequestMocks.attachedClientDestroy
        );
      })
      .then(function (res) {
        assert.ok(res, 'got response');
      }, assert.fail);
  });
});
