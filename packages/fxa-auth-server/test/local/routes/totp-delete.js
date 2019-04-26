/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const {assert} = require('chai');
const mocks = require('../../mocks');
const P = require('../../../lib/promise');
const sinon = require('sinon');
const hawk = require('hawk');
const config = require('../../../config').getProperties();
const error = require('../../../lib/error');
const translator = {
  getTranslator: sinon.spy(() => ({
    en: {
      format: () => {
      }, language: 'en'
    }
  })),
  getLocale: sinon.spy(() => 'en')
};

let log, db, customs, routes, server, requestOptions, mailer, sessionToken, response;
const UID = 'abc';
const EMAIL = 'abc@123.com';
const defaultRequestOptions = {
  headers: {},
  method: 'POST',
  payload: {
    metricsContext: {
      flowBeginTime: Date.now(),
      flowId: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
    }
  }
};

describe('/totp/destroy', () => {
  describe('should delete unverified TOTP token', () => {
    before(async () => {
      requestOptions = Object.assign(defaultRequestOptions, {url: '/totp/destroy'});
      response = await runTest({
        verified: false,
        enabled: false
      }, {}, requestOptions);
    });

    it('should return successful response', () => {
      assert.equal(response.statusCode, 200);
      assert.deepEqual(response.result, {}, 'empty response');
    });

    it('should call deleteTotpToken', () => {
      assert.equal(db.deleteTotpToken.callCount, 1, 'called delete TOTP token');
    });

    it('should notify attached services', () => {
      assert.equal(log.notifyAttachedServices.callCount, 1, 'called notifyAttachedServices');
      const args = log.notifyAttachedServices.args[0];
      assert.equal(args.length, 3, 'log.notifyAttachedServices was passed three arguments');
      assert.equal(args[0], 'profileDataChanged', 'first argument was event name');
      assert.equal(args[1]['path'], '/totp/destroy', 'second argument was request object');
      assert.equal(args[2]['uid'], UID, 'third argument was event data with a uid');
    });

    it('should send email notifications', () => {
      assert.equal(mailer.sendPostRemoveTwoStepAuthNotification.callCount, 1, 'called sendPostRemoveTwoStepAuthNotification');
      const args = mailer.sendPostRemoveTwoStepAuthNotification.args[0];
      assert.equal(args.length, 3, 'mailer.sendPostRemoveTwoStepAuthNotification was passed three arguments');
      assert.equal(args[1]['email'], EMAIL, 'email address passed');
    });
  });

  describe('should delete TOTP token in older verified session', () => {
    before(async () => {
      requestOptions = Object.assign(defaultRequestOptions, {url: '/totp/destroy'});
      response = await runTest({
        verified: true,
        enabled: true
      }, {}, requestOptions);
    });

    it('should return successful response', () => {
      assert.equal(response.statusCode, 200);
      assert.deepEqual(response.result, {}, 'empty response');
    });

    it('should call deleteTotpToken', () => {
      assert.equal(db.deleteTotpToken.callCount, 1, 'called delete TOTP token');
    });

    it('should notify attached services', () => {
      assert.equal(log.notifyAttachedServices.callCount, 1, 'called notifyAttachedServices');
      const args = log.notifyAttachedServices.args[0];
      assert.equal(args.length, 3, 'log.notifyAttachedServices was passed three arguments');
      assert.equal(args[0], 'profileDataChanged', 'first argument was event name');
      assert.equal(args[1]['path'], '/totp/destroy', 'second argument was request object');
      assert.equal(args[2]['uid'], UID, 'third argument was event data with a uid');
    });

    it('should send email notifications', () => {
      assert.equal(mailer.sendPostRemoveTwoStepAuthNotification.callCount, 1, 'called sendPostRemoveTwoStepAuthNotification');
      const args = mailer.sendPostRemoveTwoStepAuthNotification.args[0];
      assert.equal(args.length, 3, 'mailer.sendPostRemoveTwoStepAuthNotification was passed three arguments');
      assert.equal(args[1]['email'], EMAIL, 'email address passed');
    });
  });

  describe('should delete TOTP token in newer TOTP verified session', () => {
    before(async () => {
      requestOptions = Object.assign(defaultRequestOptions, {url: '/totp/destroy'});
      response = await runTest({
        verified: true,
        enabled: true,
        verificationMethod: 2,
        createdAt: Date.now() + 100000 // Create a session with a timestamp older than TOTP token
      }, {}, requestOptions);
    });

    it('should return successful response', () => {
      assert.equal(response.statusCode, 200);
      assert.deepEqual(response.result, {}, 'empty response');
    });

    it('should call deleteTotpToken', () => {
      assert.equal(db.deleteTotpToken.callCount, 1, 'called delete TOTP token');
    });

    it('should notify attached services', () => {
      assert.equal(log.notifyAttachedServices.callCount, 1, 'called notifyAttachedServices');
      const args = log.notifyAttachedServices.args[0];
      assert.equal(args.length, 3, 'log.notifyAttachedServices was passed three arguments');
      assert.equal(args[0], 'profileDataChanged', 'first argument was event name');
      assert.equal(args[1]['path'], '/totp/destroy', 'second argument was request object');
      assert.equal(args[2]['uid'], UID, 'third argument was event data with a uid');
    });

    it('should send email notifications', () => {
      assert.equal(mailer.sendPostRemoveTwoStepAuthNotification.callCount, 1, 'called sendPostRemoveTwoStepAuthNotification');
      const args = mailer.sendPostRemoveTwoStepAuthNotification.args[0];
      assert.equal(args.length, 3, 'mailer.sendPostRemoveTwoStepAuthNotification was passed three arguments');
      assert.equal(args[1]['email'], EMAIL, 'email address passed');
    });
  });

  describe('should not delete TOTP token in older unverified session', () => {
    before(async () => {
      requestOptions = Object.assign(defaultRequestOptions, {url: '/totp/destroy'});
      response = await runTest({
        verified: true,
        enabled: true,
        tokenVerificationId: 'notverifiedsession'
      }, {}, requestOptions);
    });

    it('should return error response', () => {
      assert.equal(response.statusCode, 400);
      assert.equal(response.result.errno, 138, 'unverified session error');
    });
  });

  describe('should not delete TOTP token in newer unverified session', () => {
    before(async () => {
      requestOptions = Object.assign(defaultRequestOptions, {url: '/totp/destroy'});
      response = await runTest({
        verified: true,
        enabled: true,
        createdAt: Date.now() + 100000,
        tokenVerificationId: 'notverifiedsession'
      }, {}, requestOptions);
    });

    it('should return error response', () => {
      assert.equal(response.statusCode, 400);
      assert.equal(response.result.errno, 138, 'unverified session error');
    });
  });

  afterEach(async () => {
    await server.stop();
  });
});

