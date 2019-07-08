/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();
const config = require('../../config').getProperties();
const error = require('../../lib/error');

describe('remote sms without the signinCodes feature included in the payload', function() {
  this.timeout(10000);
  let server;

  before(() => {
    config.sms.enabled = true;
    config.sms.isStatusGeoEnabled = true;
    // /sms endpoints need creds and spend money unless the SMS provider is mocked
    config.sms.useMock = true;

    return TestServer.start(config).then(result => {
      server = result;
    });
  });

  it('POST /sms success', () => {
    return Client.create(config.publicUrl, server.uniqueEmail(), 'wibble').then(
      client => {
        return client
          .smsSend('+18885083401', 1)
          .then(result => assert.ok(result));
      }
    );
  });

  it('POST /sms with invalid phone number', () => {
    return Client.create(config.publicUrl, server.uniqueEmail(), 'wibble').then(
      client => {
        return client
          .smsSend('+15551234567', 1)
          .then(() => assert.fail('request should have failed'))
          .catch(err => {
            assert.ok(err);
            assert.equal(err.code, 400);
            assert.equal(err.errno, error.ERRNO.INVALID_PHONE_NUMBER);
            assert.equal(err.message, 'Invalid phone number');
          });
      }
    );
  });

  it('POST /sms with invalid region', () => {
    return Client.create(config.publicUrl, server.uniqueEmail(), 'wibble').then(
      client => {
        return client
          .smsSend('+886287861100', 1)
          .then(() => assert.fail('request should have failed'))
          .catch(err => {
            assert.ok(err);
            assert.equal(err.code, 400);
            assert.equal(err.errno, error.ERRNO.INVALID_REGION);
            assert.equal(err.message, 'Invalid region');
            assert.equal(err.region, 'TW');
          });
      }
    );
  });

  it('POST /sms with invalid message id', () => {
    return Client.create(config.publicUrl, server.uniqueEmail(), 'wibble').then(
      client => {
        return client
          .smsSend('+18885083401', 2)
          .then(() => assert.fail('request should have failed'))
          .catch(err => {
            assert.ok(err);
            assert.equal(err.code, 400);
            assert.equal(err.errno, error.ERRNO.INVALID_MESSAGE_ID);
            assert.equal(err.message, 'Invalid message id');
          });
      }
    );
  });

  it('GET /sms/status', () => {
    return Client.create(config.publicUrl, server.uniqueEmail(), 'wibble').then(
      client => {
        return client.smsStatus().then(status => {
          assert.ok(status);
          assert.equal(typeof status.ok, 'boolean');
          assert.equal(status.country, 'US');
        });
      }
    );
  });

  after(() => {
    return TestServer.stop(server);
  });
});

describe('remote sms with the signinCodes feature included in the payload', function() {
  this.timeout(10000);
  let server;

  before(() => {
    config.sms.enabled = true;
    config.sms.isStatusGeoEnabled = true;
    // /sms endpoints need creds and spend money unless the SMS provider is mocked
    config.sms.useMock = true;

    return TestServer.start(config).then(result => {
      server = result;
    });
  });

  it('POST /sms success', () => {
    return Client.create(config.publicUrl, server.uniqueEmail(), 'wibble').then(
      client => {
        return client
          .smsSend('+18885083401', 1, ['signinCodes'])
          .then(result => assert.ok(result));
      }
    );
  });

  after(() => {
    return TestServer.stop(server);
  });
});
