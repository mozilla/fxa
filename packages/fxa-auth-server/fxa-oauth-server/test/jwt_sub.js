/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const proxyquire = require('proxyquire');
const config = require('../lib/config');
const P = require('../lib/promise');

describe('lib/jwt_sub', () => {
  let mockConfig;
  let jwtSub;

  const USER_ID_HEX = 'deadbeef';
  const USER_ID_BUF = Buffer.from(USER_ID_HEX, 'hex');

  const ENABLED_CLIENT_ID_HEX = '98e6508e88680e1a';
  const ENABLED_CLIENT_ID_BUF = Buffer.from(ENABLED_CLIENT_ID_HEX, 'hex');

  const ROTATING_CLIENT_ID_HEX = '38a6b9b3a65a1871';
  const ROTATING_CLIENT_ID_BUF = Buffer.from(ROTATING_CLIENT_ID_HEX, 'hex');

  const DISABLED_CLIENT_ID_HEX = 'dcdb5ae7add825d2';
  const DISABLED_CLIENT_ID_BUF = Buffer.from(DISABLED_CLIENT_ID_HEX, 'hex');

  function initialize(isEnabled) {
    mockConfig = {
      get(key) {
        switch (key) {
          case 'ppid.salt':
            return 'salt';
          case 'ppid.enabled':
            return isEnabled;
          case 'ppid.enabledClientIds':
            return [ENABLED_CLIENT_ID_HEX, ROTATING_CLIENT_ID_HEX];
          case 'ppid.rotatingClientIds':
            return [ROTATING_CLIENT_ID_HEX];
          case 'ppid.rotationPeriodMS':
            return 1;
          default:
            return config.get(key);
        }
      },
    };

    jwtSub = proxyquire('../lib/jwt_sub', {
      './config': mockConfig,
    });
  }

  it('throws if userId is not a buffer', async () => {
    initialize(true);
    try {
      await jwtSub(USER_ID_HEX, ENABLED_CLIENT_ID_BUF);
      assert.fail();
    } catch (e) {
      assert.strictEqual(e.message, 'invalid userIdBuf');
    }
  });

  it('throws if clientId is not a buffer', async () => {
    initialize(true);
    try {
      await jwtSub(USER_ID_BUF, ENABLED_CLIENT_ID_HEX);
      assert.fail();
    } catch (e) {
      assert.strictEqual(e.message, 'invalid clientIdBuf');
    }
  });

  it('throws if ppidSeed is too low', async () => {
    initialize(true);
    try {
      await jwtSub(USER_ID_BUF, ENABLED_CLIENT_ID_BUF, -1);
      assert.fail();
    } catch (e) {
      assert.strictEqual(e.message, 'invalid ppidSeed');
    }
  });

  it('throws if ppidSeed is too high', async () => {
    initialize(true);
    try {
      await jwtSub(USER_ID_BUF, ENABLED_CLIENT_ID_BUF, 1025);
      assert.fail();
    } catch (e) {
      assert.strictEqual(e.message, 'invalid ppidSeed');
    }
  });

  it('throws if ppidSeed is a float', async () => {
    initialize(true);
    try {
      await jwtSub(USER_ID_BUF, ENABLED_CLIENT_ID_BUF, 1.1);
      assert.fail();
    } catch (e) {
      assert.strictEqual(e.message, 'invalid ppidSeed');
    }
  });

  it('throws if ppidSeed is a string', async () => {
    initialize(true);
    try {
      await jwtSub(USER_ID_BUF, ENABLED_CLIENT_ID_BUF, 'a');
      assert.fail();
    } catch (e) {
      assert.strictEqual(e.message, 'invalid ppidSeed');
    }
  });

  it('returns the hex version of the userId if not enabled', async () => {
    initialize(false);

    assert.strictEqual(
      await jwtSub(USER_ID_BUF, ENABLED_CLIENT_ID_BUF),
      USER_ID_HEX
    );
  });

  it('returns the hex version of the userId if not enabled for the clientId', async () => {
    initialize(true);
    assert.strictEqual(
      await jwtSub(USER_ID_BUF, DISABLED_CLIENT_ID_BUF),
      USER_ID_HEX
    );
  });

  it('returns a stable PPID if enabled without rotation', async () => {
    initialize(true);
    const result1 = await jwtSub(USER_ID_BUF, ENABLED_CLIENT_ID_BUF);
    assert.isString(result1);
    assert.notEqual(result1, USER_ID_HEX);
    assert.lengthOf(result1, USER_ID_HEX.length);

    await P.delay(10);

    const result2 = await jwtSub(USER_ID_BUF, ENABLED_CLIENT_ID_BUF);
    assert.isString(result2);
    assert.notEqual(result2, USER_ID_HEX);
    assert.lengthOf(result2, USER_ID_HEX.length);

    assert.strictEqual(result1, result2);
  });

  it('returns rotating PPIDs for enabled clients', async () => {
    initialize(true);
    const result1 = await jwtSub(USER_ID_BUF, ROTATING_CLIENT_ID_BUF);
    assert.isString(result1);
    assert.notEqual(result1, USER_ID_HEX);
    assert.lengthOf(result1, USER_ID_HEX.length);

    await P.delay(10);

    const result2 = await jwtSub(USER_ID_BUF, ROTATING_CLIENT_ID_BUF);
    assert.isString(result2);
    assert.notEqual(result2, USER_ID_HEX);
    assert.lengthOf(result2, USER_ID_HEX.length);

    assert.notEqual(result1, result2);
  });
});
