/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const mocks = require('../../../mocks');

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

describe('newTokenNotification', () => {
  let db;
  let oauthdb;
  let mailer;
  let devices;
  let request;
  let credentials;
  let grant;
  const oauthUtils = require('../../../../lib/routes/utils/oauth');

  beforeEach(() => {
    db = mocks.mockDB({
      email: TEST_EMAIL,
      emailVerified: true,
      uid: MOCK_UID,
    });
    oauthdb = mocks.mockOAuthDB({
      checkAccessToken: sinon.spy(async () => {
        return MOCK_CHECK_RESPONSE;
      }),
    });
    mailer = mocks.mockMailer();
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
    await oauthUtils.newTokenNotification(
      db,
      oauthdb,
      mailer,
      devices,
      request,
      grant
    );

    assert.equal(oauthdb.checkAccessToken.callCount, 0);
    assert.equal(
      mailer.sendNewDeviceLoginNotification.callCount,
      1,
      'sent email notification'
    );
    assert.equal(devices.upsert.callCount, 1, 'created a device');
    const args = devices.upsert.args[0];
    assert.equal(
      args[1].refreshTokenId,
      request.auth.credentials.refreshTokenId
    );
  });

  it('creates a device and sends an email with checkAccessToken uid', async () => {
    credentials = {};
    request = mocks.mockRequest({ credentials });
    await oauthUtils.newTokenNotification(
      db,
      oauthdb,
      mailer,
      devices,
      request,
      grant
    );

    assert.equal(oauthdb.checkAccessToken.callCount, 1);
    assert.equal(
      mailer.sendNewDeviceLoginNotification.callCount,
      1,
      'sent email notification'
    );
    assert.equal(devices.upsert.callCount, 1, 'created a device');
  });

  it('does nothing for non-NOTIFICATION_SCOPES', async () => {
    grant.scope = 'profile';
    await oauthUtils.newTokenNotification(
      db,
      oauthdb,
      mailer,
      devices,
      request,
      grant
    );

    assert.equal(oauthdb.checkAccessToken.callCount, 0);
    assert.equal(mailer.sendNewDeviceLoginNotification.callCount, 0);
    assert.equal(devices.upsert.callCount, 0);
  });

  it('uses refreshTokenId from grant if not provided', async () => {
    credentials = {
      uid: MOCK_UID,
    };
    request = mocks.mockRequest({ credentials });
    await oauthUtils.newTokenNotification(
      db,
      oauthdb,
      mailer,
      devices,
      request,
      grant
    );

    assert.equal(oauthdb.checkAccessToken.callCount, 0);
    assert.equal(mailer.sendNewDeviceLoginNotification.callCount, 1);
    assert.equal(devices.upsert.callCount, 1);
    const args = devices.upsert.args[0];
    assert.equal(args[1].refreshTokenId, MOCK_REFRESH_TOKEN_ID_2);
  });
});
