/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const LIB_DIR = '../../lib';

const { assert } = require('chai');
const mocks = require('../mocks');
const P = require(`${LIB_DIR}/promise`);
const proxyquire = require('proxyquire');
const sinon = require('sinon');

describe('db, session tokens expire:', () => {
  const tokenLifetimes = {
    sessionTokenWithoutDevice: 2419200000,
  };

  let results, pool, log, tokens, db;

  beforeEach(() => {
    results = {};
    pool = {
      get: sinon.spy(() => P.resolve(results.pool)),
      post: sinon.spy(() => P.resolve()),
      put: sinon.spy(() => P.resolve()),
    };
    log = mocks.mockLog();
    tokens = require(`${LIB_DIR}/tokens`)(log, { tokenLifetimes });
    const DB = proxyquire(`${LIB_DIR}/db`, {
      './pool': function () {
        return pool;
      },
    })(
      { tokenLifetimes, tokenPruning: {}, redis: { enabled: true } },
      log,
      tokens,
      {}
    );
    return DB.connect({}).then((result) => (db = result));
  });

  describe('sessions:', () => {
    let sessions;

    beforeEach(() => {
      const now = Date.now();
      results.pool = [
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
      ];
      return db.sessions().then((result) => (sessions = result));
    });

    it('returned the correct result', () => {
      assert(Array.isArray(sessions));
      assert.equal(sessions.length, 3);
      assert.equal(sessions[0].id, 'foo');
      assert.equal(sessions[1].id, 'baz');
      assert.equal(sessions[2].id, 'qux');
    });
  });
});

describe('db, session tokens do not expire:', () => {
  const tokenLifetimes = {
    sessionTokenWithoutDevice: 0,
  };

  let results, pool, log, tokens, db;

  beforeEach(() => {
    results = {};
    pool = {
      get: sinon.spy(() => P.resolve(results.pool)),
      post: sinon.spy(() => P.resolve()),
      put: sinon.spy(() => P.resolve()),
    };
    log = mocks.mockLog();
    tokens = require(`${LIB_DIR}/tokens`)(log, { tokenLifetimes });
    const DB = proxyquire(`${LIB_DIR}/db`, {
      './pool': function () {
        return pool;
      },
    })(
      { tokenLifetimes, tokenPruning: {}, redis: { enabled: true } },
      log,
      tokens,
      {}
    );
    return DB.connect({}).then((result) => (db = result));
  });

  describe('sessions:', () => {
    let sessions;

    beforeEach(() => {
      const now = Date.now();
      results.pool = [
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
      ];
      return db.sessions().then((result) => (sessions = result));
    });

    it('returned the correct result', () => {
      assert.equal(sessions.length, 4);
      assert.equal(sessions[0].id, 'foo');
      assert.equal(sessions[1].id, 'bar');
      assert.equal(sessions[2].id, 'baz');
      assert.equal(sessions[3].id, 'qux');
    });
  });
});

