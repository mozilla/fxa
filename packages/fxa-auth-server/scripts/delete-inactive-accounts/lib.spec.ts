/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as lib from './lib';

describe('delete inactive accounts script lib', () => {
  beforeEach(() => {});

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('setDateToUTC', () => {
    it('should set to beginning of day n UTC', () => {
      const date = new Date('2021-12-22T00:00:00.000-08:00');
      const utcDate = lib.setDateToUTC(date.valueOf());
      expect(utcDate.toISOString()).toBe('2021-12-22T00:00:00.000Z');
    });
  });

  describe('token checks', () => {
    describe('session tokens', () => {
      const ts = Date.now();

      it('should be true when there is one recent enough session token', async () => {
        const tokensFn = jest.fn().mockResolvedValue([{ lastAccessTime: ts }]);
        const newerTsActual = await lib.hasActiveSessionToken(
          tokensFn,
          '9001',
          ts - 1000
        );
        expect(newerTsActual).toBe(true);
        expect(tokensFn).toHaveBeenCalledTimes(1);
        expect(tokensFn).toHaveBeenCalledWith('9001');

        const equallyNewActual = await lib.hasActiveSessionToken(
          tokensFn,
          '9001',
          ts
        );
        expect(equallyNewActual).toBe(true);
      });
      it('should be true when there are multiple recent enough session tokens', async () => {
        const tokensFn = jest
          .fn()
          .mockResolvedValue([
            { lastAccessTime: ts - 9000 },
            { lastAccessTime: ts },
            { lastAccessTime: ts + 9000 },
          ]);
        const actual = await lib.hasActiveSessionToken(
          tokensFn,
          '9001',
          ts - 1000
        );
        expect(actual).toBe(true);
      });
      it('should be false when there are no recent enough session tokens', async () => {
        const noTokensFn = jest.fn().mockResolvedValue([]);
        const noTokensActual = await lib.hasActiveSessionToken(
          noTokensFn,
          '9001',
          ts
        );
        expect(noTokensActual).toBe(false);

        const noTimestampTokensFn = jest
          .fn()
          .mockResolvedValue([{ uid: '9001' }]);
        const noTimestampTokensActual = await lib.hasActiveSessionToken(
          noTimestampTokensFn,
          '9001',
          ts
        );
        expect(noTimestampTokensActual).toBe(false);

        const noRecentEnoughTokensFn = jest
          .fn()
          .mockResolvedValue([{ lastAccessTime: ts }]);
        const noRecentEnoughTokensActual = await lib.hasActiveSessionToken(
          noRecentEnoughTokensFn,
          '9001',
          ts + 1000
        );
        expect(noRecentEnoughTokensActual).toBe(false);
      });
    });

    describe('refresh token', () => {
      const ts = Date.now();

      it('should be true when there is a recent enough refresh token', async () => {
        const tokensFn = jest.fn().mockResolvedValue([{ lastUsedAt: ts }]);
        const newerTsActual = await lib.hasActiveRefreshToken(
          tokensFn,
          '9001',
          ts - 1000
        );
        expect(newerTsActual).toBe(true);
        expect(tokensFn).toHaveBeenCalledTimes(1);
        expect(tokensFn).toHaveBeenCalledWith('9001');

        const equallyNewActual = await lib.hasActiveRefreshToken(
          tokensFn,
          '9001',
          ts
        );
        expect(equallyNewActual).toBe(true);
      });
      it('should be true when there are multiple recent enough refresh tokens', async () => {
        const tokensFn = jest
          .fn()
          .mockResolvedValue([
            { lastUsedAt: ts - 9000 },
            { lastUsedAt: ts },
            { lastUsedAt: ts + 9000 },
          ]);
        const actual = await lib.hasActiveRefreshToken(
          tokensFn,
          '9001',
          ts - 1000
        );
        expect(actual).toBe(true);
      });
      it('should be false when there are no recent enough refresh tokens', async () => {
        const noTokensFn = jest.fn().mockResolvedValue([]);
        const noTokensActual = await lib.hasActiveRefreshToken(
          noTokensFn,
          '9001',
          ts
        );
        expect(noTokensActual).toBe(false);

        const noTimestampTokensFn = jest
          .fn()
          .mockResolvedValue([{ uid: '9001' }]);
        const noTimestampTokensActual = await lib.hasActiveRefreshToken(
          noTimestampTokensFn,
          '9001',
          ts
        );
        expect(noTimestampTokensActual).toBe(false);

        const noRecentEnoughTokensFn = jest
          .fn()
          .mockResolvedValue([{ lastUsedAt: ts }]);
        const noRecentEnoughTokensActual = await lib.hasActiveRefreshToken(
          noRecentEnoughTokensFn,
          '9001',
          ts + 1000
        );
        expect(noRecentEnoughTokensActual).toBe(false);
      });
    });
    describe('access token', () => {
      it('should be true when there is an access token', async () => {
        const tokensFn = jest.fn().mockResolvedValue([{}, {}]);
        const actual = await lib.hasAccessToken(tokensFn, '9001');
        expect(tokensFn).toHaveBeenCalledTimes(1);
        expect(tokensFn).toHaveBeenCalledWith('9001');
        expect(actual).toBe(true);
      });
      it('should be false when there are no access tokens', async () => {
        const tokensFn = jest.fn().mockResolvedValue([]);
        const actual = await lib.hasAccessToken(tokensFn, '9001');
        expect(actual).toBe(false);
      });
    });
  });

  describe('inActive function builder', () => {
    let sessionTokensFn: jest.Mock;
    let refreshTokensFn: jest.Mock;
    let accessTokensFn: jest.Mock;
    let iapSubscriptionFn: jest.Mock;

    beforeEach(() => {
      sessionTokensFn = jest.fn();
      refreshTokensFn = jest.fn();
      accessTokensFn = jest.fn();
      iapSubscriptionFn = jest.fn();
    });

    it('should throw an error if the active session token function is missing', async () => {
      const builder = new lib.IsActiveFnBuilder();
      try {
        await (
          builder
            .setRefreshTokenFn(refreshTokensFn)
            .setAccessTokenFn(accessTokensFn)
            .build() as any
        )();
        throw new Error('should have thrown');
      } catch (actual) {
        expect(actual).toBeInstanceOf(Error);
      }
    });
    it('should throw an error if the active refresh token function is missing', async () => {
      const builder = new lib.IsActiveFnBuilder();
      try {
        await (
          builder
            .setActiveSessionTokenFn(sessionTokensFn)
            .setAccessTokenFn(accessTokensFn)
            .build() as any
        )();
        throw new Error('should have thrown');
      } catch (actual) {
        expect(actual).toBeInstanceOf(Error);
      }
    });
    it('should throw an error if the has access token token function is missing', async () => {
      const builder = new lib.IsActiveFnBuilder();
      try {
        await (
          builder
            .setActiveSessionTokenFn(sessionTokensFn)
            .setRefreshTokenFn(refreshTokensFn)
            .build() as any
        )();
        throw new Error('should have thrown');
      } catch (actual) {
        expect(actual).toBeInstanceOf(Error);
      }
    });
    it('should throw an error if the has IAP subscription function is missing', async () => {
      const builder = new lib.IsActiveFnBuilder();
      try {
        await (
          builder
            .setActiveSessionTokenFn(sessionTokensFn)
            .setRefreshTokenFn(refreshTokensFn)
            .setAccessTokenFn(accessTokensFn)
            .build() as any
        )();
        throw new Error('should have thrown');
      } catch (actual) {
        expect(actual).toBeInstanceOf(Error);
      }
    });

    describe('short-circuits on the first active result', () => {
      let isActive: (uid: string) => Promise<boolean>;

      beforeEach(() => {
        const builder = new lib.IsActiveFnBuilder();
        isActive = builder
          .setActiveSessionTokenFn(sessionTokensFn)
          .setRefreshTokenFn(refreshTokensFn)
          .setAccessTokenFn(accessTokensFn)
          .build();
      });

      it('should short-circuit with session token check', async () => {
        sessionTokensFn.mockResolvedValue(true);
        const actual = await isActive('9001');
        expect(actual).toBe(true);
        expect(sessionTokensFn).toHaveBeenCalledTimes(1);
        expect(sessionTokensFn).toHaveBeenCalledWith('9001');
        expect(refreshTokensFn).not.toHaveBeenCalled();
        expect(accessTokensFn).not.toHaveBeenCalled();
        expect(iapSubscriptionFn).not.toHaveBeenCalled();
      });

      it('should short-circuit with refresh token check', async () => {
        sessionTokensFn.mockResolvedValue(false);
        refreshTokensFn.mockResolvedValue(true);
        const actual = await isActive('9001');
        expect(actual).toBe(true);
        expect(sessionTokensFn).toHaveBeenCalledTimes(1);
        expect(sessionTokensFn).toHaveBeenCalledWith('9001');
        expect(refreshTokensFn).toHaveBeenCalledTimes(1);
        expect(refreshTokensFn).toHaveBeenCalledWith('9001');
        expect(accessTokensFn).not.toHaveBeenCalled();
        expect(iapSubscriptionFn).not.toHaveBeenCalled();
      });

      it('should short-circuit with access token check', async () => {
        sessionTokensFn.mockResolvedValue(false);
        refreshTokensFn.mockResolvedValue(false);
        accessTokensFn.mockResolvedValue(true);
        const actual = await isActive('9001');
        expect(actual).toBe(true);
        expect(sessionTokensFn).toHaveBeenCalledTimes(1);
        expect(sessionTokensFn).toHaveBeenCalledWith('9001');
        expect(refreshTokensFn).toHaveBeenCalledTimes(1);
        expect(refreshTokensFn).toHaveBeenCalledWith('9001');
        expect(accessTokensFn).toHaveBeenCalledTimes(1);
        expect(accessTokensFn).toHaveBeenCalledWith('9001');
        expect(iapSubscriptionFn).not.toHaveBeenCalled();
      });
    });

    it('should be false when all condition functions are false', async () => {
      const builder = new lib.IsActiveFnBuilder();
      const isActive = builder
        .setActiveSessionTokenFn(sessionTokensFn)
        .setRefreshTokenFn(refreshTokensFn)
        .setAccessTokenFn(accessTokensFn)
        .build();
      sessionTokensFn.mockResolvedValue(false);
      refreshTokensFn.mockResolvedValue(false);
      accessTokensFn.mockResolvedValue(false);
      iapSubscriptionFn.mockResolvedValue(false);

      const actual = await isActive('9001');
      expect(actual).toBe(false);
      expect(sessionTokensFn).toHaveBeenCalledTimes(1);
      expect(sessionTokensFn).toHaveBeenCalledWith('9001');
      expect(refreshTokensFn).toHaveBeenCalledTimes(1);
      expect(refreshTokensFn).toHaveBeenCalledWith('9001');
      expect(accessTokensFn).toHaveBeenCalledTimes(1);
      expect(accessTokensFn).toHaveBeenCalledWith('9001');
    });
  });
});
