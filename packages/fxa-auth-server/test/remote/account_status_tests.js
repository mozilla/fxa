/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();

const config = require('../../config').getProperties();

describe('remote account status', function() {
  this.timeout(15000);
  let server;
  before(() => {
    return TestServer.start(config).then(s => {
      server = s;
    });
  });

  it('account status with existing account', () => {
    return Client.create(config.publicUrl, server.uniqueEmail(), 'password')
      .then(c => {
        return c.api.accountStatus(c.uid);
      })
      .then(response => {
        assert.ok(response.exists, 'account exists');
      });
  });

  it('account status includes locale when authenticated', () => {
    return Client.create(config.publicUrl, server.uniqueEmail(), 'password', {
      lang: 'en-US',
    })
      .then(c => {
        return c.api.accountStatus(c.uid, c.sessionToken);
      })
      .then(response => {
        assert.equal(response.locale, 'en-US', 'locale is stored');
      });
  });

  it('account status does not include locale when unauthenticated', () => {
    return Client.create(config.publicUrl, server.uniqueEmail(), 'password', {
      lang: 'en-US',
    })
      .then(c => {
        return c.api.accountStatus(c.uid);
      })
      .then(response => {
        assert.ok(!response.locale, 'locale is not present');
      });
  });

  it('account status unauthenticated with no uid returns an error', () => {
    return Client.create(config.publicUrl, server.uniqueEmail(), 'password', {
      lang: 'en-US',
    })
      .then(c => {
        return c.api.accountStatus();
      })
      .then(
        () => {
          assert(false, 'should get an error');
        },
        e => {
          assert.equal(e.code, 400, 'correct error status code');
          assert.equal(e.errno, 108, 'correct errno');
        }
      );
  });

  it('account status with non-existing account', () => {
    const api = new Client.Api(config.publicUrl);
    return api
      .accountStatus('0123456789ABCDEF0123456789ABCDEF')
      .then(response => {
        assert.ok(!response.exists, 'account does not exist');
      });
  });

  it('account status by email with existing account', () => {
    const email = server.uniqueEmail();
    return Client.create(config.publicUrl, email, 'password')
      .then(c => {
        return c.api.accountStatusByEmail(email);
      })
      .then(response => {
        assert.ok(response.exists, 'account exists');
      });
  });

  it('account status by email with non-existing account', () => {
    const email = server.uniqueEmail();
    return Client.create(config.publicUrl, email, 'password')
      .then(c => {
        const nonExistEmail = server.uniqueEmail();
        return c.api.accountStatusByEmail(nonExistEmail);
      })
      .then(response => {
        assert.ok(!response.exists, 'account does not exist');
      });
  });

  it('account status by email with an invalid email', () => {
    const email = server.uniqueEmail();
    return Client.create(config.publicUrl, email, 'password')
      .then(c => {
        const invalidEmail = 'notAnEmail';
        return c.api.accountStatusByEmail(invalidEmail);
      })
      .then(
        () => {
          assert(false, 'should not have successful request');
        },
        err => {
          assert.equal(err.code, 400);
          assert.equal(err.errno, 107);
          assert.equal(err.message, 'Invalid parameter in request body');
        }
      );
  });

  it('account status by email works with unicode email address', () => {
    const email = server.uniqueUnicodeEmail();
    return Client.create(config.publicUrl, email, 'password')
      .then(c => {
        return c.api.accountStatusByEmail(email);
      })
      .then(response => {
        assert.ok(response.exists, 'account exists');
      });
  });

  after(() => {
    return TestServer.stop(server);
  });
});
