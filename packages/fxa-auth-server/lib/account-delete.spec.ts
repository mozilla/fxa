/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Container from 'typedi';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '@fxa/accounts/errors';
import { AppleIAP } from './payments/iap/apple-app-store/apple-iap';
import { PlayBilling } from './payments/iap/google-play/play-billing';
import { ReasonForDeletion } from '@fxa/shared/cloud-tasks';
import { AppConfig, AuthLogger } from './types';

const mocks = require('../test/mocks');

const isActiveStub = jest.fn();

jest.mock('fxa-shared/db/models/auth', () => ({}));
jest.mock('./inactive-accounts', () => {
  const actual = jest.requireActual('./inactive-accounts');
  return {
    ...actual,
    InactiveAccountsManager: class {
      isActive = isActiveStub;
    },
  };
});

const email = 'foo@example.com';
const uid = uuidv4({}, Buffer.alloc(16)).toString('hex');
const expectedSubscriptions = [
  { uid, subscriptionId: '123' },
  { uid, subscriptionId: '456' },
  { uid, subscriptionId: '789' },
];
const deleteReason = 'fxa_user_requested_account_delete';

describe('AccountDeleteManager', () => {
  let mockFxaDb: any;
  let mockOAuthDb: any;
  let mockPush: any;
  let mockPushbox: any;
  let mockStatsd: any;
  let mockGlean: any;
  let mockMailer: any;
  let mockStripeHelper: any;
  let mockPaypalHelper: any;
  let mockAppleIap: any;
  let mockPlayBilling: any;
  let mockLog: any;
  let mockConfig: any;
  let accountDeleteManager: any;
  let mockAuthModels: any;

  beforeEach(() => {
    const { PayPalHelper } = require('./payments/paypal/helper');
    const { StripeHelper } = require('./payments/stripe');
    const { AccountDeleteManager } = require('./account-delete');

    jest.clearAllMocks();
    isActiveStub.mockReset();

    // Set up mock auth models on the mocked module
    const authModels = require('fxa-shared/db/models/auth');
    mockAuthModels = authModels;
    mockAuthModels.getAllPayPalBAByUid = jest.fn(async () => {
      return [{ status: 'Active', billingAgreementId: 'B-test' }];
    });
    mockAuthModels.deleteAllPayPalBAs = jest.fn(async () => {});
    mockAuthModels.getAccountCustomerByUid = jest.fn(
      async (..._args: any[]) => {
        return { stripeCustomerId: 'cus_993' };
      }
    );

    mockFxaDb = {
      ...mocks.mockDB({ email, emailVerified: true, uid }),
      fetchAccountSubscriptions: jest.fn(
        async (_uid: string) => expectedSubscriptions
      ),
    };
    mockOAuthDb = {};
    mockPush = mocks.mockPush();
    mockPushbox = mocks.mockPushbox();
    mockStatsd = { increment: jest.fn() };
    mockGlean = mocks.mockGlean();
    mockMailer = mocks.mockMailer();
    mockStripeHelper = {};
    mockLog = mocks.mockLog();
    mockAppleIap = {
      purchaseManager: {
        deletePurchases: jest.fn().mockResolvedValue(undefined),
      },
    };
    mockPlayBilling = {
      purchaseManager: {
        deletePurchases: jest.fn().mockResolvedValue(undefined),
      },
    };

    mockConfig = {
      apiVersion: 1,
      cloudTasks: mocks.mockCloudTasksConfig,
      publicUrl: 'https://tasks.example.io',
      subscriptions: {
        enabled: true,
        paypalNvpSigCredentials: {
          enabled: true,
        },
      },
      domain: 'wibble',
    };
    Container.set(AppConfig, mockConfig);

    mockStripeHelper = mocks.mockStripeHelper([
      'removeCustomer',
      'removeFirestoreCustomer',
    ]);
    mockStripeHelper.removeCustomer = jest.fn().mockResolvedValue(undefined);
    mockStripeHelper.removeFirestoreCustomer = jest
      .fn()
      .mockResolvedValue(undefined);
    mockStripeHelper.fetchInvoicesForActiveSubscriptions = jest
      .fn()
      .mockResolvedValue(undefined);
    mockStripeHelper.refundInvoices = jest.fn().mockResolvedValue(undefined);
    mockPaypalHelper = mocks.mockPayPalHelper(['cancelBillingAgreement']);
    mockPaypalHelper.cancelBillingAgreement = jest
      .fn()
      .mockResolvedValue(undefined);
    mockPaypalHelper.refundInvoices = jest.fn().mockResolvedValue(undefined);

    mockOAuthDb = {
      removeTokensAndCodes: jest.fn().mockResolvedValue(undefined),
      removePublicAndCanGrantTokens: jest.fn().mockResolvedValue(undefined),
    };

    Container.set(StripeHelper, mockStripeHelper);
    Container.set(PayPalHelper, mockPaypalHelper);
    Container.set(AuthLogger, mockLog);
    Container.set(AppConfig, mockConfig);
    Container.set(AppleIAP, mockAppleIap);
    Container.set(PlayBilling, mockPlayBilling);

    accountDeleteManager = new AccountDeleteManager({
      fxaDb: mockFxaDb,
      oauthDb: mockOAuthDb,
      config: mockConfig,
      push: mockPush,
      pushbox: mockPushbox,
      statsd: mockStatsd,
      mailer: mockMailer,
      glean: mockGlean,
      log: mockLog,
    });
  });

  afterEach(() => {
    Container.reset();
    jest.clearAllMocks();
  });

  it('can be instantiated', () => {
    expect(accountDeleteManager).toBeTruthy();
  });

  describe('delete account', () => {
    it('should delete the account', async () => {
      mockPush.notifyAccountDestroyed = jest.fn().mockResolvedValue(undefined);
      mockFxaDb.devices = jest.fn().mockResolvedValue(['test123', 'test456']);
      await accountDeleteManager.deleteAccount(uid, deleteReason);

      expect(mockFxaDb.deleteAccount).toHaveBeenCalledWith(
        expect.objectContaining({ uid })
      );
      expect(mockStripeHelper.removeCustomer).toHaveBeenCalledTimes(1);
      expect(mockStripeHelper.removeCustomer).toHaveBeenCalledWith(uid, {
        cancellation_reason: deleteReason,
      });
      expect(mockStripeHelper.removeFirestoreCustomer).toHaveBeenCalledTimes(1);
      expect(mockStripeHelper.removeFirestoreCustomer).toHaveBeenCalledWith(
        uid
      );

      expect(mockAuthModels.getAllPayPalBAByUid).toHaveBeenCalledTimes(1);
      expect(mockAuthModels.getAllPayPalBAByUid).toHaveBeenCalledWith(uid);
      expect(mockPaypalHelper.cancelBillingAgreement).toHaveBeenCalledTimes(1);
      expect(mockPaypalHelper.cancelBillingAgreement).toHaveBeenCalledWith(
        'B-test'
      );
      expect(mockAuthModels.deleteAllPayPalBAs).toHaveBeenCalledTimes(1);
      expect(mockAuthModels.deleteAllPayPalBAs).toHaveBeenCalledWith(uid);
      expect(
        mockAppleIap.purchaseManager.deletePurchases
      ).toHaveBeenCalledTimes(1);
      expect(mockAppleIap.purchaseManager.deletePurchases).toHaveBeenCalledWith(
        uid
      );
      expect(
        mockPlayBilling.purchaseManager.deletePurchases
      ).toHaveBeenCalledTimes(1);
      expect(
        mockPlayBilling.purchaseManager.deletePurchases
      ).toHaveBeenCalledWith(uid);
      expect(mockPush.notifyAccountDestroyed).toHaveBeenCalledTimes(1);
      expect(mockPush.notifyAccountDestroyed).toHaveBeenCalledWith(uid, [
        'test123',
        'test456',
      ]);
      expect(mockPushbox.deleteAccount).toHaveBeenCalledTimes(1);
      expect(mockPushbox.deleteAccount).toHaveBeenCalledWith(uid);
      expect(mockOAuthDb.removeTokensAndCodes).toHaveBeenCalledTimes(1);
      expect(mockOAuthDb.removeTokensAndCodes).toHaveBeenCalledWith(uid);
      expect(mockLog.activityEvent).toHaveBeenCalledTimes(1);
      expect(mockLog.activityEvent).toHaveBeenCalledWith({
        uid,
        email,
        emailVerified: true,
        event: 'account.deleted',
      });
    });

    it('should delete even if already deleted from fxa db', async () => {
      const unknownError = AppError.unknownAccount('test@email.com');
      mockFxaDb.account = jest.fn().mockRejectedValue(unknownError);
      mockPush.notifyAccountDestroyed = jest.fn().mockResolvedValue(undefined);
      await accountDeleteManager.deleteAccount(uid, deleteReason);
      expect(mockStripeHelper.removeCustomer.mock.calls[0][0]).toBe(uid);
      expect(mockPush.notifyAccountDestroyed).toHaveBeenCalledTimes(0);
      expect(mockFxaDb.deleteAccount).toHaveBeenCalledTimes(0);
      expect(mockLog.activityEvent).toHaveBeenCalledTimes(0);
    });

    it('does not fail if pushbox fails to delete', async () => {
      mockPushbox.deleteAccount = jest.fn().mockRejectedValue(undefined);
      await expect(
        accountDeleteManager.deleteAccount(uid, deleteReason)
      ).resolves.not.toThrow();
    });

    it('should fail if stripeHelper update customer fails', async () => {
      mockStripeHelper.removeCustomer.mockImplementation(async () => {
        throw new Error('wibble');
      });
      try {
        await accountDeleteManager.deleteAccount(uid, deleteReason);
        throw new Error('method should throw an error');
      } catch (err: any) {
        expect(typeof err).toBe('object');
      }
    });

    it('should fail if paypalHelper cancel billing agreement fails', async () => {
      mockPaypalHelper.cancelBillingAgreement.mockImplementation(async () => {
        throw new Error('wibble');
      });
      try {
        await accountDeleteManager.deleteAccount(uid, deleteReason);
        throw new Error('method should throw an error');
      } catch (err: any) {
        expect(typeof err).toBe('object');
      }
    });

    describe('scheduled inactive account deletion', () => {
      it('should skip if the account is active', async () => {
        isActiveStub.mockResolvedValue(true);
        await accountDeleteManager.deleteAccount(
          uid,
          ReasonForDeletion.InactiveAccountScheduled
        );
        expect(mockFxaDb.deleteAccount).not.toHaveBeenCalled();
        expect(
          mockGlean.inactiveAccountDeletion.deletionSkipped
        ).toHaveBeenCalledTimes(1);
        expect(mockStatsd.increment).toHaveBeenCalledTimes(1);
        expect(mockStatsd.increment).toHaveBeenCalledWith(
          'account.inactive.deletion.skipped.active'
        );
      });

      it('should delete the inactive account', async () => {
        isActiveStub.mockResolvedValue(false);
        await accountDeleteManager.deleteAccount(
          uid,
          ReasonForDeletion.InactiveAccountScheduled
        );
        expect(mockFxaDb.deleteAccount).toHaveBeenCalledWith(
          expect.objectContaining({ uid })
        );
        expect(mockLog.info).toHaveBeenCalledTimes(1);
        expect(mockLog.info).toHaveBeenCalledWith(
          'accountDeleted.byCloudTask',
          { uid }
        );
      });
    });
  });

  describe('quickDelete', () => {
    it('should delete the account', async () => {
      await accountDeleteManager.quickDelete(uid, deleteReason);

      expect(mockFxaDb.deleteAccount).toHaveBeenCalledWith(
        expect.objectContaining({ uid })
      );
      expect(mockOAuthDb.removeTokensAndCodes).toHaveBeenCalledTimes(1);
      expect(mockOAuthDb.removeTokensAndCodes).toHaveBeenCalledWith(uid);
    });

    it('should error if its not user requested', async () => {
      try {
        await accountDeleteManager.quickDelete(uid, 'not_user_requested');
        throw new Error('method should throw an error');
      } catch (err: any) {
        expect(err.message).toMatch(/^quickDelete only supports user/);
      }
    });
  });

  describe('refundSubscriptions', () => {
    it('returns immediately when delete reason is not for unverified account', async () => {
      await accountDeleteManager.refundSubscriptions('invalid_reason');
      expect(
        mockStripeHelper.fetchInvoicesForActiveSubscriptions
      ).not.toHaveBeenCalled();
    });

    it('returns if no invoices are found', async () => {
      mockStripeHelper.fetchInvoicesForActiveSubscriptions.mockResolvedValue(
        []
      );
      await accountDeleteManager.refundSubscriptions(
        'fxa_unverified_account_delete',
        'customerid'
      );
      expect(
        mockStripeHelper.fetchInvoicesForActiveSubscriptions
      ).toHaveBeenCalledTimes(1);
      expect(
        mockStripeHelper.fetchInvoicesForActiveSubscriptions
      ).toHaveBeenCalledWith('customerid', 'paid', undefined);
      expect(mockStripeHelper.refundInvoices).not.toHaveBeenCalled();
    });

    it('attempts refunds on invoices created within refundPeriod', async () => {
      mockStripeHelper.fetchInvoicesForActiveSubscriptions.mockResolvedValue(
        []
      );
      await accountDeleteManager.refundSubscriptions(
        'fxa_unverified_account_delete',
        'customerid',
        34
      );
      expect(
        mockStripeHelper.fetchInvoicesForActiveSubscriptions
      ).toHaveBeenCalledTimes(1);
      expect(
        mockStripeHelper.fetchInvoicesForActiveSubscriptions
      ).toHaveBeenCalledWith('customerid', 'paid', expect.any(Date));
      expect(
        mockStripeHelper.fetchInvoicesForActiveSubscriptions
      ).toHaveBeenCalledTimes(1);
      expect(mockStripeHelper.refundInvoices).not.toHaveBeenCalled();
    });

    it('attempts refunds on invoices', async () => {
      const expectedInvoices = ['invoice1', 'invoice2'];
      const expectedRefundResult = [
        {
          invoiceId: 'id1',
          priceId: 'priceId1',
          total: '123',
          currency: 'usd',
        },
      ];
      mockStripeHelper.fetchInvoicesForActiveSubscriptions.mockResolvedValue(
        expectedInvoices
      );
      mockStripeHelper.refundInvoices.mockResolvedValue(expectedRefundResult);
      await accountDeleteManager.refundSubscriptions(
        'fxa_unverified_account_delete',
        'customerId'
      );
      expect(mockStripeHelper.refundInvoices).toHaveBeenCalledTimes(1);
      expect(mockStripeHelper.refundInvoices).toHaveBeenCalledWith(
        expectedInvoices
      );
      expect(mockPaypalHelper.refundInvoices).toHaveBeenCalledTimes(1);
      expect(mockPaypalHelper.refundInvoices).toHaveBeenCalledWith(
        expectedInvoices
      );
    });

    it('rejects on refundInvoices handler exception', async () => {
      const expectedInvoices = ['invoice1', 'invoice2'];
      const expectedError = new Error('expected');
      mockStripeHelper.fetchInvoicesForActiveSubscriptions.mockResolvedValue(
        expectedInvoices
      );
      mockStripeHelper.refundInvoices.mockRejectedValue(expectedError);
      try {
        await accountDeleteManager.refundSubscriptions(
          'fxa_unverified_account_delete',
          'customerId'
        );
        throw new Error('expecting refundSubscriptions exception');
      } catch (error: any) {
        expect(mockStripeHelper.refundInvoices).toHaveBeenCalledTimes(1);
        expect(mockStripeHelper.refundInvoices).toHaveBeenCalledWith(
          expectedInvoices
        );
        expect(mockPaypalHelper.refundInvoices).toHaveBeenCalledTimes(1);
        expect(mockPaypalHelper.refundInvoices).toHaveBeenCalledWith(
          expectedInvoices
        );
        expect(error).toEqual(expectedError);
      }
    });
  });
});
