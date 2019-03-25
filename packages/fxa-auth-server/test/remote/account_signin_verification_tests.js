/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();
const config = require('../../config').getProperties();
config.redis.sessionTokens.enabled = false;
const url = require('url');
const jwtool = require('fxa-jwtool');
const pubSigKey = jwtool.JWK.fromFile(config.publicKeyFile);
const duration = 1000 * 60 * 60 * 24; // 24 hours
const publicKey = {
  'algorithm': 'RS',
  'n': '4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123',
  'e': '65537'
};

const mocks = require('../mocks');

describe('remote account signin verification', function() {
  this.timeout(30000);
  let server;
  before(() => {
    config.securityHistory.ipProfiling.allowedRecency = 0;
    config.signinConfirmation.skipForNewAccounts.enabled = false;
    return TestServer.start(config)
      .then(s => {
        server = s;
      });
  });

  it(
    'account signin without keys does not set challenge',
    () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      let client = null;
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (x) {
            client = x;
            assert.ok(client.authAt, 'authAt was set');
          }
        )
        .then(
          function () {
            return client.emailStatus();
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, true, 'account is verified');
          }
        )
        .then(
          function () {
            return client.login({keys:false});
          }
        )
        .then(
          function (response) {
            assert(! response.verificationMethod, 'no challenge method set');
            assert(! response.verificationReason, 'no challenge reason set');
            assert.equal(response.verified, true, 'verified set true');
          }
        );
    }
  );

  it(
    'account signin with keys does set challenge',
    () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      let client = null;
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (x) {
            client = x;
            assert.ok(client.authAt, 'authAt was set');
          }
        )
        .then(
          function () {
            return client.emailStatus();
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, true, 'account is verified');
          }
        )
        .then(
          function () {
            return client.login({keys:true});
          }
        )
        .then(
          function (response) {
            assert.equal(response.verificationMethod, 'email', 'challenge method set');
            assert.equal(response.verificationReason, 'login', 'challenge reason set');
            assert.equal(response.verified, false, 'verified set to false');
          }
        );
    }
  );

  it(
    'account can verify new sign-in from email',
    () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      let client = null;
      let uid;
      let code;
      const loginOpts = {
        keys: true,
        metricsContext: mocks.generateMetricsContext()
      };
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (x) {
            client = x;
            assert.ok(client.authAt, 'authAt was set');
          }
        )
        .then(
          function () {
            return client.emailStatus();
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, true, 'new account is verified');
          }
        )
        .then(
          function () {
            return client.login(loginOpts);
          }
        )
        .then(
          function (response) {
            assert.equal(response.verificationMethod, 'email', 'challenge method set to email');
            assert.equal(response.verificationReason, 'login', 'challenge reason set to signin');
            assert.equal(response.verified, false, 'verified set to false');
          }
        )
        .then(
          function () {
            return server.mailbox.waitForEmail(email);
          }
        )
        .then(
          function (emailData) {
            uid = emailData.headers['x-uid'];
            code = emailData.headers['x-verify-code'];
            assert.equal(emailData.subject, 'Confirm new sign-in to Firefox');
            assert.ok(uid, 'sent uid');
            assert.ok(code, 'sent verify code');

            assert.equal(emailData.headers['x-flow-begin-time'], loginOpts.metricsContext.flowBeginTime, 'flow begin time set');
            assert.equal(emailData.headers['x-flow-id'], loginOpts.metricsContext.flowId, 'flow id set');
          }
        )
        .then(
          function () {
            return client.emailStatus();
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, false, 'account is not verified, unverified sign-in');
          }
        )
        .then(
          function () {
            return client.verifyEmail(code);
          }
        )
        .then(
          function () {
            return client.emailStatus();
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, true, 'account is verified confirming email');
          }
        );
    }
  );

  it(
    'Account verification links still work after session verification',
    () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      let client = null;
      let emailCode, tokenCode, uid;

      // Create unverified account
      return Client.create(config.publicUrl, email, password)
        .then(
          function (x) {
            client = x;
          }
        )
        .then(
          function () {
            return server.mailbox.waitForEmail(email);
          }
        )
        .then(
          function (emailData) {
            // Ensure correct email sent
            assert.equal(emailData.subject, 'Verify your Firefox Account');
            emailCode = emailData.headers['x-verify-code'];
            assert.ok(emailCode, 'sent verify code');
            return client.verifyEmail(emailCode);
          }
        )
        .then(
          function () {
            // Trigger sign-in confirm email
            return client.login({keys:true});
          }
        )
        .then(
          function () {
            return server.mailbox.waitForEmail(email);
          }
        )
        .then(
          function (emailData) {
            // Verify sign-confirm email
            uid = emailData.headers['x-uid'];
            tokenCode = emailData.headers['x-verify-code'];
            assert.equal(emailData.subject, 'Confirm new sign-in to Firefox');
            assert.ok(uid, 'sent uid');
            assert.ok(tokenCode, 'sent verify code');
            assert.notEqual(tokenCode, emailCode, 'email and token codes are different');

            return client.emailStatus();
          }
        )
        .then(
          function (status) {
            // Verify account is unverified because of sign-in attempt
            assert.equal(status.verified, false, 'account is not verified,');
            assert.equal(status.sessionVerified, false, 'account is not verified, unverified sign-in session');

            // Attempt to verify account reusing original email code
            return client.verifyEmail(emailCode);
          }
        );
    }
  );

  it(
    'sign-in verification email link',
    () => {
      const email = server.uniqueEmail();
      const password = 'something';
      let client = null;
      const options = {
        redirectTo: 'https://sync.'  + config.smtp.redirectDomain,
        service: 'sync',
        resume: 'resumeToken',
        keys: true
      };
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, options)
        .then(
          function (c) {
            client = c;
          }
        )
        .then(
          function () {
            return client.login(options);
          }
        )
        .then(
          function () {
            return server.mailbox.waitForEmail(email);
          }
        )
        .then(
          function (emailData) {
            const link = emailData.headers['x-link'];
            const query = url.parse(link, true).query;
            assert.ok(query.uid, 'uid is in link');
            assert.ok(query.code, 'code is in link');
            assert.equal(query.service, options.service, 'service is in link');
            assert.equal(query.resume, options.resume, 'resume is in link');
            assert.equal(emailData.subject, 'Confirm new sign-in to Firefox');
          }
        );
    }
  );

  it(
    'sign-in verification from different client',
    () => {
      const email = server.uniqueEmail();
      const password = 'something';
      let client = null;
      let client2 = null;
      const options = {
        redirectTo: 'https://sync.'  + config.smtp.redirectDomain,
        service: 'sync',
        resume: 'resumeToken',
        keys: true
      };
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, options)
        .then(
          function (c) {
            client = c;
          }
        )
        .then(
          function () {
            return client.login(options);
          }
        )
        .then(
          function () {
            return server.mailbox.waitForEmail(email);
          }
        )
        .then(
          function (emailData) {
            const link = emailData.headers['x-link'];
            const query = url.parse(link, true).query;
            assert.ok(query.uid, 'uid is in link');
            assert.ok(query.code, 'code is in link');
            assert.equal(query.service, options.service, 'service is in link');
            assert.equal(query.resume, options.resume, 'resume is in link');
            assert.equal(emailData.subject, 'Confirm new sign-in to Firefox', 'email subject is correct');
          }
        )
        .then(
          function () {
            // Attempt to login from new location
            return Client.login(config.publicUrl, email, password, server.mailbox, options);
          }
        )
        .then(
          function (c) {
            client2 = c;
          }
        )
        .then(
          function () {
            return client2.login(options);
          }
        )
        .then(
          function () {
            return server.mailbox.waitForCode(email);
          }
        )
        .then(
          function (code) {
            // Verify account from client2
            return client2.verifyEmail(code, options);
          }
        )
        .then(
          function () {
            return client2.emailStatus();
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, true, 'account is verified');
            assert.equal(status.emailVerified, true, 'account email is verified');
            assert.equal(status.sessionVerified, true, 'account session is  verified');
          }
        )
        .then(
          function () {
            return client.emailStatus();
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, false, 'account is not verified');
            assert.equal(status.emailVerified, true, 'account email is verified');
            assert.equal(status.sessionVerified, false, 'account session is not verified');
          }
        );
    }
  );

  it(
    'certificate sign with unverified session, keys=true',
    () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      let client = null;

      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, {keys:true})
        .then(
          function (c) {
            client = c;
            return client.emailStatus();
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, true, 'account is verified');
            assert.equal(status.emailVerified, true, 'account email is verified');
            assert.equal(status.sessionVerified, true, 'account session is  verified');
          }
        )
        .then(
          function () {
            // Attempt to login from new location
            return client.login({keys:true});
          }
        )
        .then(
          function (c) {
            client = c;
            return client.emailStatus();
          }
        )
        .then(
          function (status) {
            // Ensure unverified session
            assert.equal(status.verified, false, 'account is not verified');
            assert.equal(status.emailVerified, true, 'account email is verified');
            assert.equal(status.sessionVerified, false, 'account session is not verified');
          }
        )
        .then(
          function () {
            // Attempt to get signed cert
            return client.sign(publicKey, duration);
          }
        )
        .then(
          function () {
            assert.fail('should not have succeeded');
          },
          function (err){
            assert.equal(err.errno, 138, 'Correct error number');
            assert.equal(err.code, 400, 'Correct error code');
            assert.equal(err.message, 'Unverified session', 'Correct error message');
          }
        );
    }
  );

  it(
    'certificate sign with unverified session, keys=false',
    () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      let client = null;

      // Initial account creation uses keys=true
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, {keys:true})
        .then(
          function (c) {
            client = c;
            return client.emailStatus();
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, true, 'account is verified');
            assert.equal(status.emailVerified, true, 'account email is verified');
            assert.equal(status.sessionVerified, true, 'account session is  verified');
          }
        )
        .then(
          function () {
            // Attempt a second login, but don't request keys
            return client.login({keys:false});
          }
        )
        .then(
          function (c) {
            client = c;
            return client.emailStatus();
          }
        )
        .then(
          function (status) {
            // Ensure unverified session
            assert.equal(status.verified, true, 'account is verified');
            assert.equal(status.emailVerified, true, 'account email is verified');
            assert.equal(status.sessionVerified, false, 'account session is not verified');
          }
        )
        .then(
          function () {
            // Attempt to get signed cert
            return client.sign(publicKey, duration);
          }
        )
        .then(
          function (cert) {
            assert.equal(typeof(cert), 'string', 'cert exists');
            const payload = jwtool.verify(cert, pubSigKey.pem);
            assert.equal(payload.iss, config.domain, 'issuer is correct');
            assert.equal(payload.principal.email.split('@')[0], client.uid, 'cert has correct uid');
            assert.ok(payload['fxa-generation'] > 0, 'cert has non-zero generation number');
            assert.ok(new Date() - new Date(payload['fxa-lastAuthAt'] * 1000) < 1000 * 60 * 60, 'lastAuthAt is plausible');
            assert.equal(payload['fxa-verifiedEmail'], email, 'verifiedEmail is correct');
            assert.equal(payload['fxa-tokenVerified'], false, 'tokenVerified is not verified');
          }
        );
    }
  );

  it(
    'certificate sign with verified session',
    () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      let client = null;

      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, {keys:true})
        .then(
          function (c) {
            client = c;
            return client.emailStatus();
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, true, 'account is verified');
            assert.equal(status.emailVerified, true, 'account email is verified');
            assert.equal(status.sessionVerified, true, 'account session is  verified');
          }
        )
        .then(
          function () {
            // Attempt to get signed cert
            return client.sign(publicKey, duration);
          }
        )
        .then(
          function (cert) {
            assert.equal(typeof(cert), 'string', 'cert exists');
            const payload = jwtool.verify(cert, pubSigKey.pem);
            assert.equal(payload.iss, config.domain, 'issuer is correct');
            assert.equal(payload.principal.email.split('@')[0], client.uid, 'cert has correct uid');
            assert.ok(payload['fxa-generation'] > 0, 'cert has non-zero generation number');
            assert.ok(new Date() - new Date(payload['fxa-lastAuthAt'] * 1000) < 1000 * 60 * 60, 'lastAuthAt is plausible');
            assert.equal(payload['fxa-verifiedEmail'], email, 'verifiedEmail is correct');
            assert.equal(payload['fxa-tokenVerified'], true, 'tokenVerified is verified');
          }
        );
    }
  );

  it(
    'account keys, return keys on verified account',
    () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      let client = null;
      let tokenCode;

      return Client.create(config.publicUrl, email, password, {keys:true})
        .then(
          function (c) {
            client = c;
            return client.emailStatus();
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, false, 'account is not verified');
            assert.equal(status.emailVerified, false, 'account email is not verified');
            assert.equal(status.sessionVerified, false, 'account session is not verified');
          }
        )
        .then(
          function () {
            return server.mailbox.waitForEmail(email);
          }
        )
        .then(
          function (emailData) {
            assert.equal(emailData.subject, 'Verify your Firefox Account');
            tokenCode = emailData.headers['x-verify-code'];
            assert.ok(tokenCode, 'sent verify code');
          }
        )
        .then(
          function () {
            // Unverified accounts can not retrieve keys
            return client.keys();
          }
        )
        .catch(function(err){
          assert.equal(err.errno, 104, 'Correct error number');
          assert.equal(err.code, 400, 'Correct error code');
          assert.equal(err.message, 'Unverified account', 'Correct error message');
        })

        .then(
          function () {
            // Verify the account will set emails and tokens verified, which
            // will user to retrieve keys.
            return client.verifyEmail(tokenCode);
          }
        )
        .then(
          function () {
            return client.emailStatus();
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, true, 'account is verified');
            assert.equal(status.emailVerified, true, 'account email is verified');
            assert.equal(status.sessionVerified, true, 'account session is  verified');
          }
        )
        .then(
          function () {
            // Once verified, keys can be returned
            return client.keys();
          }
        )
        .then(
          function (keys) {
            assert.ok(keys.kA, 'has kA keys');
            assert.ok(keys.kB, 'has kB keys');
            assert.ok(keys.wrapKb, 'has wrapKb keys');
          }
        );
    }
  );

  it(
    'account keys, return keys on verified login',
    () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      let client = null;
      let tokenCode;

      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, {keys:true})
        .then(
          function (c) {
            // Trigger confirm sign-in
            client = c;
            return client.login({keys: true});
          }
        )
        .then(
          function (c) {
            client = c;
            return server.mailbox.waitForEmail(email);
          }
        )
        .then(
          function (emailData) {
            assert.equal(emailData.subject, 'Confirm new sign-in to Firefox');
            tokenCode = emailData.headers['x-verify-code'];
            assert.ok(tokenCode, 'sent verify code');
          }
        )
        .then(
          function () {
            return client.keys();
          }
        )
        .then(() => assert(false), function(err){
          // Because of unverified sign-in, requests for keys will fail
          assert.equal(err.errno, 104, 'Correct error number');
          assert.equal(err.code, 400, 'Correct error code');
          assert.equal(err.message, 'Unverified account', 'Correct error message');
        })
        .then(
          function () {
            return client.emailStatus();
          }
        )
        .then(
          function (status) {
            // Verify status of account, only email should be verified
            assert.equal(status.verified, false, 'account is not verified');
            assert.equal(status.emailVerified, true, 'account email is verified');
            assert.equal(status.sessionVerified, false, 'account session is not verified');
          }
        )
        .then(
          function () {
            // Verify the account will set tokens verified.
            return client.verifyEmail(tokenCode);
          }
        )
        .then(
          function () {
            return client.emailStatus();
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, true, 'account is verified');
            assert.equal(status.emailVerified, true, 'account email is verified');
            assert.equal(status.sessionVerified, true, 'account session is  verified');
          }
        )
        .then(
          function () {
            // Can retrieve keys now that account tokens verified
            return client.keys();
          }
        )
        .then(
          function (keys) {
            assert.ok(keys.kA, 'has kA keys');
            assert.ok(keys.kB, 'has kB keys');
            assert.ok(keys.wrapKb, 'has wrapKb keys');
          }
        );
    }
  );

  it(
    'unverified account is verified on sign-in confirmation',
    () => {
      const email = server.uniqueEmail();
      const password = 'allyourbasearebelongtous';
      let client = null;
      let tokenCode;

      return Client.create(config.publicUrl, email, password, server.mailbox, {keys:true})
        .then(
          function (c) {
            client = c;
            return server.mailbox.waitForEmail(email);
          }
        )
        .then(
          function (emailData) {
            assert.equal(emailData.headers['x-template-name'], 'verifyEmail');
            tokenCode = emailData.headers['x-verify-code'];
            assert.ok(tokenCode, 'sent verify code');
          }
        )
        .then(
          function () {
            return client.login({keys:true});
          }
        )
        .then(
          function (c) {
            client = c;
            return server.mailbox.waitForEmail(email);
          }
        )
        .then(
          function (emailData) {
            assert.equal(emailData.headers['x-template-name'], 'verifyEmail');
            const siginToken = emailData.headers['x-verify-code'];
            assert.notEqual(tokenCode, siginToken, 'login codes should not match');

            return client.verifyEmail(siginToken);
          }
        )
        .then(
          function () {
            return client.emailStatus();
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, true, 'account is verified');
            assert.equal(status.emailVerified, true, 'account email is verified');
            assert.equal(status.sessionVerified, true, 'account session is  verified');
          }
        )
        .then(
          function () {
            // Can retrieve keys now that account tokens verified
            return client.keys();
          }
        )
        .then(
          function (keys) {
            assert.ok(keys.kA, 'has kA keys');
            assert.ok(keys.kB, 'has kB keys');
            assert.ok(keys.wrapKb, 'has wrapKb keys');
          }
        );
    }
  );

  after(() => {
    return TestServer.stop(server);
  });
});