describe('db with redis disabled:', () => {
  const tokenLifetimes = {
    sessionTokenWithoutDevice: 2419200000,
  };

  let results, pool, log, tokens, db;

  beforeEach(() => {
    results = {};
    pool = {
      get: sinon.spy(() => P.resolve(results.pool)),
      post: sinon.spy(() => P.resolve()),
      del: sinon.spy(() => P.resolve()),
      put: sinon.spy(() => P.resolve()),
    };
    log = mocks.mockLog();
    tokens = require(`${LIB_DIR}/tokens`)(log, { tokenLifetimes });
    const DB = proxyquire(`${LIB_DIR}/db`, {
      './pool': function () {
        return pool;
      },
      './redis': () => {},
    })({ redis: {}, tokenLifetimes, tokenPruning: {} }, log, tokens, {});
    return DB.connect({}).then((result) => (db = result));
  });

  it('db.sessions succeeds without a redis instance', () => {
    results.pool = [];
    return db.sessions('fakeUid').then((result) => {
      assert.equal(pool.get.callCount, 1);
      const args = pool.get.args[0];
      assert.equal(args.length, 2);
      assert.equal(typeof args[0].render, 'function');
      assert.equal(args[0].constructor.name, 'SafeUrl');
      assert.deepEqual(args[1], { uid: 'fakeUid' });
      assert.deepEqual(result, []);
    });
  });

  it('db.devices succeeds without a redis instance', () => {
    results.pool = [];
    return db.devices('fakeUid').then((result) => {
      assert.equal(pool.get.callCount, 1);
      const args = pool.get.args[0];
      assert.equal(args.length, 2);
      assert.equal(typeof args[0].render, 'function');
      assert.equal(args[0].constructor.name, 'SafeUrl');
      assert.deepEqual(args[1], { uid: 'fakeUid' });
      assert.deepEqual(result, []);
    });
  });

  it('db.device succeeds without a redis instance', () => {
    results.pool = { id: 'fakeDeviceId' };
    return db.device('fakeUid', 'fakeDeviceId').then((result) => {
      assert.equal(pool.get.callCount, 1);
      const args = pool.get.args[0];
      assert.equal(args.length, 2);
      assert.equal(typeof args[0].render, 'function');
      assert.equal(args[0].constructor.name, 'SafeUrl');
      assert.deepEqual(args[1], { uid: 'fakeUid', deviceId: 'fakeDeviceId' });
      assert.equal(result.id, 'fakeDeviceId');
    });
  });

  it('db.deleteAccount succeeds without a redis instance', () => {
    return db.deleteAccount({ uid: 'fakeUid' }).then(() => {
      assert.equal(pool.del.callCount, 1);
      const args = pool.del.args[0];
      assert.equal(args.length, 2);
      assert.equal(typeof args[0].render, 'function');
      assert.equal(args[0].constructor.name, 'SafeUrl');
      assert.deepEqual(args[1], { uid: 'fakeUid' });
    });
  });

  it('db.deleteSessionToken succeeds without a redis instance', () => {
    return db.deleteSessionToken({ id: 'foo', uid: 'bar' }).then(() => {
      assert.equal(pool.del.callCount, 1);
      const args = pool.del.args[0];
      assert.equal(args.length, 2);
      assert.equal(typeof args[0].render, 'function');
      assert.equal(args[0].constructor.name, 'SafeUrl');
      assert.deepEqual(args[1], { id: 'foo' });
    });
  });

  it('db.deleteDevice succeeds without a redis instance', () => {
    pool.del = sinon.spy(() => P.resolve({}));
    return db.deleteDevice('foo', 'bar').then(() => {
      assert.equal(pool.del.callCount, 1);
      const args = pool.del.args[0];
      assert.equal(args.length, 2);
      assert.equal(typeof args[0].render, 'function');
      assert.equal(args[0].constructor.name, 'SafeUrl');
      assert.deepEqual(args[1], { uid: 'foo', deviceId: 'bar' });
    });
  });

  it('db.resetAccount succeeds without a redis instance', () => {
    const start = Date.now();
    return db.resetAccount({ uid: 'fakeUid' }, {}).then(() => {
      const end = Date.now();
      assert.equal(pool.post.callCount, 1);
      const args = pool.post.args[0];
      assert.equal(args.length, 3);
      assert.equal(typeof args[0].render, 'function');
      assert.equal(args[0].constructor.name, 'SafeUrl');
      assert.deepEqual(args[1], { uid: 'fakeUid' });
      assert.equal(Object.keys(args[2]).length, 1);
      assert.ok(args[2].verifierSetAt >= start);
      assert.ok(args[2].verifierSetAt <= end);
    });
  });

  it('db.touchSessionToken succeeds without a redis instance', () => {
    return db.touchSessionToken({ id: 'foo', uid: 'bar' }).then(() => {
      assert.equal(pool.get.callCount, 0);
      assert.equal(pool.post.callCount, 0);
    });
  });

  it('db.pruneSessionTokens succeeds without a redis instance', () => {
    return db
      .pruneSessionTokens('foo', [{ id: 'bar', createdAt: 1 }])
      .then(() => {
        assert.equal(pool.get.callCount, 0);
        assert.equal(pool.post.callCount, 0);
      });
  });

  it('db.createSessionToken succeeds without a redis instance', () => {
    return db.createSessionToken({ uid: 'foo' }).then(() => {
      assert.equal(pool.put.callCount, 1);
      const args = pool.put.args[0];
      assert.equal(args.length, 3);
      assert.equal(typeof args[0].render, 'function');
      assert.equal(args[0].constructor.name, 'SafeUrl');
      assert.ok(args[1].id);
      assert.equal(args[2].tokenId, args[1].id);
      assert.equal(args[2].uid, 'foo');
    });
  });
});

