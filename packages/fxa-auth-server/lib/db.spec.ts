/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Mock fxa-shared/db to prevent real DB connections
jest.mock('fxa-shared/db', () => ({
  setupAuthDatabase: jest.fn(),
}));

// Mock fxa-shared/db/models/auth - defined inline to avoid TDZ issues with jest.mock hoisting
jest.mock('fxa-shared/db/models/auth', () => ({
  Device: {
    delete: jest
      .fn()
      .mockResolvedValue({ sessionTokenId: 'fakeSessionTokenId' }),
    findByPrimaryKey: jest.fn().mockResolvedValue({ id: 'fakeDeviceId' }),
    findByUid: jest.fn().mockResolvedValue([]),
    findByUidAndRefreshTokenId: jest.fn(),
  },
  SessionToken: {
    create: jest.fn().mockResolvedValue(null),
    delete: jest.fn().mockResolvedValue(null),
    findByUid: jest.fn().mockResolvedValue([]),
  },
  Account: {
    delete: jest.fn().mockResolvedValue(null),
    reset: jest.fn().mockResolvedValue(null),
  },
}));

// Configurable redis mock - default returns undefined (disabled)
let redisMockFactory: any = () => undefined;
jest.mock('./redis', () => {
  return (...args: any[]) => redisMockFactory(...args);
});

// Configurable features mock
let featuresMockFactory: any;
jest.mock('./features', () => {
  return (...args: any[]) => {
    if (featuresMockFactory) return featuresMockFactory(...args);
    return { isLastAccessTimeEnabledForUser: () => true };
  };
});

// Configurable connected-services mock
const actualConnectedServices = jest.requireActual(
  'fxa-shared/connected-services'
);
let connectedServicesMock: any = actualConnectedServices;
jest.mock('fxa-shared/connected-services', () => {
  return new Proxy(
    {},
    {
      get: (_target, prop) => connectedServicesMock[prop],
    }
  );
});

// Import after mocks
const mocks = require('../test/mocks');
const config = require('../config').default.getProperties();
const models: any = require('fxa-shared/db/models/auth');
const { createDB } = require('./db');

describe('db, session tokens expire:', () => {
  const tokenLifetimes = {
    sessionTokenWithoutDevice: 2419200000,
  };

  let log: any, tokens: any, db: any;

  beforeEach(async () => {
    redisMockFactory = () => undefined;
    log = mocks.mockLog();
    tokens = require('../lib/tokens')(log, { tokenLifetimes });
    const DB = createDB(
      {
        tokenLifetimes,
        tokenPruning: {},
        redis: { ...config.redis, enabled: true },
      },
      log,
      tokens,
      {}
    );
    db = await DB.connect({});
  });

  describe('sessions:', () => {
    let sessions: any;

    beforeEach(async () => {
      const now = Date.now();
      models.SessionToken.findByUid = jest.fn().mockResolvedValue([
        { createdAt: now, tokenId: 'foo' },
        {
          createdAt: now - tokenLifetimes.sessionTokenWithoutDevice - 1,
          tokenId: 'bar',
        },
        {
          createdAt: now - tokenLifetimes.sessionTokenWithoutDevice + 1000,
          tokenId: 'baz',
        },
        {
          createdAt: now - tokenLifetimes.sessionTokenWithoutDevice - 1,
          tokenId: 'qux',
          deviceId: 'wibble',
        },
      ]);
      sessions = await db.sessions();
    });

    it('returned the correct result', () => {
      expect(Array.isArray(sessions)).toBe(true);
      expect(sessions).toHaveLength(3);
      expect(sessions[0].id).toBe('foo');
      expect(sessions[1].id).toBe('baz');
      expect(sessions[2].id).toBe('qux');
    });
  });
});

