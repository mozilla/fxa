export {};

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { config } = require('../../config');

describe('lib/jwt_sub', () => {
  let jwtSub: any;

  const USER_ID_HEX = 'deadbeef';
  const USER_ID_BUF = Buffer.from(USER_ID_HEX, 'hex');

  const ENABLED_CLIENT_ID_HEX = '98e6508e88680e1a';
  const ENABLED_CLIENT_ID_BUF = Buffer.from(ENABLED_CLIENT_ID_HEX, 'hex');

  const ROTATING_CLIENT_ID_HEX = '38a6b9b3a65a1871';
  const ROTATING_CLIENT_ID_BUF = Buffer.from(ROTATING_CLIENT_ID_HEX, 'hex');

  const DISABLED_CLIENT_ID_HEX = 'dcdb5ae7add825d2';
  const DISABLED_CLIENT_ID_BUF = Buffer.from(DISABLED_CLIENT_ID_HEX, 'hex');

  function initialize(isEnabled: boolean) {
    const mockConfig = {
      config: {
        get(key: string) {
          switch (key) {
            case 'oauthServer.ppid.salt':
              return 'salt';
            case 'oauthServer.ppid.enabled':
              return isEnabled;
            case 'oauthServer.ppid.enabledClientIds':
              return [ENABLED_CLIENT_ID_HEX, ROTATING_CLIENT_ID_HEX];
            case 'oauthServer.ppid.rotatingClientIds':
              return [ROTATING_CLIENT_ID_HEX];
            case 'oauthServer.ppid.rotationPeriodMS':
              return 1;
            default:
              return config.get(key);
          }
        },
      },
    };

    jest.resetModules();
    jest.doMock('../../config', () => mockConfig);
    jwtSub = require('./jwt_sub');
  }

  it('throws if userId is not a buffer', async () => {
    initialize(true);
    await expect(
      jwtSub(USER_ID_HEX, ENABLED_CLIENT_ID_BUF)
    ).rejects.toThrow('invalid userIdBuf');
  });

  it('throws if clientId is not a buffer', async () => {
    initialize(true);
    await expect(
      jwtSub(USER_ID_BUF, ENABLED_CLIENT_ID_HEX)
    ).rejects.toThrow('invalid clientIdBuf');
  });

  const invalidPpidSeedCases: [string, any][] = [
    ['too low', -1],
    ['too high', 1025],
    ['a float', 1.1],
    ['a string', 'a'],
  ];
  invalidPpidSeedCases.forEach(([label, seed]) => {
    it(`throws if ppidSeed is ${label}`, async () => {
      initialize(true);
      await expect(
        jwtSub(USER_ID_BUF, ENABLED_CLIENT_ID_BUF, seed)
      ).rejects.toThrow('invalid ppidSeed');
    });
  });

  it('returns the hex version of the userId if not enabled', async () => {
    initialize(false);
    expect(await jwtSub(USER_ID_BUF, ENABLED_CLIENT_ID_BUF)).toBe(
      USER_ID_HEX
    );
  });

  it('returns the hex version of the userId if not enabled for the clientId', async () => {
    initialize(true);
    expect(await jwtSub(USER_ID_BUF, DISABLED_CLIENT_ID_BUF)).toBe(
      USER_ID_HEX
    );
  });

  it('returns a stable PPID if enabled without rotation', async () => {
    initialize(true);
    const result1 = await jwtSub(USER_ID_BUF, ENABLED_CLIENT_ID_BUF);
    expect(typeof result1).toBe('string');
    expect(result1).not.toBe(USER_ID_HEX);
    expect(result1).toHaveLength(USER_ID_HEX.length);

    await new Promise((ok) => setTimeout(ok, 10));

    const result2 = await jwtSub(USER_ID_BUF, ENABLED_CLIENT_ID_BUF);
    expect(typeof result2).toBe('string');
    expect(result2).not.toBe(USER_ID_HEX);
    expect(result2).toHaveLength(USER_ID_HEX.length);

    expect(result1).toBe(result2);
  });

  it('returns rotating PPIDs for enabled clients', async () => {
    initialize(true);
    const result1 = await jwtSub(USER_ID_BUF, ROTATING_CLIENT_ID_BUF);
    expect(typeof result1).toBe('string');
    expect(result1).not.toBe(USER_ID_HEX);
    expect(result1).toHaveLength(USER_ID_HEX.length);

    await new Promise((ok) => setTimeout(ok, 10));

    const result2 = await jwtSub(USER_ID_BUF, ROTATING_CLIENT_ID_BUF);
    expect(typeof result2).toBe('string');
    expect(result2).not.toBe(USER_ID_HEX);
    expect(result2).toHaveLength(USER_ID_HEX.length);

    expect(result1).not.toBe(result2);
  });
});
