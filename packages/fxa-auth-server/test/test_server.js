/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const crypto = require('crypto');
const EventEmitter = require('events');
const P = require('../lib/promise');
const mailbox = require('./mailbox');
const proxyquire = require('proxyquire').noPreserveCache();
const createDBServer = require('../../fxa-auth-db-mysql');
const createMailHelper = require('./mail_helper');
const createProfileHelper = require('./profile_helper');

let currentServer;
let currentDBServer;

/* eslint-disable no-console */
function TestServer(config, printLogs, options = {}) {
  this.options = options;

  currentServer = this;
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
  currentDBServer = await createDBServer();
  currentDBServer.listen(config.httpdb.url.split(':')[2]);
  currentDBServer.on('error', () => {});
  currentDBServer.server.keepAliveTimeout = 5000;

  currentServer = new TestServer(config, printLogs, options);
  currentServer.db = currentDBServer;

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
  return P.all(promises).spread((auth, mail, profileServer) => {
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

  if (currentDBServer) {
    await currentDBServer.stop();
    currentDBServer = undefined;
  }

  return P.resolve();
};

TestServer.prototype.stop = async function () {
  currentServer = undefined;
  currentDBServer = undefined;
  try {
    await this.db.close();
  } catch (e) {}

  if (this.server) {
    const doomed = [this.server.close(), this.mail.close(), this.db.close()];
    if (this.profileServer) {
      doomed.push(this.profileServer.close());
    }
    return P.all(doomed);
  } else {
    return P.resolve();
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