describe('db, session tokens do not expire:', () => {
  const tokenLifetimes = {
    sessionTokenWithoutDevice: 0,
  };

  let log: any, tokens: any, db: any;

  beforeEach(async () => {
    redisMockFactory = () => undefined;
    log = mocks.mockLog();
    tokens = require('../lib/tokens')(log, { tokenLifetimes });
    const DB = createDB(
      {
        tokenLifetimes,
        tokenPruning: {},
        redis: { ...config.redis, enabled: true },
      },
      log,
      tokens,
      {}
    );
    db = await DB.connect({});
  });

  describe('sessions:', () => {
    let sessions: any;

    beforeEach(async () => {
      const now = Date.now();
      models.SessionToken.findByUid = jest.fn().mockResolvedValue([
        { createdAt: now, tokenId: 'foo' },
        {
          createdAt: now - tokenLifetimes.sessionTokenWithoutDevice - 1,
          tokenId: 'bar',
        },
        {
          createdAt: now - tokenLifetimes.sessionTokenWithoutDevice + 1000,
          tokenId: 'baz',
        },
        {
          createdAt: now - tokenLifetimes.sessionTokenWithoutDevice - 1,
          tokenId: 'qux',
          deviceId: 'wibble',
        },
      ]);
      sessions = await db.sessions();
    });

    it('returned the correct result', () => {
      expect(sessions).toHaveLength(4);
      expect(sessions[0].id).toBe('foo');
      expect(sessions[1].id).toBe('bar');
      expect(sessions[2].id).toBe('baz');
      expect(sessions[3].id).toBe('qux');
    });
  });
});

describe('db with redis disabled:', () => {
  const tokenLifetimes = {
    sessionTokenWithoutDevice: 2419200000,
  };

  let log: any, tokens: any, db: any;

  beforeEach(async () => {
    redisMockFactory = () => undefined;
    log = mocks.mockLog();
    tokens = require('../lib/tokens')(log, { tokenLifetimes });
    const DB = createDB(
      { redis: {}, tokenLifetimes, tokenPruning: {} },
      log,
      tokens,
      {}
    );
    db = await DB.connect({});
  });

  it('db.sessions succeeds without a redis instance', async () => {
    models.SessionToken.findByUid = jest.fn().mockResolvedValue([]);
    const result = await db.sessions('fakeUid');
    expect(result).toEqual([]);
  });

  it('db.device succeeds without a redis instance', async () => {
    const result = await db.device('fakeUid', 'fakeDeviceId');
    expect(result.id).toBe('fakeDeviceId');
  });

  it('db.touchSessionToken succeeds without a redis instance', async () => {
    await db.touchSessionToken({ id: 'foo', uid: 'bar' });
  });

  it('db.pruneSessionTokens succeeds without a redis instance', async () => {
    await db.pruneSessionTokens('foo', [{ id: 'bar', createdAt: 1 }]);
  });
});

