/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import crypto from 'crypto';
import EventEmitter from 'events';
import sinon from 'sinon';
import { Container } from 'typedi';
import mailbox from './mailbox';
import proxyquireModule from 'proxyquire';
const proxyquire = proxyquireModule.noPreserveCache();
import createMailHelper from './mail_helper';
import createProfileHelper from './profile_helper';
import { CapabilityService } from '../lib/payments/capability';
import { AppConfig } from '../lib/types';

let currentServer;

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
  currentServer = undefined;

  if (this.server) {
    const doomed = [this.server.close(), this.mail.close()];
    if (this.profileServer) {
      doomed.push(this.profileServer.close());
    }
    return Promise.all(doomed);
  } else {
    return Promise.resolve();
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

export default TestServer;
