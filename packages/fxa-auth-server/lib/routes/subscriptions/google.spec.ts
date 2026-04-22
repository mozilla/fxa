/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
const uuid = require('uuid');

const mocks = require('../../../test/mocks');
const { GoogleIapHandler } = require('./google');
const {
  PurchaseUpdateError,
} = require('../../payments/iap/google-play/types/errors');
const { AppError: error } = require('@fxa/accounts/errors');
const { AuthLogger } = require('../../types');
const { PlayBilling } = require('../../payments/iap/google-play');
const { IAPConfig } = require('../../payments/iap/iap-config');
const { OAUTH_SCOPE_SUBSCRIPTIONS_IAP } = require('fxa-shared/oauth/constants');
const { CapabilityService } = require('../../payments/capability');

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
  let iapConfig: any;
  let playBilling: any;
  let log: any;
  let googleIapHandler: any;
  let mockCapabilityService: any;
  let db: any;

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
    db.account = jest
      .fn()
      .mockResolvedValue({ primaryEmail: { email: TEST_EMAIL } });
    mockCapabilityService = {};
    mockCapabilityService.iapUpdate = jest.fn().mockResolvedValue({});
    Container.set(CapabilityService, mockCapabilityService);
    googleIapHandler = new GoogleIapHandler(db);
  });

  afterEach(() => {
    Container.reset();
    jest.restoreAllMocks();
  });

  describe('plans', () => {
    it('returns the plans', async () => {
      iapConfig.plans = jest.fn().mockResolvedValue({ test: 'plan' });
      const result = await googleIapHandler.plans({
        params: { appName: 'test' },
      });
      expect(iapConfig.plans).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ test: 'plan' });
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
        registerToUserAccount: jest.fn().mockResolvedValue({}),
      };
      iapConfig.packageName = jest.fn().mockResolvedValue('testPackage');
      const result = await googleIapHandler.registerToken(request);
      expect(
        playBilling.purchaseManager.registerToUserAccount
      ).toHaveBeenCalledTimes(1);
      expect(iapConfig.packageName).toHaveBeenCalledTimes(1);
      expect(mockCapabilityService.iapUpdate).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ tokenValid: true });
    });

    it('throws on invalid package', async () => {
      playBilling.purchaseManager = {
        registerToUserAccount: jest.fn().mockResolvedValue({}),
      };
      iapConfig.packageName = jest.fn().mockResolvedValue(undefined);
      try {
        await googleIapHandler.registerToken(request);
        throw new Error('Expected failure');
      } catch (err: any) {
        expect(iapConfig.packageName).toHaveBeenCalledTimes(1);
        expect(err.errno).toBe(error.ERRNO.IAP_UNKNOWN_APPNAME);
      }
    });

    it('throws on invalid token', async () => {
      const libraryError = new Error('Purchase is not registerable');
      libraryError.name = PurchaseUpdateError.INVALID_TOKEN;

      playBilling.purchaseManager = {
        registerToUserAccount: jest.fn().mockRejectedValue(libraryError),
      };
      iapConfig.packageName = jest.fn().mockResolvedValue('testPackage');
      try {
        await googleIapHandler.registerToken(request);
        throw new Error('Expected failure');
      } catch (err: any) {
        expect(err.errno).toBe(error.ERRNO.IAP_INVALID_TOKEN);
        expect(
          playBilling.purchaseManager.registerToUserAccount
        ).toHaveBeenCalledTimes(1);
        expect(iapConfig.packageName).toHaveBeenCalledTimes(1);
      }
    });

    it('throws on conflict', async () => {
      const libraryError = new Error('Purchase is not registerable');
      libraryError.name = PurchaseUpdateError.CONFLICT;

      playBilling.purchaseManager = {
        registerToUserAccount: jest.fn().mockRejectedValue(libraryError),
      };
      iapConfig.packageName = jest.fn().mockResolvedValue('testPackage');
      try {
        await googleIapHandler.registerToken(request);
        throw new Error('Expected failure');
      } catch (err: any) {
        expect(err.errno).toBe(error.ERRNO.IAP_INTERNAL_OTHER);
        expect(
          playBilling.purchaseManager.registerToUserAccount
        ).toHaveBeenCalledTimes(1);
        expect(iapConfig.packageName).toHaveBeenCalledTimes(1);
      }
    });

    it('throws on unknown errors', async () => {
      playBilling.purchaseManager = {
        registerToUserAccount: jest
          .fn()
          .mockRejectedValue(new Error('Unknown error')),
      };
      iapConfig.packageName = jest.fn().mockResolvedValue('testPackage');
      try {
        await googleIapHandler.registerToken(request);
        throw new Error('Expected failure');
      } catch (err: any) {
        expect(err.errno).toBe(error.ERRNO.BACKEND_SERVICE_FAILURE);
        expect(
          playBilling.purchaseManager.registerToUserAccount
        ).toHaveBeenCalledTimes(1);
        expect(iapConfig.packageName).toHaveBeenCalledTimes(1);
      }
    });
  });
});
