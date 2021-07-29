/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const { default: Container } = require('typedi');
const assert = { ...sinon.assert, ...require('chai').assert };

const { mockLog } = require('../../../mocks');
const {
  GoogleIapHandler,
} = require('../../../../lib/routes/subscriptions/google');
const {
  PurchaseUpdateError,
} = require('../../../../lib/payments/google-play/types/errors');
const error = require('../../../../lib/error');
const { AuthLogger } = require('../../../../lib/types');
const { PlayBilling } = require('../../../../lib/payments/google-play');

const SUBSCRIPTIONS_MANAGEMENT_SCOPE =
  'https://identity.mozilla.com/account/subscriptions';
const MOCK_SCOPES = ['profile:email', SUBSCRIPTIONS_MANAGEMENT_SCOPE];

const VALID_REQUEST = {
  auth: {
    credentials: {
      scope: MOCK_SCOPES,
      user: `uid1234`,
      email: `test@testing.com`,
    },
  },
};

describe('GoogleIapHandler', () => {
  let playBilling;
  let log;
  let googleIapHandler;

  beforeEach(() => {
    log = mockLog();
    playBilling = {};
    Container.set(AuthLogger, log);
    Container.set(PlayBilling, playBilling);
    googleIapHandler = new GoogleIapHandler();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('plans', () => {
    it('returns the plans', async () => {
      playBilling.plans = sinon.fake.resolves({ test: 'plan' });
      const result = await googleIapHandler.plans({
        params: { appName: 'test' },
      });
      assert.calledOnce(playBilling.plans);
      assert.deepEqual(result, { test: 'plan' });
    });
  });

  describe('registerToken', () => {
    const request = {
      ...VALID_REQUEST,
      params: { appName: 'test' },
      payload: { sku: 'testSku', token: 'testToken' },
    };

    it('returns valid', async () => {
      playBilling.purchaseManager = {
        registerToUserAccount: sinon.fake.resolves({}),
      };
      playBilling.packageName = sinon.fake.resolves('testPackage');
      const result = await googleIapHandler.registerToken(request);
      assert.calledOnce(playBilling.purchaseManager.registerToUserAccount);
      assert.calledOnce(playBilling.packageName);
      assert.deepEqual(result, { tokenValid: true });
    });

    it('throws on invalid package', async () => {
      playBilling.purchaseManager = {
        registerToUserAccount: sinon.fake.resolves({}),
      };
      playBilling.packageName = sinon.fake.resolves(undefined);
      try {
        await googleIapHandler.registerToken(request);
        assert.fail('Expected failure');
      } catch (err) {
        assert.calledOnce(playBilling.packageName);
        assert.strictEqual(err.errno, error.ERRNO.IAP_UNKNOWN_APPNAME);
      }
    });

    it('throws on invalid token', async () => {
      const libraryError = new Error('Purchase is not registerable');
      libraryError.name = PurchaseUpdateError.INVALID_TOKEN;

      playBilling.purchaseManager = {
        registerToUserAccount: sinon.fake.rejects(libraryError),
      };
      playBilling.packageName = sinon.fake.resolves('testPackage');
      try {
        await googleIapHandler.registerToken(request);
        assert.fail('Expected failure');
      } catch (err) {
        assert.strictEqual(err.errno, error.ERRNO.IAP_INVALID_TOKEN);
        assert.calledOnce(playBilling.purchaseManager.registerToUserAccount);
        assert.calledOnce(playBilling.packageName);
      }
    });

    it('throws on conflict', async () => {
      const libraryError = new Error('Purchase is not registerable');
      libraryError.name = PurchaseUpdateError.CONFLICT;

      playBilling.purchaseManager = {
        registerToUserAccount: sinon.fake.rejects(libraryError),
      };
      playBilling.packageName = sinon.fake.resolves('testPackage');
      try {
        await googleIapHandler.registerToken(request);
        assert.fail('Expected failure');
      } catch (err) {
        assert.strictEqual(err.errno, error.ERRNO.IAP_INTERNAL_OTHER);
        assert.calledOnce(playBilling.purchaseManager.registerToUserAccount);
        assert.calledOnce(playBilling.packageName);
      }
    });

    it('throws on unknown errors', async () => {
      playBilling.purchaseManager = {
        registerToUserAccount: sinon.fake.rejects(new Error('Unknown error')),
      };
      playBilling.packageName = sinon.fake.resolves('testPackage');
      try {
        await googleIapHandler.registerToken(request);
        assert.fail('Expected failure');
      } catch (err) {
        assert.strictEqual(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
        assert.calledOnce(playBilling.purchaseManager.registerToUserAccount);
        assert.calledOnce(playBilling.packageName);
      }
    });
  });
});