async function runTest (results, errors, requestOptions) {
  // Perform custom setup for the required mocks and overrides to
  // handle the request
  log = mocks.mockLog();
  customs = mocks.mockCustoms(errors.customs);
  mailer = mocks.mockMailer();
  db = mocks.mockDB({uid: UID, email: EMAIL}, errors.db);

  // Create a valid session token to be used with Hawk Authentication
  const Token = require('../../../lib/tokens')(log, config);
  sessionToken = await Token.SessionToken.create({
    uid: UID,
    tokenVerificationId: results.tokenVerificationId,
    createdAt: results.createdAt || Date.now(),
    verificationMethod: results.verificationMethod || '0'
  });
  db.sessionToken = sinon.spy(async () => sessionToken);
  db.totpToken = sinon.spy(() => {
    return P.resolve({
      verified: !! results.verified,
      enabled: !! results.enabled,
      createdAt: Date.now()
    });
  });
  routes = require('../../../lib/routes/totp')(log, db, mailer, customs, config);
  const authHeader = hawkHeader(sessionToken, 'POST', `${config.publicUrl}${requestOptions.url}`, requestOptions.payload);

  const Server = require('../../../lib/server');
  server = await Server.create(log, error, config, routes, db, {}, translator, Token);

  const injectRequest = {
    headers: {
      authorization: authHeader
    },
    method: requestOptions.method || 'POST',
    url: requestOptions.url,
    payload: requestOptions.payload
  };

  await server.start();
  return server.inject(injectRequest);
}

function hawkHeader (token, method, url, payload, offset) {
  const verify = {
    credentials: token
  };
  if (payload) {
    verify.contentType = 'application/json';
    verify.payload = JSON.stringify(payload);
  }
  return hawk.client.header(url, method, verify).header;
}
