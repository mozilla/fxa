/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('chai').assert;
const Environment = require('../addons/environment');

const sinon = require('sinon');
describe('verifyCode', function() {
  var respond;
  let env;
  var mail;
  var client;
  var RequestMocks;
  var xhr;
  var xhrOpen;
  var xhrSend;

  beforeEach(function() {
    env = new Environment();
    respond = env.respond;
    mail = env.mail;
    client = env.client;
    RequestMocks = env.RequestMocks;
    xhr = env.xhr;
    xhrOpen = sinon.spy(xhr.prototype, 'open');
    xhrSend = sinon.spy(xhr.prototype, 'send');
  });

  afterEach(function() {
    xhrOpen.restore();
    xhrSend.restore();
  });

  it('#verifyEmail', function() {
    var user = 'test3' + new Date().getTime();
    var email = user + '@restmail.net';
    var password = 'iliketurtles';
    var uid;

    return respond(client.signUp(email, password), RequestMocks.signUp)
      .then(function(result) {
        uid = result.uid;
        assert.ok(uid, 'uid is returned');

        return respond(mail.wait(user), RequestMocks.mail);
      })
      .then(function(emails) {
        var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
        assert.ok(code, 'code is returned');

        return respond(client.verifyCode(uid, code), RequestMocks.verifyCode);
      })
      .then(function(result) {
        assert.ok(result);
      }, assert.fail);
  });

  it('#verifyEmailCheckStatus', function() {
    var user = 'test4' + new Date().getTime();
    var email = user + '@restmail.net';
    var password = 'iliketurtles';
    var uid;
    var sessionToken;

    return respond(client.signUp(email, password), RequestMocks.signUp)
      .then(function(result) {
        uid = result.uid;
        assert.ok(uid, 'uid is returned');

        return respond(client.signIn(email, password), RequestMocks.signIn);
      })
      .then(function(result) {
        assert.ok(result.sessionToken, 'sessionToken is returned');
        sessionToken = result.sessionToken;

        return respond(
          client.recoveryEmailStatus(sessionToken),
          RequestMocks.recoveryEmailUnverified
        );
      })
      .then(function(result) {
        assert.equal(result.verified, false, 'Email should not be verified.');

        return respond(mail.wait(user, 2), RequestMocks.mailUnverifiedSignin);
      })
      .then(function(emails) {
        var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
        assert.ok(code, 'code is returned: ' + code);

        return respond(client.verifyCode(uid, code), RequestMocks.verifyCode);
      })
      .then(function(result) {
        return respond(
          client.recoveryEmailStatus(sessionToken),
          RequestMocks.recoveryEmailVerified
        );
      })
      .then(function(result) {
        assert.equal(result.verified, true, 'Email should be verified.');
      }, assert.fail);
  });

  it('#verifyEmail with service param', function() {
    var user = 'test5' + new Date().getTime();
    var email = user + '@restmail.net';
    var password = 'iliketurtles';
    var uid;

    return respond(client.signUp(email, password), RequestMocks.signUp)
      .then(function(result) {
        uid = result.uid;
        assert.ok(uid, 'uid is returned');

        return respond(mail.wait(user), RequestMocks.mail);
      })
      .then(function(emails) {
        var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
        assert.ok(code, 'code is returned');

        return respond(
          client.verifyCode(uid, code, { service: 'sync' }),
          RequestMocks.verifyCode
        );
      })
      .then(function(result) {
        assert.ok(result);
      }, assert.fail);
  });

  it('#verifyEmail with reminder param', function() {
    var user = 'test6' + new Date().getTime();
    var email = user + '@restmail.net';
    var password = 'iliketurtles';
    var uid;

    return respond(client.signUp(email, password), RequestMocks.signUp)
      .then(function(result) {
        uid = result.uid;
        assert.ok(uid, 'uid is returned');

        return respond(mail.wait(user), RequestMocks.mail);
      })
      .then(function(emails) {
        var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
        assert.ok(code, 'code is returned');

        return respond(
          client.verifyCode(uid, code, { reminder: 'first' }),
          RequestMocks.verifyCode
        );
      })
      .then(function(result) {
        assert.ok(result);
      }, assert.fail);
  });

  it('#verifyEmail with style param', function() {
    var user = 'test7' + new Date().getTime();
    var email = user + '@restmail.net';
    var password = 'iliketurtles';
    var uid;

    return respond(client.signUp(email, password), RequestMocks.signUp)
      .then(function(result) {
        uid = result.uid;
        assert.ok(uid, 'uid is returned');

        return respond(mail.wait(user), RequestMocks.mail);
      })
      .then(function(emails) {
        var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
        assert.ok(code, 'code is returned');

        return respond(
          client.verifyCode(uid, code, { style: 'trailhead' }),
          RequestMocks.verifyCode
        );
      })
      .then(function(result) {
        assert.ok(result);
        assert.equal(xhrOpen.args[2][0], 'POST', 'method is correct');
        assert.include(
          xhrOpen.args[2][1],
          '/recovery_email/verify_code',
          'path is correct'
        );
        var sentData = JSON.parse(xhrSend.args[2][0]);
        assert.equal(sentData.style, 'trailhead');
      }, assert.fail);
  });

  it('#verifyEmail with marketingOptIn param', function() {
    var user = 'test7' + new Date().getTime();
    var email = user + '@restmail.net';
    var password = 'iliketurtles';
    var uid;

    return respond(client.signUp(email, password), RequestMocks.signUp)
      .then(function(result) {
        uid = result.uid;
        assert.ok(uid, 'uid is returned');

        return respond(mail.wait(user), RequestMocks.mail);
      })
      .then(function(emails) {
        var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
        assert.ok(code, 'code is returned');

        return respond(
          client.verifyCode(uid, code, { marketingOptIn: true }),
          RequestMocks.verifyCode
        );
      })
      .then(function(result) {
        assert.ok(result);
        assert.equal(xhrOpen.args[2][0], 'POST', 'method is correct');
        assert.include(
          xhrOpen.args[2][1],
          '/recovery_email/verify_code',
          'path is correct'
        );
        var sentData = JSON.parse(xhrSend.args[2][0]);
        assert.equal(sentData.marketingOptIn, true);
      }, assert.fail);
  });

  it('#verifyEmail with newsletters param', function() {
    var user = 'test7' + new Date().getTime();
    var email = user + '@restmail.net';
    var password = 'iliketurtles';
    var uid;

    return respond(client.signUp(email, password), RequestMocks.signUp)
      .then(function(result) {
        uid = result.uid;
        assert.ok(uid, 'uid is returned');

        return respond(mail.wait(user), RequestMocks.mail);
      })
      .then(function(emails) {
        var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
        assert.ok(code, 'code is returned');

        return respond(
          client.verifyCode(uid, code, { newsletters: ['test-pilot'] }),
          RequestMocks.verifyCode
        );
      })
      .then(function(result) {
        assert.ok(result);
        assert.equal(xhrOpen.args[2][0], 'POST', 'method is correct');
        assert.include(
          xhrOpen.args[2][1],
          '/recovery_email/verify_code',
          'path is correct'
        );
        var sentData = JSON.parse(xhrSend.args[2][0]);
        assert.deepEqual(sentData.newsletters, ['test-pilot']);
      }, assert.fail);
  });
});
