/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';
import Container from 'typedi';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '@fxa/accounts/errors';
import { AppleIAP } from './payments/iap/apple-app-store/apple-iap';
import { PlayBilling } from './payments/iap/google-play/play-billing';
import { ReasonForDeletion } from '@fxa/shared/cloud-tasks';
import { AppConfig, AuthLogger } from './types';

const mocks = require('../test/mocks');

const isActiveStub = sinon.stub();

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
  const sandbox = sinon.createSandbox();

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

    sandbox.reset();
    isActiveStub.reset();

    // Set up mock auth models on the mocked module
    const authModels = require('fxa-shared/db/models/auth');
    mockAuthModels = authModels;
    mockAuthModels.getAllPayPalBAByUid = sinon.spy(async () => {
      return [{ status: 'Active', billingAgreementId: 'B-test' }];
    });
    mockAuthModels.deleteAllPayPalBAs = sinon.spy(async () => {});
    mockAuthModels.getAccountCustomerByUid = sinon.spy(
      async (..._args: any[]) => {
        return { stripeCustomerId: 'cus_993' };
      }
    );

    mockFxaDb = {
      ...mocks.mockDB({ email, emailVerified: true, uid }),
      fetchAccountSubscriptions: sinon.spy(
        async (_uid: string) => expectedSubscriptions
      ),
    };
    mockOAuthDb = {};
    mockPush = mocks.mockPush();
    mockPushbox = mocks.mockPushbox();
    mockStatsd = { increment: sandbox.stub() };
    mockGlean = mocks.mockGlean();
    mockMailer = mocks.mockMailer();
    mockStripeHelper = {};
    mockLog = mocks.mockLog();
    mockAppleIap = {
      purchaseManager: {
        deletePurchases: sinon.fake.resolves(undefined),
      },
    };
    mockPlayBilling = {
      purchaseManager: {
        deletePurchases: sinon.fake.resolves(undefined),
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
    mockStripeHelper.removeCustomer = sandbox.stub().resolves();
    mockStripeHelper.removeFirestoreCustomer = sandbox.stub().resolves();
    mockStripeHelper.fetchInvoicesForActiveSubscriptions = sandbox
      .stub()
      .resolves();
    mockStripeHelper.refundInvoices = sandbox.stub().resolves();
    mockPaypalHelper = mocks.mockPayPalHelper(['cancelBillingAgreement']);
    mockPaypalHelper.cancelBillingAgreement = sandbox.stub().resolves();
    mockPaypalHelper.refundInvoices = sandbox.stub().resolves();

    mockOAuthDb = {
      removeTokensAndCodes: sinon.fake.resolves(undefined),
      removePublicAndCanGrantTokens: sinon.fake.resolves(undefined),
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
    sandbox.reset();
  });

  it('can be instantiated', () => {
    expect(accountDeleteManager).toBeTruthy();
  });

  describe('delete account', () => {
    it('should delete the account', async () => {
      mockPush.notifyAccountDestroyed = sinon.fake.resolves(undefined);
      mockFxaDb.devices = sinon.fake.resolves(['test123', 'test456']);
      await accountDeleteManager.deleteAccount(uid, deleteReason);

      sinon.assert.calledWithMatch(mockFxaDb.deleteAccount, { uid });
      sinon.assert.calledOnceWithExactly(mockStripeHelper.removeCustomer, uid, {
        cancellation_reason: deleteReason,
      });
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.removeFirestoreCustomer,
        uid
      );

      sinon.assert.calledOnceWithExactly(
        mockAuthModels.getAllPayPalBAByUid,
        uid
      );
      sinon.assert.calledOnceWithExactly(
        mockPaypalHelper.cancelBillingAgreement,
        'B-test'
      );
      sinon.assert.calledOnceWithExactly(
        mockAuthModels.deleteAllPayPalBAs,
        uid
      );
      sinon.assert.calledOnceWithExactly(
        mockAppleIap.purchaseManager.deletePurchases,
        uid
      );
      sinon.assert.calledOnceWithExactly(
        mockPlayBilling.purchaseManager.deletePurchases,
        uid
      );
      sinon.assert.calledOnceWithExactly(mockPush.notifyAccountDestroyed, uid, [
        'test123',
        'test456',
      ]);
      sinon.assert.calledOnceWithExactly(mockPushbox.deleteAccount, uid);
      sinon.assert.calledOnceWithExactly(mockOAuthDb.removeTokensAndCodes, uid);
      sinon.assert.calledOnceWithExactly(mockLog.activityEvent, {
        uid,
        email,
        emailVerified: true,
        event: 'account.deleted',
      });
    });

    it('should delete even if already deleted from fxa db', async () => {
      const unknownError = AppError.unknownAccount('test@email.com');
      mockFxaDb.account = sinon.fake.rejects(unknownError);
      mockPush.notifyAccountDestroyed = sinon.fake.resolves(undefined);
      await accountDeleteManager.deleteAccount(uid, deleteReason);
      sinon.assert.calledWithMatch(mockStripeHelper.removeCustomer, uid);
      sinon.assert.callCount(mockPush.notifyAccountDestroyed, 0);
      sinon.assert.callCount(mockFxaDb.deleteAccount, 0);
      sinon.assert.callCount(mockLog.activityEvent, 0);
    });

    it('does not fail if pushbox fails to delete', async () => {
      mockPushbox.deleteAccount = sinon.fake.rejects(undefined);
      await expect(
        accountDeleteManager.deleteAccount(uid, deleteReason)
      ).resolves.not.toThrow();
    });

    it('should fail if stripeHelper update customer fails', async () => {
      mockStripeHelper.removeCustomer(async () => {
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
      mockPaypalHelper.cancelBillingAgreement(async () => {
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
        isActiveStub.resolves(true);
        await accountDeleteManager.deleteAccount(
          uid,
          ReasonForDeletion.InactiveAccountScheduled
        );
        sinon.assert.notCalled(mockFxaDb.deleteAccount);
        sinon.assert.calledOnce(
          mockGlean.inactiveAccountDeletion.deletionSkipped
        );
        sinon.assert.calledOnceWithExactly(
          mockStatsd.increment,
          'account.inactive.deletion.skipped.active'
        );
      });

      it('should delete the inactive account', async () => {
        isActiveStub.resolves(false);
        await accountDeleteManager.deleteAccount(
          uid,
          ReasonForDeletion.InactiveAccountScheduled
        );
        sinon.assert.calledWithMatch(mockFxaDb.deleteAccount, { uid });
        sinon.assert.calledOnceWithExactly(
          mockLog.info,
          'accountDeleted.byCloudTask',
          { uid }
        );
      });
    });
  });

  describe('quickDelete', () => {
    it('should delete the account', async () => {
      await accountDeleteManager.quickDelete(uid, deleteReason);

      sinon.assert.calledWithMatch(mockFxaDb.deleteAccount, { uid });
      sinon.assert.calledOnceWithExactly(mockOAuthDb.removeTokensAndCodes, uid);
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
      sinon.assert.notCalled(
        mockStripeHelper.fetchInvoicesForActiveSubscriptions
      );
    });

    it('returns if no invoices are found', async () => {
      mockStripeHelper.fetchInvoicesForActiveSubscriptions.resolves([]);
      await accountDeleteManager.refundSubscriptions(
        'fxa_unverified_account_delete',
        'customerid'
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.fetchInvoicesForActiveSubscriptions,
        'customerid',
        'paid',
        undefined
      );
      sinon.assert.notCalled(mockStripeHelper.refundInvoices);
    });

    it('attempts refunds on invoices created within refundPeriod', async () => {
      mockStripeHelper.fetchInvoicesForActiveSubscriptions.resolves([]);
      await accountDeleteManager.refundSubscriptions(
        'fxa_unverified_account_delete',
        'customerid',
        34
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.fetchInvoicesForActiveSubscriptions,
        'customerid',
        'paid',
        sinon.match.date
      );
      sinon.assert.calledOnce(
        mockStripeHelper.fetchInvoicesForActiveSubscriptions
      );
      sinon.assert.notCalled(mockStripeHelper.refundInvoices);
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
      mockStripeHelper.fetchInvoicesForActiveSubscriptions.resolves(
        expectedInvoices
      );
      mockStripeHelper.refundInvoices.resolves(expectedRefundResult);
      await accountDeleteManager.refundSubscriptions(
        'fxa_unverified_account_delete',
        'customerId'
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.refundInvoices,
        expectedInvoices
      );
      sinon.assert.calledOnceWithExactly(
        mockPaypalHelper.refundInvoices,
        expectedInvoices
      );
    });

    it('rejects on refundInvoices handler exception', async () => {
      const expectedInvoices = ['invoice1', 'invoice2'];
      const expectedError = new Error('expected');
      mockStripeHelper.fetchInvoicesForActiveSubscriptions.resolves(
        expectedInvoices
      );
      mockStripeHelper.refundInvoices.rejects(expectedError);
      try {
        await accountDeleteManager.refundSubscriptions(
          'fxa_unverified_account_delete',
          'customerId'
        );
        throw new Error('expecting refundSubscriptions exception');
      } catch (error: any) {
        sinon.assert.calledOnceWithExactly(
          mockStripeHelper.refundInvoices,
          expectedInvoices
        );
        sinon.assert.calledOnceWithExactly(
          mockPaypalHelper.refundInvoices,
          expectedInvoices
        );
        expect(error).toEqual(expectedError);
      }
    });
  });
});
