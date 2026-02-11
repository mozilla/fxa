/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import sinon from 'sinon';

import * as lib from '../../../scripts/delete-inactive-accounts/lib';

describe('delete inactive accounts script lib', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setDateToUTC', () => {
    it('should set to beginning of day n UTC', () => {
      const date = new Date('2021-12-22T00:00:00.000-08:00');
      const utcDate = lib.setDateToUTC(date.valueOf());
      assert.equal(utcDate.toISOString(), '2021-12-22T00:00:00.000Z');
    });
  });

  describe('token checks', () => {
    describe('session tokens', () => {
      const ts = Date.now();

      it('should be true when there is one recent enough session token', async () => {
        const tokensFn = sandbox.stub().resolves([{ lastAccessTime: ts }]);
        const newerTsActual = await lib.hasActiveSessionToken(
          tokensFn,
          '9001',
          ts - 1000
        );
        assert.isTrue(newerTsActual);
        sinon.assert.calledOnceWithExactly(tokensFn, '9001');

        const equallyNewActual = await lib.hasActiveSessionToken(
          tokensFn,
          '9001',
          ts
        );
        assert.isTrue(equallyNewActual);
      });
      it('should be true when there are multiple recent enough session tokens', async () => {
        const tokensFn = sandbox
          .stub()
          .resolves([
            { lastAccessTime: ts - 9000 },
            { lastAccessTime: ts },
            { lastAccessTime: ts + 9000 },
          ]);
        const actual = await lib.hasActiveSessionToken(
          tokensFn,
          '9001',
          ts - 1000
        );
        assert.isTrue(actual);
      });
      it('should be false when there are no recent enough session tokens', async () => {
        const noTokensFn = sandbox.stub().resolves([]);
        const noTokensActual = await lib.hasActiveSessionToken(
          noTokensFn,
          '9001',
          ts
        );
        assert.isFalse(noTokensActual);

        const noTimestampTokensFn = sandbox.stub().resolves([{ uid: '9001' }]);
        const noTimestampTokensActual = await lib.hasActiveSessionToken(
          noTimestampTokensFn,
          '9001',
          ts
        );
        assert.isFalse(noTimestampTokensActual);

        const noRecentEnoughTokensFn = sandbox
          .stub()
          .resolves([{ lastAccessTime: ts }]);
        const noRecentEnoughTokensActual = await lib.hasActiveSessionToken(
          noRecentEnoughTokensFn,
          '9001',
          ts + 1000
        );
        assert.isFalse(noRecentEnoughTokensActual);
      });
    });

    describe('refresh token', () => {
      const ts = Date.now();

      it('should be true when there is a recent enough refresh token', async () => {
        const tokensFn = sandbox.stub().resolves([{ lastUsedAt: ts }]);
        const newerTsActual = await lib.hasActiveRefreshToken(
          tokensFn,
          '9001',
          ts - 1000
        );
        assert.isTrue(newerTsActual);
        sinon.assert.calledOnceWithExactly(tokensFn, '9001');

        const equallyNewActual = await lib.hasActiveRefreshToken(
          tokensFn,
          '9001',
          ts
        );
        assert.isTrue(equallyNewActual);
      });
      it('should be true when there are multiple recent enough refresh tokens', async () => {
        const tokensFn = sandbox
          .stub()
          .resolves([
            { lastUsedAt: ts - 9000 },
            { lastUsedAt: ts },
            { lastUsedAt: ts + 9000 },
          ]);
        const actual = await lib.hasActiveRefreshToken(
          tokensFn,
          '9001',
          ts - 1000
        );
        assert.isTrue(actual);
      });
      it('should be false when there are no recent enough refresh tokens', async () => {
        const noTokensFn = sandbox.stub().resolves([]);
        const noTokensActual = await lib.hasActiveRefreshToken(
          noTokensFn,
          '9001',
          ts
        );
        assert.isFalse(noTokensActual);

        const noTimestampTokensFn = sandbox.stub().resolves([{ uid: '9001' }]);
        const noTimestampTokensActual = await lib.hasActiveRefreshToken(
          noTimestampTokensFn,
          '9001',
          ts
        );
        assert.isFalse(noTimestampTokensActual);

        const noRecentEnoughTokensFn = sandbox
          .stub()
          .resolves([{ lastUsedAt: ts }]);
        const noRecentEnoughTokensActual = await lib.hasActiveRefreshToken(
          noRecentEnoughTokensFn,
          '9001',
          ts + 1000
        );
        assert.isFalse(noRecentEnoughTokensActual);
      });
    });
    describe('access token', () => {
      it('should be true when there is an access token', async () => {
        const tokensFn = sandbox.stub().resolves([{}, {}]);
        const actual = await lib.hasAccessToken(tokensFn, '9001');
        sinon.assert.calledOnceWithExactly(tokensFn, '9001');
        assert.isTrue(actual);
      });
      it('should be false when there are no access tokens', async () => {
        const tokensFn = sandbox.stub().resolves([]);
        const actual = await lib.hasAccessToken(tokensFn, '9001');
        assert.isFalse(actual);
      });
    });
  });

  describe('inActive function builder', () => {
    let sessionTokensFn;
    let refreshTokensFn;
    let accessTokensFn;
    let iapSubscriptionFn;

    beforeEach(() => {
      sessionTokensFn = sandbox.stub();
      refreshTokensFn = sandbox.stub();
      accessTokensFn = sandbox.stub();
      iapSubscriptionFn = sandbox.stub();
    });

    it('should throw an error if the active session token function is missing', async () => {
      const builder = new lib.IsActiveFnBuilder();
      try {
        await builder
          .setRefreshTokenFn(refreshTokensFn)
          .setAccessTokenFn(accessTokensFn)
          .build()();
        assert.fail('should have thrown an error');
      } catch (actual) {
        assert.instanceOf(actual, Error);
      }
    });
    it('should throw an error if the active refresh token function is missing', async () => {
      const builder = new lib.IsActiveFnBuilder();
      try {
        await builder
          .setActiveSessionTokenFn(sessionTokensFn)
          .setAccessTokenFn(accessTokensFn)
          .build()();
        assert.fail('should have thrown an error');
      } catch (actual) {
        assert.instanceOf(actual, Error);
      }
    });
    it('should throw an error if the has access token token function is missing', async () => {
      const builder = new lib.IsActiveFnBuilder();
      try {
        await builder
          .setActiveSessionTokenFn(sessionTokensFn)
          .setRefreshTokenFn(refreshTokensFn)
          .build()();
        assert.fail('should have thrown an error');
      } catch (actual) {
        assert.instanceOf(actual, Error);
      }
    });
    it('should throw an error if the has IAP subscription function is missing', async () => {
      const builder = new lib.IsActiveFnBuilder();
      try {
        await builder
          .setActiveSessionTokenFn(sessionTokensFn)
          .setRefreshTokenFn(refreshTokensFn)
          .setAccessTokenFn(accessTokensFn)
          .build()();
        assert.fail('should have thrown an error');
      } catch (actual) {
        assert.instanceOf(actual, Error);
      }
    });

    describe('short-circuits on the first active result', () => {
      let isActive;

      beforeEach(() => {
        const builder = new lib.IsActiveFnBuilder();
        isActive = builder
          .setActiveSessionTokenFn(sessionTokensFn)
          .setRefreshTokenFn(refreshTokensFn)
          .setAccessTokenFn(accessTokensFn)
          .build();
      });

      it('should short-circuit with session token check', async () => {
        sessionTokensFn.resolves(true);
        const actual = await isActive('9001');
        assert.isTrue(actual);
        sinon.assert.calledOnceWithExactly(sessionTokensFn, '9001');
        sinon.assert.notCalled(refreshTokensFn);
        sinon.assert.notCalled(accessTokensFn);
        sinon.assert.notCalled(iapSubscriptionFn);
      });

      it('should short-circuit with refresh token check', async () => {
        sessionTokensFn.resolves(false);
        refreshTokensFn.resolves(true);
        const actual = await isActive('9001');
        assert.isTrue(actual);
        sinon.assert.calledOnceWithExactly(sessionTokensFn, '9001');
        sinon.assert.calledOnceWithExactly(refreshTokensFn, '9001');
        sinon.assert.notCalled(accessTokensFn);
        sinon.assert.notCalled(iapSubscriptionFn);
      });

      it('should short-circuit with access token check', async () => {
        sessionTokensFn.resolves(false);
        refreshTokensFn.resolves(false);
        accessTokensFn.resolves(true);
        const actual = await isActive('9001');
        assert.isTrue(actual);
        sinon.assert.calledOnceWithExactly(sessionTokensFn, '9001');
        sinon.assert.calledOnceWithExactly(refreshTokensFn, '9001');
        sinon.assert.calledOnceWithExactly(accessTokensFn, '9001');
        sinon.assert.notCalled(iapSubscriptionFn);
      });
    });

    it('should be false when all condition functions are false', async () => {
      const builder = new lib.IsActiveFnBuilder();
      const isActive = builder
        .setActiveSessionTokenFn(sessionTokensFn)
        .setRefreshTokenFn(refreshTokensFn)
        .setAccessTokenFn(accessTokensFn)
        .build();
      sessionTokensFn.resolves(false);
      refreshTokensFn.resolves(false);
      accessTokensFn.resolves(false);
      iapSubscriptionFn.resolves(false);

      const actual = await isActive('9001');
      assert.isFalse(actual);
      sinon.assert.calledOnceWithExactly(sessionTokensFn, '9001');
      sinon.assert.calledOnceWithExactly(refreshTokensFn, '9001');
      sinon.assert.calledOnceWithExactly(accessTokensFn, '9001');
    });
  });
});