describe('redis enabled, token-pruning enabled:', () => {
  const tokenLifetimes = {
    sessionTokenWithoutDevice: 2419200000,
  };
  const tokenPruning = {
    enabled: true,
    maxAge: 1000 * 60 * 60 * 24 * 72,
    codeMaxAge: 1000 * 60 * 60 * 24 * 72,
  };

  let redis: any, log: any, tokens: any, db: any;

  beforeEach(async () => {
    redis = {
      get: jest.fn(() => Promise.resolve('{}')),
      set: jest.fn(() => Promise.resolve()),
      del: jest.fn(() => Promise.resolve()),
      getSessionTokens: jest.fn(() => Promise.resolve()),
      pruneSessionTokens: jest.fn(() => Promise.resolve()),
      touchSessionToken: jest.fn(() => Promise.resolve()),
    };
    redisMockFactory = (...args: any[]) => {
      expect(args).toHaveLength(2);
      expect(args[0].foo).toBe('bar');
      expect(args[0].baz).toBe('qux');
      expect(args[0].prefix).toBe('wibble');
      expect(args[0].blee).toBeUndefined();
      return redis;
    };
    log = mocks.mockLog();
    tokens = require('../lib/tokens')(log, { tokenLifetimes });
    const DB = createDB(
      {
        tokenLifetimes,
        tokenPruning,
        redis: {
          foo: 'bar',
          sessionTokens: {
            baz: 'qux',
            prefix: 'wibble',
          },
          email: {
            blee: 'blee',
            prefix: 'blee',
          },
        },
        lastAccessTimeUpdates: {
          enabled: true,
          sampleRate: 1,
          earliestSaneTimestamp: 1,
        },
      },
      log,
      tokens,
      {}
    );

    db = await DB.connect({});
  });

  it('should not call redis or the db in db.devices if uid is falsey', async () => {
    try {
      await db.devices('');
      throw new Error('db.devices should reject with error.unknownAccount');
    } catch (err: any) {
      expect(err.errno).toBe(102);
      expect(err.message).toBe('Unknown account');
    }
  });

  it('should call redis and the db in db.devices if uid is not falsey', async () => {
    models.Device.findByUid = jest.fn().mockResolvedValue([]);
    await db.devices('wibble');
    expect(models.Device.findByUid).toHaveBeenCalledTimes(1);
    expect(redis.getSessionTokens).toHaveBeenCalledTimes(1);
    expect(redis.getSessionTokens).toHaveBeenCalledWith('wibble');
  });

  it('should call redis and the db in db.device if uid is not falsey', async () => {
    models.Device.findByPrimaryKey = jest.fn().mockResolvedValue({});
    await db.device('wibble', 'wobble');
    expect(models.Device.findByPrimaryKey).toHaveBeenCalledTimes(1);
    expect(redis.getSessionTokens).toHaveBeenCalledTimes(1);
    expect(redis.getSessionTokens).toHaveBeenCalledWith('wibble');
  });

  it('should call redis.getSessionTokens in db.sessions', async () => {
    models.SessionToken.findByUid = jest.fn().mockResolvedValue([]);
    await db.sessions('wibble');
    expect(models.SessionToken.findByUid).toHaveBeenCalledTimes(1);
    expect(redis.getSessionTokens).toHaveBeenCalledTimes(1);
    expect(redis.getSessionTokens).toHaveBeenCalledWith('wibble');

    expect(log.error).toHaveBeenCalledTimes(0);
  });

  it('should call redis.del in db.deleteAccount', async () => {
    await db.deleteAccount({ uid: 'wibble' });
    expect(redis.del).toHaveBeenCalledTimes(1);
    expect(redis.del).toHaveBeenCalledWith('wibble');
  });

  it('should call redis.del in db.resetAccount', async () => {
    await db.resetAccount({ uid: 'wibble' }, {});
    expect(redis.del).toHaveBeenCalledTimes(1);
    expect(redis.del).toHaveBeenCalledWith('wibble');
  });

  it('should call redis.touchSessionToken in db.touchSessionToken', async () => {
    await db.touchSessionToken({ id: 'wibble', uid: 'blee' });
    expect(redis.touchSessionToken).toHaveBeenCalledTimes(1);
    expect(redis.touchSessionToken).toHaveBeenCalledWith(
      'blee',
      expect.anything()
    );
  });

  it('should call redis.pruneSessionTokens in db.pruneSessionTokens', async () => {
    const createdAt = Date.now() - tokenPruning.maxAge - 1;
    await db.pruneSessionTokens('foo', [
      { id: 'bar', createdAt },
      { id: 'baz', createdAt },
    ]);
    expect(redis.pruneSessionTokens).toHaveBeenCalledTimes(1);
    expect(redis.pruneSessionTokens).toHaveBeenCalledWith(
      'foo',
      expect.anything()
    );
  });

  it('should not call redis.pruneSessionTokens for unexpired tokens in db.pruneSessionTokens', async () => {
    const createdAt = Date.now() - tokenPruning.maxAge + 1000;
    await db.pruneSessionTokens('foo', [
      { id: 'bar', createdAt },
      { id: 'baz', createdAt },
    ]);
    expect(redis.pruneSessionTokens).toHaveBeenCalledTimes(0);
  });

  it('should call redis.pruneSessionTokens in db.deleteSessionToken', async () => {
    await db.deleteSessionToken({ id: 'wibble', uid: 'blee' });
    expect(redis.pruneSessionTokens).toHaveBeenCalledTimes(1);
    expect(redis.pruneSessionTokens).toHaveBeenCalledWith(
      'blee',
      expect.anything()
    );
  });

  it('should call redis.pruneSessionTokens in db.deleteDevice', async () => {
    await db.deleteDevice('wibble', 'blee');
    expect(redis.pruneSessionTokens).toHaveBeenCalledTimes(1);
    expect(redis.pruneSessionTokens).toHaveBeenCalledWith(
      'wibble',
      expect.anything()
    );
  });

  it('should call redis.pruneSessionTokens in db.createSessionToken', async () => {
    await db.createSessionToken({ uid: 'wibble' });
    expect(redis.pruneSessionTokens).toHaveBeenCalledTimes(1);
    expect(redis.pruneSessionTokens).toHaveBeenCalledWith(
      'wibble',
      expect.anything()
    );
  });

  describe('mock db.pruneSessionTokens:', () => {
    beforeEach(() => {
      db.pruneSessionTokens = jest.fn(() => Promise.resolve());
    });

    describe('with expired tokens from SessionToken.findByUid:', () => {
      beforeEach(() => {
        const expiryPoint =
          Date.now() - tokenLifetimes.sessionTokenWithoutDevice;
        models.SessionToken.findByUid = jest.fn().mockResolvedValue([
          { tokenId: 'unexpired', createdAt: expiryPoint + 1000 },
          { tokenId: 'expired1', createdAt: expiryPoint - 1 },
          { tokenId: 'expired2', createdAt: 1 },
        ]);
      });

      it('should call pruneSessionTokens in db.sessions', async () => {
        const result = await db.sessions('foo');
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('unexpired');

        expect(db.pruneSessionTokens).toHaveBeenCalledTimes(1);
        const args = db.pruneSessionTokens.mock.calls[0];
        expect(args).toHaveLength(2);
        expect(args[0]).toBe('foo');
        expect(Array.isArray(args[1])).toBe(true);
        expect(args[1]).toHaveLength(2);
        expect(args[1][0].id).toBe('expired1');
        expect(args[1][1].id).toBe('expired2');
      });
    });

    describe('with unexpired tokens from SessionToken.findByUid:', () => {
      beforeEach(() => {
        const expiryPoint =
          Date.now() - tokenLifetimes.sessionTokenWithoutDevice;
        models.SessionToken.findByUid = jest.fn().mockResolvedValue([
          { tokenId: 'unexpired1', createdAt: expiryPoint + 1000 },
          { tokenId: 'unexpired2', createdAt: expiryPoint + 100000 },
          { tokenId: 'unexpired3', createdAt: expiryPoint + 10000000 },
        ]);
      });

      it('should not call pruneSessionTokens in db.sessions', async () => {
        const result = await db.sessions('foo');
        expect(result).toHaveLength(3);
        expect(db.pruneSessionTokens).toHaveBeenCalledTimes(0);
      });
    });
  });
});

