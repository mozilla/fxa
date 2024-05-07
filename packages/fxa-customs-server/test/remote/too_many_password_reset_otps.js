/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const test = require('tap').test;
const TestServer = require('../test_server');
const Promise = require('bluebird');
const restifyClients = Promise.promisifyAll(require('restify-clients'));
const mcHelper = require('../cache-helper');
const testUtils = require('../utils');

const config = require('../../lib/config').getProperties();
config.limits.rateLimitIntervalSeconds = 1;
config.limits.ipRateLimitIntervalSeconds = 1;
config.limits.passwordResetOtpLimits.maxPasswordResetOtpEmails = 2;
config.limits.passwordResetOtpLimits.passwordResetOtpRateLimitIntervalSeconds = 2;

const testServer = new TestServer(config);

const client = restifyClients.createJsonClient({
  url: 'http://localhost:' + config.listen.port,
});

const action = 'passwordForgotSendOtp';

Promise.promisifyAll(client, { multiArgs: true });

test('startup', async function (t) {
  await testServer.start();
  t.type(testServer.server, 'object', 'test server was started');
  t.end();
});

test('clear everything', function (t) {
  mcHelper.clearEverything(function (err) {
    t.notOk(err, 'no errors were returned');
    t.end();
  });
});

test('/check passwordForgotSendOtp by email', async (t) => {
  const email = testUtils.randomEmail();
  let ip = testUtils.randomIp();

  let response = await client.postAsync('/check', { ip, email, action });
  let [_, res, obj] = response;
  t.equal(res.statusCode, 200, 'returns a 200');
  t.equal(obj.block, false, 'not rate limited');

  // same email different ip
  ip = testUtils.randomIp();

  response = await client.postAsync('/check', { ip, email, action });
  [_, res, obj] = response;
  t.equal(res.statusCode, 200, 'returns a 200');
  t.equal(obj.block, false, 'not rate limited');

  ip = testUtils.randomIp();

  response = await client.postAsync('/check', { ip, email, action });
  // eslint-disable-next-line no-unused-vars
  [_, res, obj] = response;
  t.equal(res.statusCode, 200, 'returns a 200');
  t.equal(obj.block, true, 'rate limited');
  t.equal(obj.retryAfter, 2, 'rate limit retry amount');
});

test('clear everything', function (t) {
  mcHelper.clearEverything(function (err) {
    t.notOk(err, 'no errors were returned');
    t.end();
  });
});

test('/check passwordForgotSendOtp by ip address', async (t) => {
  const ip = testUtils.randomIp();
  let email = testUtils.randomEmail();

  let response = await client.postAsync('/check', { ip, email, action });
  let [_, res, obj] = response;
  t.equal(res.statusCode, 200, 'returns a 200');
  t.equal(obj.block, false, 'not rate limited');

  // same ip different email
  email = testUtils.randomEmail();

  response = await client.postAsync('/check', { ip, email, action });
  [_, res, obj] = response;
  t.equal(res.statusCode, 200, 'returns a 200');
  t.equal(obj.block, false, 'not rate limited');

  email = testUtils.randomEmail();

  response = await client.postAsync('/check', { ip, email, action });
  // eslint-disable-next-line no-unused-vars
  [_, res, obj] = response;
  t.equal(res.statusCode, 200, 'returns a 200');
  t.equal(obj.block, true, 'rate limited');
  t.equal(obj.retryAfter, 2, 'rate limit retry amount');
});

test('teardown', async function (t) {
  await testServer.stop();
  t.end();
});
