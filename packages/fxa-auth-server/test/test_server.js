/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const crypto = require('crypto');
const EventEmitter = require('events');
const P = require('../lib/promise');
const mailbox = require('./mailbox');
const createDBServer = require('../fxa-auth-db-mysql');
const createAuthServer = require('../bin/key_server');
const createMailHelper = require('./mail_helper');
const createOauthHelper = require('./oauth_helper');

let currentServer;

/* eslint-disable no-console */
function TestServer(config, printLogs, options = {}) {
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
    config.log.stdout.write = function() {};
  }
  this.printLogs = printLogs;
  this.config = config;
  this.server = null;
  this.mail = null;
  this.oauth = options.oauthServer;
  this.mailbox = mailbox(
    config.smtp.api.host,
    config.smtp.api.port,
    this.printLogs
  );
}

TestServer.start = function(config, printLogs, options) {
  return TestServer.stop()
    .then(() => {
      return createDBServer();
    })
    .then(db => {
      db.listen(config.httpdb.url.split(':')[2]);
      db.on('error', () => {});
      const testServer = new TestServer(config, printLogs, options);
      testServer.db = db;
      return testServer.start().then(() => testServer);
    });
};

TestServer.prototype.start = function() {
  const promises = [
    createAuthServer(this.config),
    createMailHelper(this.printLogs),
  ];

  if (this.config.oauth.url && !this.oauth) {
    promises.push(createOauthHelper());
  }
  return P.all(promises).spread((auth, mail, oauth) => {
    this.server = auth;
    this.mail = mail;
    this.oauth = oauth;
  });
};

TestServer.stop = function(maybeServer) {
  if (maybeServer) {
    return maybeServer.stop();
  } else if (currentServer) {
    return currentServer.stop();
  } else {
    return P.resolve();
  }
};

TestServer.prototype.stop = function() {
  currentServer = undefined;
  try {
    this.db.close();
  } catch (e) {}
  if (this.server) {
    const doomed = [this.server.close(), this.mail.close()];
    if (this.oauth) {
      doomed.push(this.oauth.close());
    }
    return P.all(doomed);
  } else {
    return P.resolve();
  }
};

TestServer.prototype.uniqueEmail = function(domain) {
  if (!domain) {
    domain = '@restmail.net';
  }
  return crypto.randomBytes(10).toString('hex') + domain;
};

TestServer.prototype.uniqueUnicodeEmail = function() {
  return `${crypto.randomBytes(10).toString('hex') +
    String.fromCharCode(1234)}@${String.fromCharCode(5678)}restmail.net`;
};

module.exports = TestServer;