describe('redis enabled, token-pruning disabled:', () => {
  const tokenLifetimes = {
    sessionTokenWithoutDevice: 2419200000,
  };

  let redis: any, log: any, tokens: any, db: any;

  beforeEach(async () => {
    redis = {
      get: jest.fn(() => Promise.resolve('{}')),
      set: jest.fn(() => Promise.resolve()),
      del: jest.fn(() => Promise.resolve()),
      pruneSessionTokens: jest.fn(() => Promise.resolve()),
    };
    redisMockFactory = (...args: any[]) => {
      expect(args).toHaveLength(2);
      expect(args[0].foo).toBe('bar');
      expect(args[0].baz).toBe('qux');
      expect(args[0].prefix).toBe('wibble');
      expect(args[0].blee).toBeUndefined();
      return redis;
    };
    log = mocks.mockLog();
    tokens = require('../lib/tokens')(log, { tokenLifetimes });
    const DB = createDB(
      {
        tokenLifetimes,
        tokenPruning: {
          enabled: false,
        },
        redis: {
          foo: 'bar',
          sessionTokens: {
            baz: 'qux',
            prefix: 'wibble',
          },
          email: {
            blee: 'blee',
            prefix: 'blee',
          },
        },
        lastAccessTimeUpdates: {
          enabled: true,
          sampleRate: 1,
          earliestSaneTimestamp: 1,
        },
      },
      log,
      tokens,
      {}
    );
    db = await DB.connect({});
  });

  it('should not call redis.pruneSessionTokens in db.pruneSessionTokens', async () => {
    await db.pruneSessionTokens('wibble', [{ id: 'blee', createdAt: 1 }]);
    expect(redis.pruneSessionTokens).toHaveBeenCalledTimes(0);
  });
});

