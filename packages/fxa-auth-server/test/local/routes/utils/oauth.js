/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const mocks = require('../../../mocks');
const proxyquire = require('proxyquire');

const TEST_EMAIL = 'foo@gmail.com';
const MOCK_UID = '23d4847823f24b0f95e1524987cb0391';
const MOCK_REFRESH_TOKEN =
  '40f61392cf69b0be709fbd3122d0726bb32247b476b2a28451345e7a5555cec7';
const MOCK_REFRESH_TOKEN_2 =
  '00661392cf69b0be709fbd3122d0726bb32247b476b2a28451345e7a5555cec7';
const MOCK_REFRESH_TOKEN_ID_2 =
  '0e4f2255bed0ae53af401150488e69f22beae103b7d6857a5194df00c9827d19';
const OAUTH_CLIENT_ID = '3c49430b43dfba77';
const MOCK_CHECK_RESPONSE = {
  user: MOCK_UID,
  client_id: OAUTH_CLIENT_ID,
  scope: ['https://identity.mozilla.com/apps/oldsync', 'openid'],
};
const MOCK_DEVICE_ID = 'a72ed885e66cb9c96a12fde247112daa';

describe('newTokenNotification', () => {
  let db;
  let mailer;
  let fxaMailer;
  let devices;
  let request;
  let credentials;
  let grant;
  const oauthUtils = proxyquire('../../../../lib/routes/utils/oauth', {
    '../../oauth/token': {
      verify: async function () {
        return MOCK_CHECK_RESPONSE;
      },
    },
    '../../oauth/client': {
      getClientById: async function () {
        return {};
      },
    },
  });

  beforeEach(() => {
    db = mocks.mockDB({
      email: TEST_EMAIL,
      emailVerified: true,
      uid: MOCK_UID,
    });
    mailer = mocks.mockMailer();
    fxaMailer = mocks.mockFxaMailer();
    mocks.mockOAuthClientInfo();
    devices = mocks.mockDevices();
    credentials = {
      uid: MOCK_UID,
      refreshTokenId: MOCK_REFRESH_TOKEN,
    };
    request = mocks.mockRequest({ credentials });
    grant = {
      scope: 'profile https://identity.mozilla.com/apps/oldsync',
      refresh_token: MOCK_REFRESH_TOKEN_2,
    };
  });

  it('creates a device and sends an email with credentials uid', async () => {
    await oauthUtils.newTokenNotification(db, mailer, devices, request, grant);

    assert.equal(fxaMailer.sendNewDeviceLoginEmail.callCount, 1);
    assert.equal(devices.upsert.callCount, 1, 'created a device');
    const args = devices.upsert.args[0];
    assert.equal(
      args[1].refreshTokenId,
      request.auth.credentials.refreshTokenId
    );
  });

  it('skips sending email for new account', async () => {
    db = mocks.mockDB({
      email: TEST_EMAIL,
      emailVerified: true,
      uid: MOCK_UID,
      createdAt: Date.now(),
    });
    await oauthUtils.newTokenNotification(db, mailer, devices, request, grant);

    assert.equal(fxaMailer.sendNewDeviceLoginEmail.callCount, 0);
    assert.equal(devices.upsert.callCount, 1, 'created a device');
  });

  it('creates a device and sends an email with token uid', async () => {
    credentials = {};
    request = mocks.mockRequest({ credentials });
    await oauthUtils.newTokenNotification(db, mailer, devices, request, grant);

    assert.equal(fxaMailer.sendNewDeviceLoginEmail.callCount, 1);
    assert.equal(devices.upsert.callCount, 1, 'created a device');
  });

  it('does nothing for non-NOTIFICATION_SCOPES', async () => {
    grant.scope = 'profile';
    await oauthUtils.newTokenNotification(db, mailer, devices, request, grant);

    assert.equal(fxaMailer.sendNewDeviceLoginEmail.callCount, 0);
    assert.equal(devices.upsert.callCount, 0);
  });

  it('uses refreshTokenId from grant if not provided', async () => {
    credentials = {
      uid: MOCK_UID,
    };
    request = mocks.mockRequest({ credentials });
    await oauthUtils.newTokenNotification(db, mailer, devices, request, grant);

    assert.equal(fxaMailer.sendNewDeviceLoginEmail.callCount, 1);
    assert.equal(devices.upsert.callCount, 1);
    const args = devices.upsert.args[0];
    assert.equal(args[1].refreshTokenId, MOCK_REFRESH_TOKEN_ID_2);
    assert.isUndefined(args[2].id);
  });

  it('updates the device record using the deviceId', async () => {
    credentials = {
      uid: MOCK_UID,
      deviceId: MOCK_DEVICE_ID,
    };
    request = mocks.mockRequest({ credentials });
    await oauthUtils.newTokenNotification(db, mailer, devices, request, grant);

    assert.equal(fxaMailer.sendNewDeviceLoginEmail.callCount, 0);
    assert.equal(devices.upsert.callCount, 1);
    const args = devices.upsert.args[0];
    assert.equal(args[1].refreshTokenId, MOCK_REFRESH_TOKEN_ID_2);
    assert.equal(args[2].id, MOCK_DEVICE_ID);
  });

  it('creates a device but skips email when skipEmail option is true', async () => {
    await oauthUtils.newTokenNotification(db, mailer, devices, request, grant, {
      skipEmail: true,
    });

    assert.equal(fxaMailer.sendNewDeviceLoginEmail.callCount, 0);
    assert.equal(devices.upsert.callCount, 1, 'created a device');
    const args = devices.upsert.args[0];
    assert.equal(
      args[1].refreshTokenId,
      request.auth.credentials.refreshTokenId
    );
  });

  it('uses existingDeviceId when provided and credentials has no deviceId', async () => {
    const EXISTING_DEVICE_ID = 'existingdevice123456';
    // credentials without deviceId
    credentials = {
      uid: MOCK_UID,
      refreshTokenId: MOCK_REFRESH_TOKEN,
    };
    request = mocks.mockRequest({ credentials });

    await oauthUtils.newTokenNotification(db, mailer, devices, request, grant, {
      existingDeviceId: EXISTING_DEVICE_ID,
    });

    // Should not send email since we have an existing device
    assert.equal(fxaMailer.sendNewDeviceLoginEmail.callCount, 0);
    assert.equal(devices.upsert.callCount, 1, 'updated the device');
    const args = devices.upsert.args[0];
    // Should use the existingDeviceId for the upsert
    assert.equal(args[2].id, EXISTING_DEVICE_ID);
    // credentials.deviceId should be set
    assert.equal(args[1].deviceId, EXISTING_DEVICE_ID);
  });
});
