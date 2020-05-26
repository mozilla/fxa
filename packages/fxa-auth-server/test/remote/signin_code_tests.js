/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();
const error = require('../../lib/error');
const config = require('../../config').getProperties();
const crypto = require('crypto');

const SMS_SIGNIN_CODE = /https:\/\/accounts\.firefox\.com\/m\/([A-Za-z0-9_-]+)/;

describe('remote signinCodes', function () {
  let server;

  this.timeout(10000);

  before(() => {
    // We have to send an SMS to get a valid signinCode
    config.sms.enabled = true;
    config.sms.useMock = true;

    return TestServer.start(config).then((result) => {
      server = result;
    });
  });

  it('POST /signinCodes/consume invalid code', () => {
    const client = new Client(config.publicUrl);
    return client
      .consumeSigninCode(
        crypto
          .randomBytes(config.signinCodeSize)
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, ''),
        {
          metricsContext: {
            flowId:
              '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
            flowBeginTime: Date.now(),
          },
        }
      )
      .then((result) => assert.fail('/signinCodes/consume should fail'))
      .catch((err) => {
        assert.ok(err);
        assert.equal(err.code, 400);
        assert.equal(err.errno, error.ERRNO.INVALID_SIGNIN_CODE);
        assert.equal(err.message, 'Invalid signin code');
      });
  });

  it('POST /signinCodes/consume valid code', () => {
    const email = server.uniqueEmail();
    return Client.create(config.publicUrl, email, 'wibble').then((client) => {
      return client
        .smsSend('+18885083401', 1, ['signinCodes'], server.mailbox)
        .then((result) => {
          return client.consumeSigninCode(
            SMS_SIGNIN_CODE.exec(result.text)[1],
            {
              metricsContext: {
                flowId:
                  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
                flowBeginTime: Date.now(),
              },
            }
          );
        })
        .then((result) =>
          assert.deepEqual(
            result,
            { email },
            '/signinCodes/consume should return the email address'
          )
        );
    });
  });

  it('POST /signinCodes creates code', async () => {
    const email = server.uniqueEmail();
    const client = await Client.create(config.publicUrl, email, 'wibble');
    const { code, link, installQrCode } = await client.createSigninCode({
      metricsContext: {
        flowId:
          '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        flowBeginTime: Date.now(),
      },
    });

    assert.ok(code);
    assert.ok(link);
    assert.ok(installQrCode);

    const result = await client.consumeSigninCode(
      SMS_SIGNIN_CODE.exec(link)[1],
      {
        metricsContext: {
          flowId:
            '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
          flowBeginTime: Date.now(),
        },
      }
    );

    assert.deepEqual(
      result,
      { email },
      '/signinCodes/consume should return the email address'
    );
  });

  after(() => {
    return TestServer.stop(server);
  });
});
