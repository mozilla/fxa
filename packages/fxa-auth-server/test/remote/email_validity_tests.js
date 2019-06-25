/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();
const P = require('../../lib/promise');

const config = require('../../config').getProperties();

describe('remote email validity', function() {
  this.timeout(15000);
  let server;
  before(() => {
    return TestServer.start(config).then(s => {
      server = s;
    });
  });

  it('/account/create with a variety of malformed email addresses', () => {
    const pwd = '123456';

    const emails = [
      'notAnEmailAddress',
      '\n@example.com',
      'me@hello world.com',
      'me@hello+world.com',
      'me@.example',
      'me@example',
      'me@example.com-',
      'me@example..com',
      'me@example-.com',
      'me@example.-com',
      '\uD83D\uDCA9@unicodepooforyou.com',
    ];
    emails.forEach((email, i) => {
      emails[i] = Client.create(config.publicUrl, email, pwd).then(
        assert.fail,
        err => {
          assert.equal(err.code, 400, 'http 400 : malformed email is rejected');
        }
      );
    });

    return P.all(emails);
  });

  it('/account/create with a variety of unusual but valid email addresses', () => {
    const pwd = '123456';

    const emails = [
      'tim@tim-example.net',
      'a+b+c@example.com',
      '#!?-@t-e-s-assert.c-o-m',
      `${String.fromCharCode(1234)}@example.com`,
      `test@${String.fromCharCode(5678)}.com`,
    ];

    emails.forEach((email, i) => {
      emails[i] = Client.create(config.publicUrl, email, pwd).then(
        c => {
          return c.destroyAccount();
        },
        err => {
          assert(
            false,
            `Email address ${email} should have been allowed, but it wasn't`
          );
        }
      );
    });

    return P.all(emails);
  });

  after(() => {
    return TestServer.stop(server);
  });
});
