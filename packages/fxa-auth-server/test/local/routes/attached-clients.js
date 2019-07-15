/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const crypto = require('crypto');
const getRoute = require('../../routes_helpers').getRoute;
const mocks = require('../../mocks');
const error = require('../../../lib/error');
const proxyquire = require('proxyquire');
const uuid = require('uuid');

const EARLIEST_SANE_TIMESTAMP = 31536000000;

function makeRoutes(options = {}, requireMocks) {
  const config = options.config || {};
  config.smtp = config.smtp || {};
  config.memcached = config.memcached || {
    address: '127.0.0.1:1121',
    idle: 500,
    lifetime: 30,
  };
  config.i18n = {
    supportedLanguages: ['en', 'fr'],
    defaultLanguage: 'en',
  };
  config.push = {
    allowedServerRegex: /^https:\/\/updates\.push\.services\.mozilla\.com(\/.*)?$/,
  };
  config.lastAccessTimeUpdates = {
    earliestSaneTimestamp: EARLIEST_SANE_TIMESTAMP,
  };
  config.publicUrl = 'https://public.url';

  const log = options.log || mocks.mockLog();
  const db = options.db || mocks.mockDB();
  const oauthdb = options.oauthdb || mocks.mockOAuthDB(log, config);
  const push = options.push || require('../../../lib/push')(log, db, {});
  const devices =
    options.devices || require('../../../lib/devices')(log, db, oauthdb, push);
  const clientUtils =
    options.clientUtils ||
    require('../../../lib/routes/utils/clients')(log, config);
  return proxyquire('../../../lib/routes/attached-clients', requireMocks || {})(
    log,
    db,
    oauthdb,
    devices,
    clientUtils
  );
}

function newId(size = 32) {
  return crypto.randomBytes(size).toString('hex');
}

function locFields(obj) {
  // Set fields explicitly to `undefined`, for deepEqual testing.
  return Object.assign(
    {
      city: undefined,
      country: undefined,
      state: undefined,
      stateCode: undefined,
    },
    obj
  );
}