describe('redis enabled, token-pruning enabled:', () => {
  const tokenLifetimes = {
    sessionTokenWithoutDevice: 2419200000,
  };
  const tokenPruning = {
    enabled: true,
    maxAge: 1000 * 60 * 60 * 24 * 72,
  };

  let pool, redis, log, tokens, db;

  beforeEach(() => {
    pool = {
      get: sinon.spy(() => P.resolve([])),
      post: sinon.spy(() => P.resolve()),
      del: sinon.spy(() => P.resolve()),
      put: sinon.spy(() => P.resolve()),
    };
    redis = {
      get: sinon.spy(() => P.resolve('{}')),
      set: sinon.spy(() => P.resolve()),
      del: sinon.spy(() => P.resolve()),
      getSessionTokens: sinon.spy(() => P.resolve()),
      pruneSessionTokens: sinon.spy(() => P.resolve()),
      touchSessionToken: sinon.spy(() => P.resolve()),
    };
    log = mocks.mockLog();
    tokens = require(`${LIB_DIR}/tokens`)(log, { tokenLifetimes });
    const DB = proxyquire(`${LIB_DIR}/db`, {
      './pool': function () {
        return pool;
      },
      './redis': (...args) => {
        assert.equal(args.length, 2, 'redisPool was passed two arguments');
        assert.equal(args[0].foo, 'bar', 'redisPool was passed config');
        assert.equal(
          args[0].baz,
          'qux',
          'redisPool was passed session token config'
        );
        assert.equal(
          args[0].prefix,
          'wibble',
          'redisPool was passed session token prefix'
        );
        assert.equal(
          args[0].blee,
          undefined,
          'redisPool was not passed email service config'
        );
        assert.equal(args[1], log, 'redisPool was passed log');
        return redis;
      },
    })(
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
    return DB.connect({}).then((result) => (db = result));
  });

  it('should not call redis or the db in db.devices if uid is falsey', () => {
    return db.devices('').then(
      (result) =>
        assert.equal(
          result,
          'db.devices should reject with error.unknownAccount'
        ),
      (err) => {
        assert.equal(pool.get.callCount, 0);
        assert.equal(redis.get.callCount, 0);
        assert.equal(err.errno, 102);
        assert.equal(err.message, 'Unknown account');
      }
    );
  });

  it('should call redis and the db in db.devices if uid is not falsey', () => {
    return db.devices('wibble').then(() => {
      assert.equal(pool.get.callCount, 1);
      assert.equal(redis.getSessionTokens.callCount, 1);
      assert.equal(redis.getSessionTokens.args[0].length, 1);
      assert.equal(redis.getSessionTokens.args[0][0], 'wibble');
    });
  });

  it('should call redis and the db in db.device if uid is not falsey', () => {
    return db.device('wibble', 'wobble').then(() => {
      assert.equal(pool.get.callCount, 1);
      assert.equal(redis.getSessionTokens.callCount, 1);
      assert.equal(redis.getSessionTokens.args[0].length, 1);
      assert.equal(redis.getSessionTokens.args[0][0], 'wibble');
    });
  });

  it('should call redis.getSessionTokens in db.sessions', () => {
    return db.sessions('wibble').then(() => {
      assert.equal(redis.getSessionTokens.callCount, 1);
      assert.equal(redis.getSessionTokens.args[0].length, 1);
      assert.equal(redis.getSessionTokens.args[0][0], 'wibble');

      assert.equal(log.error.callCount, 0);
    });
  });

  it('should call redis.del in db.deleteAccount', () => {
    return db.deleteAccount({ uid: 'wibble' }).then(() => {
      assert.equal(redis.del.callCount, 1);
      assert.equal(redis.del.args[0].length, 1);
      assert.equal(redis.del.args[0][0], 'wibble');
    });
  });

  it('should call redis.del in db.resetAccount', () => {
    return db.resetAccount({ uid: 'wibble' }, {}).then(() => {
      assert.equal(redis.del.callCount, 1);
      assert.equal(redis.del.args[0].length, 1);
      assert.equal(redis.del.args[0][0], 'wibble');
    });
  });

  it('should call redis.touchSessionToken in db.touchSessionToken', () => {
    return db.touchSessionToken({ id: 'wibble', uid: 'blee' }).then(() => {
      assert.equal(redis.touchSessionToken.callCount, 1);
      assert.equal(redis.touchSessionToken.args[0].length, 2);
      assert.equal(redis.touchSessionToken.args[0][0], 'blee');
    });
  });

  it('should call redis.pruneSessionTokens in db.pruneSessionTokens', () => {
    const createdAt = Date.now() - tokenPruning.maxAge - 1;
    return db
      .pruneSessionTokens('foo', [
        { id: 'bar', createdAt },
        { id: 'baz', createdAt },
      ])
      .then(() => {
        assert.equal(redis.pruneSessionTokens.callCount, 1);
        assert.equal(redis.pruneSessionTokens.args[0].length, 2);
        assert.equal(redis.pruneSessionTokens.args[0][0], 'foo');
      });
  });

  it('should not call redis.pruneSessionTokens for unexpired tokens in db.pruneSessionTokens', () => {
    const createdAt = Date.now() - tokenPruning.maxAge + 1000;
    return db
      .pruneSessionTokens('foo', [
        { id: 'bar', createdAt },
        { id: 'baz', createdAt },
      ])
      .then(() => assert.equal(redis.pruneSessionTokens.callCount, 0));
  });

  it('should call redis.pruneSessionTokens in db.deleteSessionToken', () => {
    return db.deleteSessionToken({ id: 'wibble', uid: 'blee' }).then(() => {
      assert.equal(redis.pruneSessionTokens.callCount, 1);
      assert.equal(redis.pruneSessionTokens.args[0].length, 2);
      assert.equal(redis.pruneSessionTokens.args[0][0], 'blee');
    });
  });

  it('should call redis.pruneSessionTokens in db.deleteDevice', () => {
    pool.del = sinon.spy(() => P.resolve({}));
    return db.deleteDevice('wibble', 'blee').then(() => {
      assert.equal(redis.pruneSessionTokens.callCount, 1);
      assert.equal(redis.pruneSessionTokens.args[0].length, 2);
      assert.equal(redis.pruneSessionTokens.args[0][0], 'wibble');
    });
  });

  it('should call redis.pruneSessionTokens in db.createSessionToken', () => {
    return db.createSessionToken({ uid: 'wibble' }).then(() => {
      assert.equal(redis.pruneSessionTokens.callCount, 1);
      assert.equal(redis.pruneSessionTokens.args[0].length, 2);
      assert.equal(redis.pruneSessionTokens.args[0][0], 'wibble');
    });
  });

  describe('mock db.pruneSessionTokens:', () => {
    beforeEach(() => {
      db.pruneSessionTokens = sinon.spy(() => P.resolve());
    });

    describe('return expired tokens from pool.get:', () => {
      beforeEach(() => {
        const expiryPoint =
          Date.now() - tokenLifetimes.sessionTokenWithoutDevice;
        pool.get = sinon.spy(() =>
          P.resolve([
            { tokenId: 'unexpired', createdAt: expiryPoint + 1000 },
            { tokenId: 'expired1', createdAt: expiryPoint - 1 },
            { tokenId: 'expired2', createdAt: 1 },
          ])
        );
      });

      it('should call pruneSessionTokens in db.sessions', () => {
        return db.sessions('foo').then((result) => {
          assert.equal(result.length, 1);
          assert.equal(result[0].id, 'unexpired');

          assert.equal(db.pruneSessionTokens.callCount, 1);
          const args = db.pruneSessionTokens.args[0];
          assert.equal(args.length, 2);
          assert.equal(args[0], 'foo');
          assert.ok(Array.isArray(args[1]));
          assert.equal(args[1].length, 2);
          assert.equal(args[1][0].id, 'expired1');
          assert.equal(args[1][1].id, 'expired2');
        });
      });
    });

    describe('return unexpired tokens from pool.get:', () => {
      beforeEach(() => {
        const expiryPoint =
          Date.now() - tokenLifetimes.sessionTokenWithoutDevice;
        pool.get = sinon.spy(() =>
          P.resolve([
            { tokenId: 'unexpired1', createdAt: expiryPoint + 1000 },
            { tokenId: 'unexpired2', createdAt: expiryPoint + 100000 },
            { tokenId: 'unexpired3', createdAt: expiryPoint + 10000000 },
          ])
        );
      });

      it('should not call pruneSessionTokens in db.sessions', () => {
        return db.sessions('foo').then((result) => {
          assert.equal(result.length, 3);
          assert.equal(db.pruneSessionTokens.callCount, 0);
        });
      });
    });
  });
});

describe('redis enabled, token-pruning disabled:', () => {
  const tokenLifetimes = {
    sessionTokenWithoutDevice: 2419200000,
  };

  let pool, redis, log, tokens, db;

  beforeEach(() => {
    pool = {
      get: sinon.spy(() => P.resolve([])),
      post: sinon.spy(() => P.resolve()),
      del: sinon.spy(() => P.resolve()),
    };
    redis = {
      get: sinon.spy(() => P.resolve('{}')),
      set: sinon.spy(() => P.resolve()),
      del: sinon.spy(() => P.resolve()),
      pruneSessionTokens: sinon.spy(() => P.resolve()),
    };
    log = mocks.mockLog();
    tokens = require(`${LIB_DIR}/tokens`)(log, { tokenLifetimes });
    const DB = proxyquire(`${LIB_DIR}/db`, {
      './pool': function () {
        return pool;
      },
      './redis': (...args) => {
        assert.equal(args.length, 2, 'redisPool was passed two arguments');
        assert.equal(args[0].foo, 'bar', 'redisPool was passed config');
        assert.equal(
          args[0].baz,
          'qux',
          'redisPool was passed session token config'
        );
        assert.equal(
          args[0].prefix,
          'wibble',
          'redisPool was passed session token prefix'
        );
        assert.equal(
          args[0].blee,
          undefined,
          'redisPool was not passed email service config'
        );
        assert.equal(args[1], log, 'redisPool was passed log');
        return redis;
      },
    })(
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
    return DB.connect({}).then((result) => (db = result));
  });

  it('should not call redis.pruneSessionTokens in db.pruneSessionTokens', () => {
    return db
      .pruneSessionTokens('wibble', [{ id: 'blee', createdAt: 1 }])
      .then(() => assert.equal(redis.pruneSessionTokens.callCount, 0));
  });
});
