/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();

const config = require('../../config').default.getProperties();

[{version:""},{version:"V2"}].forEach((testOptions) => {

describe(`#integration${testOptions.version} - remote email validity`, function () {
  this.timeout(60000);
  let server;
  before(async () => {
    server = await TestServer.start(config);
  });

  after(async () => {
    await TestServer.stop(server);
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
      emails[i] = Client.create(config.publicUrl, email, pwd, testOptions).then(
        assert.fail,
        (err) => {
          assert.equal(err.code, 400, 'http 400 : malformed email is rejected');
        }
      );
    });

    return Promise.all(emails);
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
      emails[i] = Client.create(config.publicUrl, email, pwd, testOptions).then(
        (c) => {
          return c.destroyAccount();
        },
        (_err) => {
          assert(
            false,
            `Email address ${email} should have been allowed, but it wasn't`
          );
        }
      );
    });

    return Promise.all(emails);
  });


});


});