describe('/account/attached_clients', () => {
  let config, uid, log, db, oauthdb, request, route;

  beforeEach(() => {
    config = {};
    uid = uuid.v4('binary').toString('hex');
    log = mocks.mockLog();
    db = mocks.mockDB();
    oauthdb = mocks.mockOAuthDB(log, config);
    request = mocks.mockRequest({
      credentials: {
        id: crypto.randomBytes(16).toString('hex'),
        uid: uid,
      },
    });
    const accountRoutes = makeRoutes({
      config,
      log,
      db,
      oauthdb,
    });
    route = getRoute(accountRoutes, '/account/attached_clients').handler;
  });

  it('creates a merged list of all the things attached to the account', async () => {
    const now = Date.now();
    const DEVICES = [
      // A device with a sessionToken.
      {
        id: newId(),
        sessionTokenId: newId(),
        type: 'desktop',
        name: 'device 1',
        createdAt: now - 5,
      },
      // An OAuth device.
      {
        id: newId(),
        refreshTokenId: newId(),
        type: 'desktop',
        name: 'oauthy device-o',
        createdAt: now - 2000,
      },
      // A newfangled device with both kinds of token.
      {
        id: newId(),
        sessionTokenId: newId(),
        refreshTokenId: newId(),
        createdAt: now - 4000,
      },
    ];
    const OAUTH_CLIENTS = [
      // A non-public oauth client that's *not* using refresh tokens.
      {
        client_id: newId(16),
        client_name: 'Legacy OAuth Service',
        created_time: now - 1600,
        last_access_time: now - 200,
        scope: ['a', 'b'],
      },
      // A non-public oauth client using refresh tokens.
      {
        client_id: newId(16),
        client_name: 'OAuth Service',
        refresh_token_id: newId(),
        created_time: now - 1600,
        last_access_time: now - 200,
        scope: ['profile'],
      },
      // An OAuth device.
      {
        client_id: newId(16),
        client_name: 'OAuth Device',
        refresh_token_id: DEVICES[1].refreshTokenId,
        created_time: now - 2600,
        last_access_time: now - 200,
        scope: ['foo'],
      },
      // The newfangled device with both kinds of token.
      {
        client_id: newId(16),
        client_name: 'OAuth Mega-Device',
        refresh_token_id: DEVICES[2].refreshTokenId,
        created_time: now - 1600,
        last_access_time: now - 200,
        scope: ['bar'],
      },
    ];
    const SESSIONS = [
      // A web session
      {
        id: newId(),
        createdAt: now - 1234,
        lastAccessTime: now,
        location: { country: 'USA' },
        uaOS: 'Windows',
        uaBrowser: 'Firefox',
        uaBrowserVersion: '67',
      },
      // The sessionToken device
      {
        id: DEVICES[0].sessionTokenId,
        createdAt: now,
        lastAccessTime: now,
        location: { country: 'Australia' },
      },
      // The oauth+session device.
      {
        id: DEVICES[2].sessionTokenId,
        createdAt: now,
        lastAccessTime: now,
        location: { country: 'Germany' },
      },
    ];

    request.app.devices = (async () => {
      return DEVICES;
    })();
    oauthdb.listAuthorizedClients = sinon.spy(async () => {
      return OAUTH_CLIENTS;
    });
    db.sessions = sinon.spy(async () => {
      return SESSIONS;
    });

    request.auth.credentials.id = SESSIONS[0].id;
    const result = await route(request);

    assert.equal(result.length, 6);

    // The device with just a sessionToken.
    assert.deepEqual(result[0], {
      clientId: null,
      deviceId: DEVICES[0].id,
      sessionTokenId: SESSIONS[1].id,
      refreshTokenId: null,
      isCurrentSession: false,
      deviceType: 'desktop',
      name: 'device 1',
      createdTime: now - 5,
      createdTimeFormatted: 'a few seconds ago',
      lastAccessTime: now,
      lastAccessTimeFormatted: 'a few seconds ago',
      scope: null,
      location: locFields({ country: 'Australia' }),
      userAgent: '',
      os: null,
    });
    // The device with just a refreshToken.
    assert.deepEqual(result[1], {
      clientId: OAUTH_CLIENTS[2].client_id,
      deviceId: DEVICES[1].id,
      sessionTokenId: null,
      refreshTokenId: OAUTH_CLIENTS[2].refresh_token_id,
      isCurrentSession: false,
      deviceType: 'desktop',
      name: 'oauthy device-o',
      createdTime: now - 2600,
      createdTimeFormatted: 'a few seconds ago',
      lastAccessTime: now - 200,
      lastAccessTimeFormatted: 'a few seconds ago',
      scope: ['foo'],
      location: {},
      userAgent: '',
      os: null,
    });
    // The newfangled device with both kinds of token.
    assert.deepEqual(result[2], {
      clientId: OAUTH_CLIENTS[3].client_id,
      deviceId: DEVICES[2].id,
      sessionTokenId: SESSIONS[2].id,
      refreshTokenId: OAUTH_CLIENTS[3].refresh_token_id,
      isCurrentSession: false,
      deviceType: 'mobile',
      name: 'OAuth Mega-Device',
      createdTime: now - 4000,
      createdTimeFormatted: 'a few seconds ago',
      lastAccessTime: now,
      lastAccessTimeFormatted: 'a few seconds ago',
      scope: null, // Having a sessionToken means you can grant yourself any scope!
      location: locFields({ country: 'Germany' }),
      userAgent: '',
      os: null,
    });
    // The cloud OAuth service using only access tokens.
    assert.deepEqual(result[3], {
      clientId: OAUTH_CLIENTS[0].client_id,
      deviceId: null,
      sessionTokenId: null,
      refreshTokenId: null,
      isCurrentSession: false,
      deviceType: null,
      name: 'Legacy OAuth Service',
      createdTime: now - 1600,
      createdTimeFormatted: 'a few seconds ago',
      lastAccessTime: now - 200,
      lastAccessTimeFormatted: 'a few seconds ago',
      scope: ['a', 'b'],
      location: {},
      userAgent: '',
      os: null,
    });
    // The cloud OAuth service using a refresh token.
    assert.deepEqual(result[4], {
      clientId: OAUTH_CLIENTS[1].client_id,
      deviceId: null,
      sessionTokenId: null,
      refreshTokenId: OAUTH_CLIENTS[1].refresh_token_id,
      isCurrentSession: false,
      deviceType: null,
      name: 'OAuth Service',
      createdTime: now - 1600,
      createdTimeFormatted: 'a few seconds ago',
      lastAccessTime: now - 200,
      lastAccessTimeFormatted: 'a few seconds ago',
      scope: ['profile'],
      location: {},
      userAgent: '',
      os: null,
    });
    // The web-only login session.
    assert.deepEqual(result[5], {
      clientId: null,
      deviceId: null,
      sessionTokenId: SESSIONS[0].id,
      refreshTokenId: null,
      isCurrentSession: true,
      deviceType: null,
      name: 'Firefox 67, Windows',
      createdTime: now - 1234,
      createdTimeFormatted: 'a few seconds ago',
      lastAccessTime: now,
      lastAccessTimeFormatted: 'a few seconds ago',
      location: locFields({ country: 'USA' }),
      scope: null,
      userAgent: 'Firefox 67',
      os: 'Windows',
    });
  });
});