describe('db.deviceFromRefreshTokenId:', () => {
  const tokenLifetimes = {
    sessionTokenWithoutDevice: 2419200000,
  };

  let log: any,
    tokens: any,
    db: any,
    features: any,
    mergeDevicesAndSessionTokens: jest.Mock;

  beforeEach(async () => {
    log = mocks.mockLog();
    tokens = require('../lib/tokens')(log, { tokenLifetimes });

    models.Device.findByUidAndRefreshTokenId = jest.fn();

    features = {
      isLastAccessTimeEnabledForUser: jest.fn().mockReturnValue(false),
    };
    featuresMockFactory = () => features;

    mergeDevicesAndSessionTokens = jest.fn();
    connectedServicesMock = {
      mergeDevicesAndSessionTokens,
      filterExpiredTokens: () => [],
      mergeCachedSessionTokens: () => [],
      mergeDeviceAndSessionToken: () => ({}),
    };

    redisMockFactory = () => undefined;

    const DB = createDB(
      {
        tokenLifetimes,
        tokenPruning: {},
        redis: { ...config.redis, enabled: false },
      },
      log,
      tokens,
      {}
    );
    db = await DB.connect({});
  });

  afterEach(() => {
    connectedServicesMock = actualConnectedServices;
    featuresMockFactory = undefined;
  });

  it('should return normalized device when device is found', async () => {
    const uid = 'test-uid';
    const refreshTokenId = 'test-refresh-token-id';
    const mockDevice = {
      id: 'device-id',
      uid,
      refreshTokenId,
      name: 'Test Device',
      type: 'mobile',
      createdAt: Date.now(),
    };
    const mockNormalizedDevice = {
      id: 'device-id',
      refreshTokenId,
      name: 'Test Device',
      type: 'mobile',
      createdAt: mockDevice.createdAt,
      availableCommands: {},
    };
    const metrics = {
      increment: jest.fn(),
    };
    db.metrics = metrics;

    models.Device.findByUidAndRefreshTokenId.mockResolvedValue(mockDevice);
    features.isLastAccessTimeEnabledForUser.mockReturnValue(false);
    mergeDevicesAndSessionTokens.mockReturnValue([mockNormalizedDevice]);

    const result = await db.deviceFromRefreshTokenId(uid, refreshTokenId);

    expect(models.Device.findByUidAndRefreshTokenId).toHaveBeenCalledTimes(1);
    expect(models.Device.findByUidAndRefreshTokenId).toHaveBeenCalledWith(
      uid,
      refreshTokenId
    );
    expect(features.isLastAccessTimeEnabledForUser).toHaveBeenCalledTimes(1);
    expect(features.isLastAccessTimeEnabledForUser).toHaveBeenCalledWith(uid);
    expect(mergeDevicesAndSessionTokens).toHaveBeenCalledTimes(1);
    expect(mergeDevicesAndSessionTokens).toHaveBeenCalledWith(
      [mockDevice],
      {},
      false
    );
    expect(result).toEqual(mockNormalizedDevice);
    // metrics
    expect(metrics.increment).toHaveBeenCalledTimes(1);
    expect(metrics.increment).toHaveBeenCalledWith(
      'db.deviceFromRefreshTokenId.retrieve',
      { result: 'success' }
    );
  });

  it('should return normalized device with lastAccessTime when feature is enabled', async () => {
    const uid = 'test-uid';
    const refreshTokenId = 'test-refresh-token-id';
    const mockDevice = {
      id: 'device-id',
      uid,
      refreshTokenId,
      name: 'Test Device',
      type: 'mobile',
      createdAt: Date.now(),
    };
    const mockNormalizedDevice = {
      id: 'device-id',
      refreshTokenId,
      name: 'Test Device',
      type: 'mobile',
      createdAt: mockDevice.createdAt,
      lastAccessTime: Date.now(),
      availableCommands: {},
    };

    models.Device.findByUidAndRefreshTokenId.mockResolvedValue(mockDevice);
    features.isLastAccessTimeEnabledForUser.mockReturnValue(true);
    mergeDevicesAndSessionTokens.mockReturnValue([mockNormalizedDevice]);

    const result = await db.deviceFromRefreshTokenId(uid, refreshTokenId);

    expect(mergeDevicesAndSessionTokens).toHaveBeenCalledTimes(1);
    expect(mergeDevicesAndSessionTokens).toHaveBeenCalledWith(
      [mockDevice],
      {},
      true
    );
    expect(result).toEqual(mockNormalizedDevice);
  });

  it('should return null and increment metrics when device is not found', async () => {
    const uid = 'test-uid';
    const refreshTokenId = 'test-refresh-token-id';
    const metrics = {
      increment: jest.fn(),
    };
    db.metrics = metrics;

    models.Device.findByUidAndRefreshTokenId.mockResolvedValue(null);

    const result = await db.deviceFromRefreshTokenId(uid, refreshTokenId);
    expect(result).toBeNull();
    expect(metrics.increment).toHaveBeenCalledTimes(1);
    expect(metrics.increment).toHaveBeenCalledWith(
      'db.deviceFromRefreshTokenId.retrieve',
      { result: 'notFound' }
    );
  });

  it('should not increment metrics when metrics is not available', async () => {
    const uid = 'test-uid';
    const refreshTokenId = 'test-refresh-token-id';

    db.metrics = undefined;
    models.Device.findByUidAndRefreshTokenId.mockResolvedValue(null);

    const result = await db.deviceFromRefreshTokenId(uid, refreshTokenId);
    // basically, just make sure it doesn't blow up without metrics
    expect(result).toBeNull();
  });
});
