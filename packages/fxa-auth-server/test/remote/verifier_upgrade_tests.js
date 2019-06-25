/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();
const createDBServer = require('../../fxa-auth-db-mysql');
const log = { trace() {}, info() {} };

const config = require('../../config').getProperties();

const Token = require('../../lib/tokens')(log);
const DB = require('../../lib/db')(
  config,
  log,
  Token.error,
  Token.SessionToken,
  Token.KeyFetchToken,
  Token.AccountResetToken,
  Token.PasswordForgotToken,
  Token.PasswordChangeToken
);

describe('remote verifier upgrade', function() {
  this.timeout(30000);

  before(() => {
    config.verifierVersion = 0;
    config.securityHistory.ipProfiling.allowedRecency = 0;
  });

  it('upgrading verifierVersion upgrades the account on password change', () => {
    return createDBServer().then(db_server => {
      db_server.listen(config.httpdb.url.split(':')[2]);
      db_server.on('error', () => {});

      const email = `${Math.random()}@example.com`;
      const password = 'ok';
      let uid = null;

      return TestServer.start(config)
        .then(server => {
          return Client.create(config.publicUrl, email, password, {
            preVerified: true,
            keys: true,
          }).then(c => {
            uid = c.uid;
            return server.stop();
          });
        })
        .then(() => {
          return DB.connect(config[config.db.backend]).then(db => {
            return db
              .account(uid)
              .then(account => {
                assert.equal(account.verifierVersion, 0, 'wrong version');
              })
              .then(() => {
                return db.close();
              });
          });
        })
        .then(() => {
          config.verifierVersion = 1;
          return TestServer.start(config);
        })
        .then(server => {
          let client;
          return Client.login(config.publicUrl, email, password, server.mailbox)
            .then(x => {
              client = x;
              return client.changePassword(password);
            })
            .then(() => {
              return server.stop();
            });
        })
        .then(() => {
          return DB.connect(config[config.db.backend]).then(db => {
            return db
              .account(uid)
              .then(account => {
                assert.equal(
                  account.verifierVersion,
                  1,
                  'wrong upgrade version'
                );
              })
              .then(() => {
                return db.close();
              });
          });
        })
        .then(() => {
          try {
            db_server.close();
          } catch (e) {
            // This connection may already be dead if a real mysql server is
            // already bound to :8000.
          }
        });
    });
  });
});
