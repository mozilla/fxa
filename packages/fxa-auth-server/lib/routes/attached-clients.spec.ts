/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'crypto';

const mocks = require('../../test/mocks');
const { getRoute } = require('../../test/routes_helpers');
const { AppError: error } = require('@fxa/accounts/errors');
const uuid = require('uuid');

const EARLIEST_SANE_TIMESTAMP = 31536000000;

const mockAuthorizedClients: any = {
  destroy: jest.fn(() => Promise.resolve()),
  list: jest.fn(() => Promise.resolve()),
  listUnique: jest.fn(() => Promise.resolve()),
};

jest.mock('../oauth/authorized_clients', () => mockAuthorizedClients);

function makeRoutes(options: any = {}) {
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
  const push = options.push || require('../push')(log, db, {});
  const devices = options.devices || require('../devices')(log, db, push);
  const clientUtils =
    options.clientUtils || require('./utils/clients')(log, config);
  return require('./attached-clients')(log, db, devices, clientUtils);
}

function newId(size = 32) {
  return crypto.randomBytes(size).toString('hex');
}

function locFields(obj: any) {
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
  let config: any, uid: string, log: any, db: any, request: any, route: any;

  beforeEach(() => {
    config = {};
    uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    log = mocks.mockLog();
    db = mocks.mockDB();
    request = mocks.mockRequest({
      credentials: {
        id: crypto.randomBytes(16).toString('hex'),
        uid: uid,
        setUserAgentInfo: jest.fn(() => {}),
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
      {
        id: newId(),
        sessionTokenId: newId(),
        type: 'desktop',
        name: 'device 1',
        createdAt: now - 5,
      },
      {
        id: newId(),
        refreshTokenId: newId(),
        type: 'desktop',
        name: 'oauthy device-o',
        createdAt: now - 2000,
      },
      {
        id: newId(),
        sessionTokenId: newId(),
        refreshTokenId: newId(),
        createdAt: now - 4000,
      },
    ];
    const OAUTH_CLIENTS = [
      {
        client_id: newId(16),
        client_name: 'Legacy OAuth Service',
        created_time: now - 1600,
        last_access_time: now - 200,
        scope: ['a', 'b'],
      },
      {
        client_id: newId(16),
        client_name: 'OAuth Service',
        refresh_token_id: newId(),
        created_time: now - 1600,
        last_access_time: now - 200,
        scope: ['profile'],
      },
      {
        client_id: newId(16),
        client_name: 'OAuth Device',
        refresh_token_id: DEVICES[1].refreshTokenId,
        created_time: now - 2600,
        last_access_time: now - 200,
        scope: ['foo'],
      },
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
      {
        id: newId(),
        createdAt: now - 1234,
        lastAccessTime: now,
        location: { country: 'USA' },
        uaOS: 'Windows',
        uaBrowser: 'Firefox',
        uaBrowserVersion: '67',
      },
      {
        id: DEVICES[0].sessionTokenId,
        createdAt: now,
        lastAccessTime: now,
        location: { country: 'Australia' },
      },
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
    mockAuthorizedClients.list = jest.fn(async () => {
      return OAUTH_CLIENTS;
    });
    db.sessions = jest.fn(async () => {
      return SESSIONS;
    });

    request.auth.credentials.id = SESSIONS[0].id;
    const result = await route(request);

    expect(result).toHaveLength(6);

    expect(db.touchSessionToken).toHaveBeenCalledTimes(1);
    const args = db.touchSessionToken.mock.calls[0];
    expect(args).toHaveLength(3);
    const laterDate = Date.now() - 60 * 1000;
    expect(laterDate < args[0].lastAccessTime).toBe(true);

    expect(result[0]).toEqual({
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
    expect(result[1]).toEqual({
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
    expect(result[2]).toEqual({
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
      scope: null,
      location: locFields({ country: 'Germany' }),
      userAgent: '',
      os: null,
    });
    expect(result[3]).toEqual({
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
    expect(result[4]).toEqual({
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
    expect(result[5]).toEqual({
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
    const OAUTH_CLIENTS: any[] = [];

    request.app.devices = (async () => {
      return DEVICES;
    })();
    mockAuthorizedClients.list = jest.fn(async () => {
      return OAUTH_CLIENTS;
    });
    db.sessions = jest.fn(async () => {
      return SESSIONS;
    });

    request.auth.credentials.id = SESSIONS[0].id;
    const result = await route(request);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      clientId: null,
      deviceId: DEVICES[0].id,
      sessionTokenId: SESSIONS[0].id,
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

    request.query.filterIdleDevicesTimestamp = ONE_DAY_AGO;
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
    const OAUTH_CLIENTS: any[] = [];

    request.app.devices = (async () => {
      return DEVICES;
    })();
    mockAuthorizedClients.list = jest.fn(async () => {
      return OAUTH_CLIENTS;
    });
    db.sessions = jest.fn(async () => {
      return SESSIONS;
    });

    request.auth.credentials.id = SESSIONS[0].id;
    const result = await route(request);

    expect(result).toHaveLength(1);
  });
});

describe('/account/attached_client/destroy', () => {
  let config: any,
    uid: string,
    log: any,
    db: any,
    devices: any,
    request: any,
    route: any,
    accountRoutes: any;

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
    expect(routeConfig.options.auth.strategy).toBe('verifiedSessionToken');
  });

  it('can destroy by deviceId', async () => {
    const deviceId = newId();
    request.payload = {
      deviceId,
    };

    const res = await route(request);
    expect(res).toEqual({});

    expect(devices.destroy).toHaveBeenCalledTimes(1);
    expect(devices.destroy).toHaveBeenCalledWith(request, deviceId);
    expect(db.deleteSessionToken).toHaveBeenCalledTimes(0);
  });

  it('checks that sessionTokenId matches device record, if given', async () => {
    const deviceId = newId();
    request.payload = {
      deviceId,
      sessionTokenId: newId(),
    };
    devices.destroy = jest.fn(async () => {
      return {
        sessionTokenId: newId(),
        refreshTokenId: null,
      };
    });

    await expect(route(request)).rejects.toMatchObject({
      errno: error.ERRNO.INVALID_PARAMETER,
    });

    expect(devices.destroy).toHaveBeenCalledTimes(1);
    expect(devices.destroy).toHaveBeenCalledWith(request, deviceId);
    expect(db.deleteSessionToken).not.toHaveBeenCalled();
  });

  it('checks that refreshTokenId matches device record, if given', async () => {
    const deviceId = newId();
    request.payload = {
      deviceId,
      sessionTokenId: newId(),
      refreshTokenId: newId(),
    };
    devices.destroy = jest.fn(async () => {
      return {
        sessionTokenId: request.payload.sessionTokenId,
        refreshTokenId: newId(),
      };
    });

    await expect(route(request)).rejects.toMatchObject({
      errno: error.ERRNO.INVALID_PARAMETER,
    });

    expect(devices.destroy).toHaveBeenCalledTimes(1);
    expect(devices.destroy).toHaveBeenCalledWith(request, deviceId);
    expect(db.deleteSessionToken).not.toHaveBeenCalled();
  });

  it('can destroy by refreshTokenId', async () => {
    const clientId = newId(16);
    const refreshTokenId = newId();
    request.payload = {
      clientId,
      refreshTokenId,
    };

    const res = await route(request);
    expect(res).toEqual({});

    expect(devices.destroy).not.toHaveBeenCalled();
    expect(db.deleteSessionToken).not.toHaveBeenCalled();
  });

  it('wont accept refreshTokenId and sessionTokenId without deviceId', async () => {
    const clientId = newId(16);
    const refreshTokenId = newId();
    request.payload = {
      clientId,
      refreshTokenId,
      sessionTokenId: newId(),
    };

    await expect(route(request)).rejects.toMatchObject({
      errno: error.ERRNO.INVALID_PARAMETER,
    });

    expect(devices.destroy).not.toHaveBeenCalled();
    expect(db.deleteSessionToken).not.toHaveBeenCalled();
  });

  it('can destroy by just clientId', async () => {
    const clientId = newId(16);
    request.payload = {
      clientId,
    };

    const res = await route(request);
    expect(res).toEqual({});

    expect(devices.destroy).not.toHaveBeenCalled();
    expect(db.deleteSessionToken).not.toHaveBeenCalled();
  });

  it('wont accept clientId and sessionTokenId without deviceId', async () => {
    const clientId = newId(16);
    request.payload = {
      clientId,
      sessionTokenId: newId(),
    };

    await expect(route(request)).rejects.toMatchObject({
      errno: error.ERRNO.INVALID_PARAMETER,
    });

    expect(devices.destroy).not.toHaveBeenCalled();
    expect(db.deleteSessionToken).not.toHaveBeenCalled();
  });

  it('can destroy by sessionTokenId when given the current session', async () => {
    const sessionTokenId = newId(16);
    request.payload = {
      sessionTokenId,
    };
    request.auth.credentials.id = sessionTokenId;

    const res = await route(request);
    expect(res).toEqual({});

    expect(devices.destroy).not.toHaveBeenCalled();
    expect(db.sessionToken).not.toHaveBeenCalled();
    expect(db.deleteSessionToken).toHaveBeenCalledTimes(1);
    expect(db.deleteSessionToken).toHaveBeenCalledWith(
      request.auth.credentials
    );
  });

  it('can destroy by sessionTokenId when given a different session', async () => {
    const sessionTokenId = newId(16);
    request.payload = {
      sessionTokenId,
    };
    db.sessionToken = jest.fn(async () => {
      return { id: sessionTokenId, uid };
    });

    const res = await route(request);
    expect(res).toEqual({});

    expect(devices.destroy).not.toHaveBeenCalled();
    expect(db.sessionToken).toHaveBeenCalledTimes(1);
    expect(db.sessionToken).toHaveBeenCalledWith(sessionTokenId);
    expect(db.deleteSessionToken).toHaveBeenCalledTimes(1);
    expect(db.deleteSessionToken).toHaveBeenCalledWith({
      id: sessionTokenId,
      uid,
    });
  });

  it('errors if the sessionToken does not belong to the current user', async () => {
    const sessionTokenId = newId(16);
    request.payload = {
      sessionTokenId,
    };
    db.sessionToken = jest.fn(async () => {
      return { uid: newId() };
    });

    await expect(route(request)).rejects.toMatchObject({
      errno: error.ERRNO.INVALID_PARAMETER,
    });

    expect(devices.destroy).not.toHaveBeenCalled();
    expect(db.sessionToken).toHaveBeenCalledTimes(1);
    expect(db.sessionToken).toHaveBeenCalledWith(sessionTokenId);
    expect(db.deleteSessionToken).not.toHaveBeenCalled();
  });
});

describe('/account/attached_oauth_clients', () => {
  let config: any, uid: string, log: any, db: any, request: any, route: any;

  beforeEach(() => {
    config = {};
    uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    log = mocks.mockLog();
    db = mocks.mockDB();
    request = mocks.mockRequest({
      credentials: {
        id: crypto.randomBytes(16).toString('hex'),
        uid: uid,
        setUserAgentInfo: jest.fn(() => {}),
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

    mockAuthorizedClients.listUnique = jest.fn(async () => {
      return OAUTH_CLIENTS;
    });

    const result = await route(request);

    expect(mockAuthorizedClients.listUnique).toHaveBeenCalledTimes(1);
    expect(mockAuthorizedClients.listUnique.mock.calls[0][0]).toBe(uid);

    expect(db.touchSessionToken).toHaveBeenCalledTimes(1);
    const args = db.touchSessionToken.mock.calls[0];
    expect(args).toHaveLength(3);
    const laterDate = Date.now() - 60 * 1000;
    expect(laterDate < args[0].lastAccessTime).toBe(true);

    expect(result).toHaveLength(3);

    result.forEach((client: any, idx: number) => {
      expect(client.clientId).toBe(OAUTH_CLIENTS[idx].client_id);
      expect(client.lastAccessTime).toBe(OAUTH_CLIENTS[idx].last_access_time);

      const keys = Object.keys(client);
      expect(keys).toHaveLength(2);
      expect(keys).toContain('clientId');
      expect(keys).toContain('lastAccessTime');
    });

    const clientIds = result.map((c: any) => c.clientId);
    const uniqueClientIds = new Set(clientIds);
    expect(clientIds.length).toBe(uniqueClientIds.size);
  });

  it('returns an empty array when user has no OAuth clients', async () => {
    mockAuthorizedClients.listUnique = jest.fn(async () => {
      return [];
    });

    const result = await route(request);

    expect(mockAuthorizedClients.listUnique).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});
