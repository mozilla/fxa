/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

const { assert } = require('chai');
const config = require(`${ROOT_DIR}/config`).getProperties();
const P = require(`${ROOT_DIR}/lib/promise`);

const log = { info() {}, warn() {}, error() {} };

const redis = require(`${ROOT_DIR}/lib/redis`)(
  {
    enabled: true,
    ...config.redis,
    ...config.redis.sessionTokens,
  },
  log
);

describe('redis.set:', () => {
  before(() => {
    return redis.set('foo', 'bar');
  });

  it('redis.get reads data', () => {
    return P.all([redis.get('foo'), redis.get('foo')]).then(results =>
      results.forEach(result => assert.equal(result, 'bar'))
    );
  });
});

describe('concurrent sets:', () => {
  before(() => {
    return P.all([redis.set('foo', '1'), redis.set('foo', '2')]);
  });

  it('data was set', () => {
    return redis
      .get('foo')
      .then(result => assert.ok(result === '1' || result === '2'));
  });
});

describe('redis.del:', () => {
  before(() => {
    return redis.del('foo');
  });

  it('data was deleted', () => {
    return redis.get('foo').then(result => assert.ok(result === null));
  });
});

describe('redis.update:', () => {
  before(() => {
    return redis
      .set('foo', 'bar')
      .then(() => redis.update('foo', oldValue => `${oldValue}2`));
  });

  it('data was set', () => {
    return redis.get('foo').then(result => assert.equal(result, 'bar2'));
  });
});

describe('update non-existent key:', () => {
  before(() => {
    return redis.del('wibble').then(() => redis.update('wibble', () => 'blee'));
  });

  it('data was set', () => {
    return redis.get('wibble').then(result => assert.equal(result, 'blee'));
  });
});

describe('update existing key to falsey value:', () => {
  before(() => {
    return redis.update('wibble', () => '');
  });

  it('data was deleted', () => {
    return redis.get('wibble').then(result => assert.ok(result === null));
  });
});

describe('concurrent updates of the same key:', () => {
  const errors = [];
  let winner;

  before(() => {
    let resolve,
      sum = 0;
    const synchronisationPromise = new P(r => (resolve = r));

    return P.all(
      [1, 2].map(value => {
        return redis
          .update('foo', createUpdateHandler(value))
          .then(() => (winner = value))
          .catch(error => errors.push(error));
      })
    );

    function createUpdateHandler(value) {
      return () => {
        sum += value;
        if (sum === 3) {
          resolve();
        }
        return synchronisationPromise.then(() => value);
      };
    }
  });

  it('one update failed', () => {
    assert.equal(errors.length, 1);
    assert.equal(
      errors[0].message,
      'Redis WATCH detected a conflicting update'
    );
    assert.equal(errors[0].errno, 165);
  });

  it('the other update completed successfully', () => {
    return redis.get('foo').then(result => assert.equal(result, winner));
  });
});

describe('concurrent updates of different keys:', () => {
  before(() => {
    let resolve,
      values = '';
    const synchronisationPromise = new P(r => (resolve = r));

    return P.all([
      redis.update('foo', createUpdateHandler('bar')),
      redis.update('baz', createUpdateHandler('qux')),
    ]);

    function createUpdateHandler(value) {
      return () => {
        values += value;
        if (values.length === 6) {
          resolve();
        }
        return synchronisationPromise.then(() => value);
      };
    }
  });

  it('first update completed successfully', () => {
    return redis.get('foo').then(result => assert.equal(result, 'bar'));
  });

  it('second update completed successfully', () => {
    return redis.get('baz').then(result => assert.equal(result, 'qux'));
  });
});

describe('reentrant updates of different keys:', () => {
  let error;

  before(() => {
    const { pool: redisPool } = require('../../../fxa-shared/redis/pool')(
      {
        ...config.redis,
        ...config.redis.sessionTokens,
      },
      log
    );
    const redisConnection = redisPool.acquire();
    return P.using(redisConnection, connection =>
      connection.update('foo', oldFoo => {
        return connection
          .update('baz', oldBaz => `${oldBaz}2`)
          .catch(e => (error = e))
          .then(() => `${oldFoo}2`);
      })
    );
  });

  it('first update completed successfully', () => {
    return redis.get('foo').then(result => assert.equal(result, 'bar2'));
  });

  it('second update failed', () => {
    assert.instanceOf(error, Error);
    assert.equal(error.message, 'redis.update.conflict');
    return redis.get('baz').then(result => assert.equal(result, 'qux'));
  });
});

describe('set concurrently with update:', () => {
  let error;

  before(() => {
    return redis
      .update('foo', () => redis.set('foo', 'blee').then(() => 'wibble'))
      .catch(e => (error = e));
  });

  it('update failed', () => {
    assert.ok(error);
    assert.equal(error.message, 'Redis WATCH detected a conflicting update');
    assert.equal(error.errno, 165);
  });

  it('data was set', () => {
    return redis.get('foo').then(result => assert.equal(result, 'blee'));
  });
});

describe('del concurrently with update:', () => {
  let error;

  before(() => {
    return redis
      .set('foo', 'bar')
      .then(() => redis.update('foo', () => redis.del('foo').then(() => 'baz')))
      .catch(e => (error = e));
  });

  it('update failed', () => {
    assert.ok(error);
    assert.equal(error.message, 'Redis WATCH detected a conflicting update');
    assert.equal(error.errno, 165);
  });

  it('data was deleted', () => {
    return redis.get('foo').then(result => assert.ok(result === null));
  });
});
