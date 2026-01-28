/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const crypto = require('crypto');
const getRoute = require('../../routes_helpers').getRoute;
const mocks = require('../../mocks');
const { AppError: error } = require('@fxa/accounts/errors');
const proxyquire = require('proxyquire');
const uuid = require('uuid');

const EARLIEST_SANE_TIMESTAMP = 31536000000;

const mockAuthorizedClients = {
  destroy: sinon.spy(() => Promise.resolve()),
  list: sinon.spy(() => Promise.resolve()),
  listUnique: sinon.spy(() => Promise.resolve()),
};

function makeRoutes(options = {}) {
  const config = options.config || {};
  config.smtp = config.smtp || {};
  config.i18n = {
    supportedLanguages: ['en', 'fr'],
    defaultLanguage: 'en',
  };
  config.push = {
    allowedServerRegex:
      /^https:\/\/updates\.push\.services\.mozilla\.com(\/.*)?$/,
  };
  config.lastAccessTimeUpdates = {
    earliestSaneTimestamp: EARLIEST_SANE_TIMESTAMP,
  };
  config.publicUrl = 'https://public.url';

  const log = options.log || mocks.mockLog();
  const db = options.db || mocks.mockDB();
  const push = options.push || require('../../../lib/push')(log, db, {});
  const devices =
    options.devices || require('../../../lib/devices')(log, db, push);
  const clientUtils =
    options.clientUtils ||
    require('../../../lib/routes/utils/clients')(log, config);
  return proxyquire('../../../lib/routes/attached-clients', {
    '../oauth/authorized_clients': mockAuthorizedClients,
  })(log, db, devices, clientUtils);
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
  let config, uid, log, db, request, route;

  beforeEach(() => {
    config = {};
    uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    log = mocks.mockLog();
    db = mocks.mockDB();
    request = mocks.mockRequest({
      credentials: {
        id: crypto.randomBytes(16).toString('hex'),
        uid: uid,
        setUserAgentInfo: sinon.spy(() => {}),
      },
      headers: {
        'user-agent': 'fake agent',
      },
    });
    const accountRoutes = makeRoutes({
      config,
      log,
      db,
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
    mockAuthorizedClients.list = sinon.spy(async () => {
      return OAUTH_CLIENTS;
    });
    db.sessions = sinon.spy(async () => {
      return SESSIONS;
    });

    request.auth.credentials.id = SESSIONS[0].id;
    const result = await route(request);

    assert.equal(result.length, 6);

    assert.equal(db.touchSessionToken.callCount, 1);
    const args = db.touchSessionToken.args[0];
    assert.equal(args.length, 3);
    const laterDate = Date.now() - 60 * 1000;
    assert.equal(laterDate < args[0].lastAccessTime, true);

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

  it('correctly handles device records with a dangling refresh token', async () => {
    const now = Date.now();
    // A single device record, with both a sessionToken and a refreshToken,
    // but whose refreshTokenId doesn't exist in the OAuth db (because distributed state).
    const DEVICES = [
      {
        id: newId(),
        sessionTokenId: newId(),
        refreshTokenId: newId(),
        createdAt: now - 4000,
      },
    ];
    const SESSIONS = [
      {
        id: DEVICES[0].sessionTokenId,
        createdAt: now,
        lastAccessTime: now,
        location: { country: 'Germany' },
      },
    ];
    const OAUTH_CLIENTS = [];

    request.app.devices = (async () => {
      return DEVICES;
    })();
    mockAuthorizedClients.list = sinon.spy(async () => {
      return OAUTH_CLIENTS;
    });
    db.sessions = sinon.spy(async () => {
      return SESSIONS;
    });

    request.auth.credentials.id = SESSIONS[0].id;
    const result = await route(request);

    assert.equal(result.length, 1);
    assert.deepEqual(result[0], {
      // No clientId, because we couldn't look up the refresh token.
      clientId: null,
      deviceId: DEVICES[0].id,
      sessionTokenId: SESSIONS[0].id,
      // The refreshTokenId, because we tried to look it up and it was missing.
      refreshTokenId: null,
      isCurrentSession: true,
      deviceType: 'desktop',
      name: '',
      createdTime: DEVICES[0].createdAt,
      createdTimeFormatted: 'a few seconds ago',
      lastAccessTime: now,
      lastAccessTimeFormatted: 'a few seconds ago',
      scope: null,
      location: locFields({ country: 'Germany' }),
      userAgent: '',
      os: null,
    });
  });

  it('filters out idle devices', async () => {
    const now = Date.now();
    const FIVE_DAYS_AGO = now - 1000 * 60 * 60 * 24 * 5;
    const ONE_DAY_AGO = now - 1000 * 60 * 60 * 24;

    request.query.filterIdleDevicesTimestamp = ONE_DAY_AGO; // Filter for devices active in the last day
    const DEVICES = [
      {
        id: newId(),
        sessionTokenId: newId(),
        lastAccessTime: now,
        createdAt: now,
      },
      {
        id: newId(),
        sessionTokenId: newId(),
        lastAccessTime: FIVE_DAYS_AGO,
        createdAt: FIVE_DAYS_AGO,
      },
    ];
    const SESSIONS = [
      {
        id: DEVICES[0].sessionTokenId,
        createdAt: now,
        lastAccessTime: now,
        location: { country: 'Germany' },
      },
    ];
    const OAUTH_CLIENTS = [];

    request.app.devices = (async () => {
      return DEVICES;
    })();
    mockAuthorizedClients.list = sinon.spy(async () => {
      return OAUTH_CLIENTS;
    });
    db.sessions = sinon.spy(async () => {
      return SESSIONS;
    });

    request.auth.credentials.id = SESSIONS[0].id;
    const result = await route(request);

    assert.equal(result.length, 1);
  });
});

describe('/account/attached_client/destroy', () => {
  let config, uid, log, db, devices, request, route, accountRoutes;

  beforeEach(() => {
    config = {};
    uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    log = mocks.mockLog();
    db = mocks.mockDB();
    devices = mocks.mockDevices({});
    request = mocks.mockRequest({
      credentials: {
        id: crypto.randomBytes(16).toString('hex'),
        uid: uid,
      },
      payload: {},
    });
    accountRoutes = makeRoutes({
      config,
      log,
      db,
      devices,
    });
    route = getRoute(accountRoutes, '/account/attached_client/destroy').handler;
  });

  it('requires verifiedSessionToken auth strategy', () => {
    const routeConfig = getRoute(
      accountRoutes,
      '/account/attached_client/destroy'
    );
    assert.equal(routeConfig.options.auth.strategy, 'verifiedSessionToken');
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
  });
});

describe('/account/attached_oauth_clients', () => {
  let config, uid, log, db, request, route;

  beforeEach(() => {
    config = {};
    uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    log = mocks.mockLog();
    db = mocks.mockDB();
    request = mocks.mockRequest({
      credentials: {
        id: crypto.randomBytes(16).toString('hex'),
        uid: uid,
        setUserAgentInfo: sinon.spy(() => {}),
      },
      headers: {
        'user-agent': 'fake agent',
      },
    });
    const accountRoutes = makeRoutes({
      config,
      log,
      db,
    });
    route = getRoute(accountRoutes, '/account/attached_oauth_clients').handler;
  });

  it('returns a unique list of OAuth clients with clientId and lastAccessTime', async () => {
    const now = Date.now();

    // Mock OAuth clients data - simulating what listUnique would return
    const OAUTH_CLIENTS = [
      {
        client_id: newId(16),
        client_name: 'Firefox Desktop',
        refresh_token_id: newId(),
        created_time: now - 5000,
        last_access_time: now - 100,
        scope: ['profile', 'sync'],
      },
      {
        client_id: newId(16),
        client_name: 'Firefox Mobile',
        refresh_token_id: newId(),
        created_time: now - 3000,
        last_access_time: now - 50,
        scope: ['profile'],
      },
      {
        client_id: newId(16),
        client_name: 'Third Party App',
        created_time: now - 10000,
        last_access_time: now - 500,
        scope: ['profile:email'],
      },
    ];

    // Mock the listUnique method
    mockAuthorizedClients.listUnique = sinon.spy(async () => {
      return OAUTH_CLIENTS;
    });

    const result = await route(request);

    // Verify listUnique was called with the correct uid
    assert.equal(mockAuthorizedClients.listUnique.callCount, 1);
    assert.equal(mockAuthorizedClients.listUnique.args[0][0], uid);

    // Verify touchSessionToken was called
    assert.equal(db.touchSessionToken.callCount, 1);
    const args = db.touchSessionToken.args[0];
    assert.equal(args.length, 3);
    const laterDate = Date.now() - 60 * 1000;
    assert.equal(laterDate < args[0].lastAccessTime, true);

    assert.equal(result.length, 3);

    // Each result should only have clientId and lastAccessTime

    result.forEach((client, idx) => {
      assert.equal(client.clientId, OAUTH_CLIENTS[idx].client_id);
      assert.equal(client.lastAccessTime, OAUTH_CLIENTS[idx].last_access_time);

      // Verify only these two fields exist
      const keys = Object.keys(client);
      assert.equal(keys.length, 2);
      assert.ok(keys.includes('clientId'));
      assert.ok(keys.includes('lastAccessTime'));
    });

    // Verify clientIds are unique (should be enforced by listUnique)
    const clientIds = result.map((c) => c.clientId);
    const uniqueClientIds = new Set(clientIds);
    assert.equal(
      clientIds.length,
      uniqueClientIds.size,
      'All clientIds should be unique'
    );
  });

  it('returns an empty array when user has no OAuth clients', async () => {
    mockAuthorizedClients.listUnique = sinon.spy(async () => {
      return [];
    });

    const result = await route(request);

    assert.equal(mockAuthorizedClients.listUnique.callCount, 1);
    assert.equal(result.length, 0);
    assert.deepEqual(result, []);
  });
});
