/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Migrated from test/local/routes/utils/oauth.js (Mocha → Jest).
 * Replaced proxyquire with jest.mock for oauth/token and oauth/client.
 * Inlined mockRequest (shared version uses proxyquire internally).
 */

import sinon from 'sinon';

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

jest.mock('../../oauth/token', () => ({
  verify: async function () {
    return MOCK_CHECK_RESPONSE;
  },
}));

jest.mock('../../oauth/client', () => ({
  getClientById: async function () {
    return {};
  },
}));

const mocks = require('../../../test/mocks');
const oauthUtils = require('./oauth');

/**
 * Simplified mockRequest — the shared mocks.mockRequest() uses proxyquire
 * with relative paths that don't resolve from lib/routes/.
 */
function mockRequest(data: any) {
  return {
    app: {
      acceptLanguage: 'en-US',
      clientAddress: '63.245.221.32',
      devices: Promise.resolve([]),
      features: new Set(),
      geo: {
        timeZone: 'America/Los_Angeles',
        location: {
          city: 'Mountain View',
          country: 'United States',
          countryCode: 'US',
          state: 'California',
          stateCode: 'CA',
        },
      },
      locale: 'en-US',
      metricsContext: Promise.resolve({}),
      ua: {
        browser: 'Firefox',
        browserVersion: '57.0',
        os: 'Mac OS X',
        osVersion: '10.13',
        deviceType: null,
        formFactor: null,
      },
      isMetricsEnabled: Promise.resolve(true),
    },
    auth: {
      credentials: data.credentials,
    },
    clearMetricsContext: sinon.stub(),
    emitMetricsEvent: sinon.stub().resolves(),
    emitRouteFlowEvent: sinon.stub().resolves(),
    gatherMetricsContext: sinon.stub().callsFake((d: any) => Promise.resolve(d)),
    headers: {
      'user-agent': 'test user-agent',
    },
    info: {
      received: Date.now() - 1,
      completed: 0,
    },
    params: {},
    payload: data.payload || {},
  };
}

describe('newTokenNotification', () => {
  let db: any;
  let mailer: any;
  let fxaMailer: any;
  let devices: any;
  let request: any;
  let credentials: any;
  let grant: any;

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
    request = mockRequest({ credentials });
    grant = {
      scope: 'profile https://identity.mozilla.com/apps/oldsync',
      refresh_token: MOCK_REFRESH_TOKEN_2,
    };
  });

  it('creates a device and sends an email with credentials uid', async () => {
    await oauthUtils.newTokenNotification(db, mailer, devices, request, grant);

    expect(fxaMailer.sendNewDeviceLoginEmail.callCount).toBe(1);
    expect(devices.upsert.callCount).toBe(1);
    const args = devices.upsert.args[0];
    expect(args[1].refreshTokenId).toBe(
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

    expect(fxaMailer.sendNewDeviceLoginEmail.callCount).toBe(0);
    expect(devices.upsert.callCount).toBe(1);
  });

  it('creates a device and sends an email with token uid', async () => {
    credentials = {};
    request = mockRequest({ credentials });
    await oauthUtils.newTokenNotification(db, mailer, devices, request, grant);

    expect(fxaMailer.sendNewDeviceLoginEmail.callCount).toBe(1);
    expect(devices.upsert.callCount).toBe(1);
  });

  it('does nothing for non-NOTIFICATION_SCOPES', async () => {
    grant.scope = 'profile';
    await oauthUtils.newTokenNotification(db, mailer, devices, request, grant);

    expect(fxaMailer.sendNewDeviceLoginEmail.callCount).toBe(0);
    expect(devices.upsert.callCount).toBe(0);
  });

  it('uses refreshTokenId from grant if not provided', async () => {
    credentials = {
      uid: MOCK_UID,
    };
    request = mockRequest({ credentials });
    await oauthUtils.newTokenNotification(db, mailer, devices, request, grant);

    expect(fxaMailer.sendNewDeviceLoginEmail.callCount).toBe(1);
    expect(devices.upsert.callCount).toBe(1);
    const args = devices.upsert.args[0];
    expect(args[1].refreshTokenId).toBe(MOCK_REFRESH_TOKEN_ID_2);
    expect(args[2].id).toBeUndefined();
  });

  it('updates the device record using the deviceId', async () => {
    credentials = {
      uid: MOCK_UID,
      deviceId: MOCK_DEVICE_ID,
    };
    request = mockRequest({ credentials });
    await oauthUtils.newTokenNotification(db, mailer, devices, request, grant);

    expect(fxaMailer.sendNewDeviceLoginEmail.callCount).toBe(0);
    expect(devices.upsert.callCount).toBe(1);
    const args = devices.upsert.args[0];
    expect(args[1].refreshTokenId).toBe(MOCK_REFRESH_TOKEN_ID_2);
    expect(args[2].id).toBe(MOCK_DEVICE_ID);
  });

  it('creates a device but skips email when skipEmail option is true', async () => {
    await oauthUtils.newTokenNotification(db, mailer, devices, request, grant, {
      skipEmail: true,
    });

    expect(fxaMailer.sendNewDeviceLoginEmail.callCount).toBe(0);
    expect(devices.upsert.callCount).toBe(1);
    const args = devices.upsert.args[0];
    expect(args[1].refreshTokenId).toBe(
      request.auth.credentials.refreshTokenId
    );
  });

  it('uses existingDeviceId when provided and credentials has no deviceId', async () => {
    const EXISTING_DEVICE_ID = 'existingdevice123456';
    credentials = {
      uid: MOCK_UID,
      refreshTokenId: MOCK_REFRESH_TOKEN,
    };
    request = mockRequest({ credentials });

    await oauthUtils.newTokenNotification(db, mailer, devices, request, grant, {
      existingDeviceId: EXISTING_DEVICE_ID,
    });

    expect(fxaMailer.sendNewDeviceLoginEmail.callCount).toBe(0);
    expect(devices.upsert.callCount).toBe(1);
    const args = devices.upsert.args[0];
    expect(args[2].id).toBe(EXISTING_DEVICE_ID);
    expect(args[1].deviceId).toBe(EXISTING_DEVICE_ID);
  });
});
