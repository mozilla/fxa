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

let currentServer;

const uuid = require('uuid').v4;
const { performance, PerformanceObserver } = require('perf_hooks');
const perfObserver = new PerformanceObserver((items, obs) => {
  for (const entry of items.getEntries()) {
    console.log(`test server perf - ${entry.name} took ms: ${entry.duration}`);
  }
});
perfObserver.observe({ entryTypes: ['measure'], buffer: true });

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
  await TestServer.stop();

  currentServer = new TestServer(config, printLogs, options);

  return currentServer.start().then(() => currentServer);
};

TestServer.prototype.start = function () {
  this.uuid = uuid();
  performance.mark(`${this.uuid}-start-start`);

  const { authServerMockDependencies = {} } = this.options;
  const createAuthServer = proxyquire(
    '../bin/key_server',
    authServerMockDependencies
  );

  const promises = [
    createAuthServer(this.config),
    createMailHelper(this.printLogs),
  ];

  if (this.config.profileServer.url && !this.profileServer) {
    promises.push(createProfileHelper());
  }
  return Promise.all(promises).then(([auth, mail, profileServer]) => {
    this.server = auth;
    this.mail = mail;
    this.profileServer = profileServer;
    performance.mark(`${this.uuid}-start-end`);
    performance.measure(
      `${this.uuid}-start`,
      `${this.uuid}-start-start`,
      `${this.uuid}-start-end`
    );
  });
};

TestServer.stop = async function (maybeServer) {
  if (maybeServer) {
    await maybeServer.stop();
    maybeServer = undefined;
  }

  if (currentServer) {
    await currentServer.stop();
    currentServer = undefined;
  }

  return Promise.resolve();
};

TestServer.prototype.stop = async function () {
  performance.mark(`${this.uuid}-stop-start`);
  currentServer = undefined;

  if (this.server) {
    const doomed = [this.server.close(), this.mail.close()];
    if (this.profileServer) {
      doomed.push(this.profileServer.close());
    }
    return Promise.all(doomed).then((res) => {
      performance.mark(`${this.uuid}-stop-end`);
      performance.measure(
        `${this.uuid}-stop`,
        `${this.uuid}-stop-start`,
        `${this.uuid}-stop-end`
      );
      return res;
    });
  } else {
    return Promise.resolve().then(() => {
      performance.mark(`${this.uuid}-stop-end`);
      performance.measure(
        `${this.uuid}-stop`,
        `${this.uuid}-stop-start`,
        `${this.uuid}-stop-end`
      );
    });
  }
};

TestServer.prototype.uniqueEmail = function (domain) {
  if (!domain) {
    domain = '@restmail.net';
  }
  return crypto.randomBytes(10).toString('hex') + domain;
};

TestServer.prototype.uniqueUnicodeEmail = function () {
  return `${
    crypto.randomBytes(10).toString('hex') + String.fromCharCode(1234)
  }@${String.fromCharCode(5678)}restmail.net`;
};

module.exports = TestServer;
