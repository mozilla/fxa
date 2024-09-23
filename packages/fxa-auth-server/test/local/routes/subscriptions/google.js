/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import sinon from 'sinon';
import { Container } from 'typedi';
const assert = { ...sinon.assert, ...require('chai').assert };
import * as uuid from 'uuid';
import mocks from '../../../mocks';
import { GoogleIapHandler } from '../../../../lib/routes/subscriptions/google';
import { PurchaseUpdateError } from '../../../../lib/payments/iap/google-play/types/errors';
import error from '../../../../lib/error';
import { AuthLogger } from '../../../../lib/types';
import { PlayBilling } from '../../../../lib/payments/iap/google-play';
import { IAPConfig } from '../../../../lib/payments/iap/iap-config';
import { OAUTH_SCOPE_SUBSCRIPTIONS_IAP } from 'fxa-shared/oauth/constants';
import { CapabilityService } from '../../../../lib/payments/capability';

const MOCK_SCOPES = ['profile:email', OAUTH_SCOPE_SUBSCRIPTIONS_IAP];
const ACCOUNT_LOCALE = 'en-US';
const TEST_EMAIL = 'test@email.com';
const UID = uuid.v4({}, Buffer.alloc(16)).toString('hex');
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
  let iapConfig;
  let playBilling;
  let log;
  let googleIapHandler;
  let mockCapabilityService;
  let db;

  beforeEach(() => {
    log = mocks.mockLog();
    playBilling = {};
    Container.set(AuthLogger, log);
    iapConfig = {};
    Container.set(IAPConfig, iapConfig);
    Container.set(PlayBilling, playBilling);
    db = mocks.mockDB({
      uid: UID,
      email: TEST_EMAIL,
      locale: ACCOUNT_LOCALE,
    });
    db.account = sinon.fake.resolves({ primaryEmail: { email: TEST_EMAIL } });
    mockCapabilityService = {};
    mockCapabilityService.iapUpdate = sinon.fake.resolves({});
    Container.set(CapabilityService, mockCapabilityService);
    googleIapHandler = new GoogleIapHandler(db);
  });

  afterEach(() => {
    Container.reset();
    sinon.restore();
  });

  describe('plans', () => {
    it('returns the plans', async () => {
      iapConfig.plans = sinon.fake.resolves({ test: 'plan' });
      const result = await googleIapHandler.plans({
        params: { appName: 'test' },
      });
      assert.calledOnce(iapConfig.plans);
      assert.deepEqual(result, { test: 'plan' });
    });
  });

  describe('registerToken', () => {
    const request = {
      ...VALID_REQUEST,
      params: { appName: 'test' },
      payload: { sku: 'testSku', token: 'testToken' },
    };

    it('returns valid with new products', async () => {
      playBilling.purchaseManager = {
        registerToUserAccount: sinon.fake.resolves({}),
      };
      iapConfig.packageName = sinon.fake.resolves('testPackage');
      const result = await googleIapHandler.registerToken(request);
      assert.calledOnce(playBilling.purchaseManager.registerToUserAccount);
      assert.calledOnce(iapConfig.packageName);
      assert.calledOnce(mockCapabilityService.iapUpdate);
      assert.deepEqual(result, { tokenValid: true });
    });

    it('throws on invalid package', async () => {
      playBilling.purchaseManager = {
        registerToUserAccount: sinon.fake.resolves({}),
      };
      iapConfig.packageName = sinon.fake.resolves(undefined);
      try {
        await googleIapHandler.registerToken(request);
        assert.fail('Expected failure');
      } catch (err) {
        assert.calledOnce(iapConfig.packageName);
        assert.strictEqual(err.errno, error.ERRNO.IAP_UNKNOWN_APPNAME);
      }
    });

    it('throws on invalid token', async () => {
      const libraryError = new Error('Purchase is not registerable');
      libraryError.name = PurchaseUpdateError.INVALID_TOKEN;

      playBilling.purchaseManager = {
        registerToUserAccount: sinon.fake.rejects(libraryError),
      };
      iapConfig.packageName = sinon.fake.resolves('testPackage');
      try {
        await googleIapHandler.registerToken(request);
        assert.fail('Expected failure');
      } catch (err) {
        assert.strictEqual(err.errno, error.ERRNO.IAP_INVALID_TOKEN);
        assert.calledOnce(playBilling.purchaseManager.registerToUserAccount);
        assert.calledOnce(iapConfig.packageName);
      }
    });

    it('throws on conflict', async () => {
      const libraryError = new Error('Purchase is not registerable');
      libraryError.name = PurchaseUpdateError.CONFLICT;

      playBilling.purchaseManager = {
        registerToUserAccount: sinon.fake.rejects(libraryError),
      };
      iapConfig.packageName = sinon.fake.resolves('testPackage');
      try {
        await googleIapHandler.registerToken(request);
        assert.fail('Expected failure');
      } catch (err) {
        assert.strictEqual(err.errno, error.ERRNO.IAP_INTERNAL_OTHER);
        assert.calledOnce(playBilling.purchaseManager.registerToUserAccount);
        assert.calledOnce(iapConfig.packageName);
      }
    });

    it('throws on unknown errors', async () => {
      playBilling.purchaseManager = {
        registerToUserAccount: sinon.fake.rejects(new Error('Unknown error')),
      };
      iapConfig.packageName = sinon.fake.resolves('testPackage');
      try {
        await googleIapHandler.registerToken(request);
        assert.fail('Expected failure');
      } catch (err) {
        assert.strictEqual(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
        assert.calledOnce(playBilling.purchaseManager.registerToUserAccount);
        assert.calledOnce(iapConfig.packageName);
      }
    });
  });
});
