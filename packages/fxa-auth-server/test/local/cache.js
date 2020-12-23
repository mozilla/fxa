/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

const { assert } = require('chai');
const crypto = require('crypto');
const Memcached = require('memcached');
const mocks = require('../mocks');
const sinon = require('sinon');

const modulePath = `${ROOT_DIR}/lib/cache`;

describe('cache:', () => {
  let sandbox, log, cache, token, digest;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    log = mocks.mockLog();
    cache = require(modulePath)(
      log,
      {
        memcached: {
          address: 'localhost:1121',
          idle: 500,
          lifetime: 30,
        },
      },
      'wibble'
    );
    token = {
      uid: Buffer.alloc(32, 'cd'),
      id: 'deadbeef',
    };
    const hash = crypto.createHash('sha256');
    hash.update(token.uid);
    hash.update(token.id);
    digest = hash.digest('base64');
  });

  afterEach(() => sandbox.restore());

  it('exports the correct interface', () => {
    assert.ok(cache);
    assert.equal(typeof cache, 'object');
    assert.equal(Object.keys(cache).length, 3);
    assert.equal(typeof cache.add, 'function');
    assert.equal(cache.add.length, 2);
    assert.equal(typeof cache.del, 'function');
    assert.equal(cache.del.length, 1);
    assert.equal(typeof cache.get, 'function');
    assert.equal(cache.get.length, 1);
  });

  describe('memcached resolves:', () => {
    beforeEach(() => {
      sandbox
        .stub(Memcached.prototype, 'get')
        .callsArgWith(1, null, 'mock get result');
    });

    describe('get:', () => {
      let result;

      beforeEach(() => {
        return cache.get(digest).then((r) => (result = r));
      });

      it('returns the correct result', () => {
        assert.equal(result, 'mock get result');
      });
    });
  });

  describe('memcached rejects:', () => {
    beforeEach(() => {
      sandbox.stub(Memcached.prototype, 'add').callsArgWith(3, 'foo');
      sandbox.stub(Memcached.prototype, 'del').callsArgWith(1, 'bar');
      sandbox.stub(Memcached.prototype, 'get').callsArgWith(1, 'baz');
    });

    describe('add:', () => {
      let error;

      beforeEach(() => {
        return cache.add(digest, 'wibble').catch((e) => (error = e));
      });

      it('propagates the error', () => {
        assert.equal(error, 'foo');
      });
    });

    describe('del:', () => {
      let error;

      beforeEach(() => {
        return cache.del(digest).catch((e) => (error = e));
      });

      it('propagates the error', () => {
        assert.equal(error, 'bar');
      });
    });

    describe('get:', () => {
      let error;

      beforeEach(() => {
        return cache.get(digest).catch((e) => (error = e));
      });

      it('propagates the error', () => {
        assert.equal(error, 'baz');
      });
    });
  });
});

describe('null cache:', () => {
  let sandbox, log, cache, token;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    log = mocks.mockLog();
    cache = require(modulePath)(
      log,
      {
        memcached: {
          address: 'none',
          idle: 500,
          lifetime: 30,
        },
      },
      'wibble'
    );
    token = {
      uid: Buffer.alloc(32, 'cd'),
      id: 'deadbeef',
    };
    sandbox.stub(Memcached.prototype, 'add').callsArgWith(3, null, null);
    sandbox.stub(Memcached.prototype, 'del').callsArgWith(1, null, null);
    sandbox
      .stub(Memcached.prototype, 'get')
      .callsArgWith(1, null, 'mock get result');
  });

  afterEach(() => sandbox.restore());

  describe('add:', () => {
    beforeEach(() => {
      return cache.add(token, {});
    });

    it('did not call memcached.add', () => {
      assert.equal(Memcached.prototype.add.callCount, 0);
    });
  });

  describe('del:', () => {
    beforeEach(() => {
      return cache.del(token);
    });

    it('did not call memcached.del', () => {
      assert.equal(Memcached.prototype.del.callCount, 0);
    });
  });

  describe('get:', () => {
    beforeEach(() => {
      return cache.get(token);
    });

    it('did not call memcached.get', () => {
      assert.equal(Memcached.prototype.get.callCount, 0);
    });
  });
});