describe('/account/attached_client/destroy', () => {
  let config, uid, log, db, oauthdb, devices, request, route;

  beforeEach(() => {
    config = {};
    uid = uuid.v4('binary').toString('hex');
    log = mocks.mockLog();
    db = mocks.mockDB();
    oauthdb = mocks.mockOAuthDB(log, config);
    devices = mocks.mockDevices({});
    request = mocks.mockRequest({
      credentials: {
        id: crypto.randomBytes(16).toString('hex'),
        uid: uid,
      },
      payload: {},
    });
    const accountRoutes = makeRoutes({
      config,
      log,
      db,
      oauthdb,
      devices,
    });
    route = getRoute(accountRoutes, '/account/attached_client/destroy').handler;
  });

  it('can destroy by deviceId', async () => {
    const deviceId = newId();
    request.payload = {
      deviceId,
    };

    const res = await route(request);
    assert.deepEqual(res, {});

    assert.equal(devices.destroy.callCount, 1);
    assert.ok(devices.destroy.calledOnceWith(request, deviceId));
    assert.equal(db.deleteSessionToken.callCount, 0);
    assert.equal(oauthdb.revokeAuthorizedClient.callCount, 0);
  });

  it('checks that sessionTokenId matches device record, if given', async () => {
    const deviceId = newId();
    request.payload = {
      deviceId,
      sessionTokenId: newId(),
    };
    devices.destroy = sinon.spy(async () => {
      return {
        sessionTokenId: newId(),
        refreshTokenId: null,
      };
    });

    try {
      await route(request);
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INVALID_PARAMETER);
    }

    assert.ok(devices.destroy.calledOnceWith(request, deviceId));
    assert.ok(db.deleteSessionToken.notCalled);
    assert.ok(oauthdb.revokeAuthorizedClient.notCalled);
  });

  it('checks that refreshTokenId matches device record, if given', async () => {
    const deviceId = newId();
    request.payload = {
      deviceId,
      sessionTokenId: newId(),
      refreshTokenId: newId(),
    };
    devices.destroy = sinon.spy(async () => {
      return {
        sessionTokenId: request.payload.sessionTokenId,
        refreshTokenId: newId(),
      };
    });

    try {
      await route(request);
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INVALID_PARAMETER);
    }

    assert.ok(devices.destroy.calledOnceWith(request, deviceId));
    assert.ok(db.deleteSessionToken.notCalled);
    assert.ok(oauthdb.revokeAuthorizedClient.notCalled);
  });

  it('can destroy by refreshTokenId', async () => {
    const clientId = newId(16);
    const refreshTokenId = newId();
    request.payload = {
      clientId,
      refreshTokenId,
    };

    const res = await route(request);
    assert.deepEqual(res, {});

    assert.ok(devices.destroy.notCalled);
    assert.ok(db.deleteSessionToken.notCalled);
    assert.ok(
      oauthdb.revokeAuthorizedClient.calledOnceWith(request.auth.credentials, {
        client_id: clientId,
        refresh_token_id: refreshTokenId,
      })
    );
  });

  it('silently succeeds if given an invalid refreshTokenId', async () => {
    const clientId = newId(16);
    const refreshTokenId = newId();
    request.payload = {
      clientId,
      refreshTokenId,
    };

    db.revokeAuthorizedClient = sinon.spy(async () => {
      throw error.unknownRefreshToken();
    });

    const res = await route(request);
    assert.deepEqual(res, {});

    assert.ok(devices.destroy.notCalled);
    assert.ok(db.deleteSessionToken.notCalled);
    assert.ok(oauthdb.revokeAuthorizedClient.calledOnce);
  });

  it('wont accept refreshTokenId and sessionTokenId without deviceId', async () => {
    const clientId = newId(16);
    const refreshTokenId = newId();
    request.payload = {
      clientId,
      refreshTokenId,
      sessionTokenId: newId(),
    };

    try {
      await route(request);
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INVALID_PARAMETER);
    }

    assert.ok(devices.destroy.notCalled);
    assert.ok(db.deleteSessionToken.notCalled);
    assert.ok(oauthdb.revokeAuthorizedClient.notCalled);
  });

  it('can destroy by just clientId', async () => {
    const clientId = newId(16);
    request.payload = {
      clientId,
    };

    const res = await route(request);
    assert.deepEqual(res, {});

    assert.ok(devices.destroy.notCalled);
    assert.ok(db.deleteSessionToken.notCalled);
    assert.ok(
      oauthdb.revokeAuthorizedClient.calledOnceWith(request.auth.credentials, {
        client_id: clientId,
      })
    );
  });

  it('wont accept clientId and sessionTokenId without deviceId', async () => {
    const clientId = newId(16);
    request.payload = {
      clientId,
      sessionTokenId: newId(),
    };

    try {
      await route(request);
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INVALID_PARAMETER);
    }

    assert.ok(devices.destroy.notCalled);
    assert.ok(db.deleteSessionToken.notCalled);
    assert.ok(oauthdb.revokeAuthorizedClient.notCalled);
  });

  it('can destroy by sessionTokenId when given the current session', async () => {
    const sessionTokenId = newId(16);
    request.payload = {
      sessionTokenId,
    };
    request.auth.credentials.id = sessionTokenId;

    const res = await route(request);
    assert.deepEqual(res, {});

    assert.ok(devices.destroy.notCalled);
    assert.ok(db.sessionToken.notCalled);
    assert.ok(db.deleteSessionToken.calledOnceWith(request.auth.credentials));
    assert.ok(oauthdb.revokeAuthorizedClient.notCalled);
  });

  it('can destroy by sessionTokenId when given a different session', async () => {
    const sessionTokenId = newId(16);
    request.payload = {
      sessionTokenId,
    };
    db.sessionToken = sinon.spy(async () => {
      return { id: sessionTokenId, uid };
    });

    const res = await route(request);
    assert.deepEqual(res, {});

    assert.ok(devices.destroy.notCalled);
    assert.ok(db.sessionToken.calledOnceWith(sessionTokenId));
    assert.ok(
      db.deleteSessionToken.calledOnceWith({ id: sessionTokenId, uid })
    );
    assert.ok(oauthdb.revokeAuthorizedClient.notCalled);
  });

  it('errors if the sessionToken does not belong to the current user', async () => {
    const sessionTokenId = newId(16);
    request.payload = {
      sessionTokenId,
    };
    db.sessionToken = sinon.spy(async () => {
      return { uid: newId() };
    });

    try {
      await route(request);
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INVALID_PARAMETER);
    }

    assert.ok(devices.destroy.notCalled);
    assert.ok(db.sessionToken.calledOnceWith(sessionTokenId));
    assert.ok(db.deleteSessionToken.notCalled);
    assert.ok(oauthdb.revokeAuthorizedClient.notCalled);
  });
});
