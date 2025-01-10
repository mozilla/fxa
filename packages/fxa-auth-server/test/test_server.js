/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const crypto = require('crypto');
const EventEmitter = require('events');
const sinon = require('sinon');
const { default: Container } = require('typedi');
const mailbox = require('./mailbox');
const proxyquire = require('proxyquire').noPreserveCache();
const createMailHelper = require('./mail_helper');
const createProfileHelper = require('./profile_helper');
const { CapabilityService } = require('../lib/payments/capability');
const { AppConfig } = require('../lib/types');

/* eslint-disable no-console */
function TestServer(config, printLogs, options = {}) {
  Container.set(AppConfig, config);
  if (!Container.has(CapabilityService)) {
    Container.set(CapabilityService, {
      subscriptionCapabilities: sinon.fake.resolves([]),
      determineClientVisibleSubscriptionCapabilities: sinon.fake.resolves(''),
    });
  }
  this.options = options;

  if (printLogs === undefined) {
    // Issue where debugger does not attach if
    // child process output is not piped to console

    printLogs =
      process.env.REMOTE_TEST_LOGS === 'true' ||
      process.env.REMOTE_TEST_LOGS === '1';
  }
  if (printLogs) {
    config.log.level = 'debug';
  } else {
    config.log.level = 'critical';
    config.log.stdout = new EventEmitter();
    config.log.stdout.write = function () {};
    config.log.stderr = new EventEmitter();
    config.log.stderr.write = function () {};
  }
  this.printLogs = printLogs;
  this.config = config;
  this.server = null;
  this.mail = null;
  this.mailbox = mailbox(
    config.smtp.api.host,
    config.smtp.api.port,
    this.printLogs
  );
}

TestServer.start = async function (config, printLogs, options) {
  const server = new TestServer(config, printLogs, options);
  await server.start();
  return server;
};

TestServer.prototype.start = async function () {
  const { authServerMockDependencies = {} } = this.options;
  const createAuthServer = proxyquire(
    '../bin/key_server',
    authServerMockDependencies
  );

  this.server = await createAuthServer(this.config);
  this.mail = await createMailHelper(this.printLogs);

  if (this.config.profileServer.url) {
    this.profileServer = await createProfileHelper();
  }
};

TestServer.stop = async function (server) {
  if (!server) {
    throw new Error('Server must be provided');
  }
  await server.stop();
};

TestServer.prototype.stop = async function () {
  if (this.server) {
    await this.server.close();
  }
  if (this.mail) {
    await this.mail.close();
  }
  if (this.profileServer) {
    await this.profileServer.close();
  }
};

TestServer.prototype.uniqueEmail = function (domain, enableCustomsChecks) {
  if (!domain) {
    domain = '@restmail.net';
  }
  const base = crypto.randomBytes(10).toString('hex');

  // The enable_customs_ prefix will skip the 'isAllowedEmail' check in customs
  // that is typically used to by pass customs during testing... This can
  // be useful if a test that expects customs to activate is run.
  const prefix = enableCustomsChecks ? 'enable_customs_' : '';
  return `${prefix}${base}${domain}`;
};

TestServer.prototype.uniqueUnicodeEmail = function () {
  return `${
    crypto.randomBytes(10).toString('hex') + String.fromCharCode(1234)
  }@${String.fromCharCode(5678)}restmail.net`;
};

module.exports = TestServer;
