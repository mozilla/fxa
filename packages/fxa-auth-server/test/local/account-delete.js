/*  */ /* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const sinon = require('sinon');
const { assert } = require('chai');
const proxyquire = require('proxyquire');
const { default: Container } = require('typedi');
const { AppConfig, AuthLogger } = require('../../lib/types');
const mocks = require('../mocks');
const uuid = require('uuid');
const error = require('../../lib/error');
const {
  AppleIAP,
} = require('../../lib/payments/iap/apple-app-store/apple-iap');
const {
  PlayBilling,
} = require('../../lib/payments/iap/google-play/play-billing');

const email = 'foo@example.com';
const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
const expectedSubscriptions = [
  { uid, subscriptionId: '123' },
  { uid, subscriptionId: '456' },
  { uid, subscriptionId: '789' },
];
const deleteReason = 'fxa_user_requested_account_delete';

describe('AccountDeleteManager', function () {
  this.timeout(10000);

  const sandbox = sinon.createSandbox();

  let mockFxaDb;
  let mockOAuthDb;
  let mockPush;
  let mockPushbox;
  let mockStatsd;
  let mockStripeHelper;
  let mockPaypalHelper;
  let mockAppleIap;
  let mockPlayBilling;
  let mockLog;
  let mockConfig;
  let accountDeleteManager;
  let mockAuthModels;

  beforeEach(() => {
    const { PayPalHelper } = require('../../lib/payments/paypal/helper');
    const { StripeHelper } = require('../../lib/payments/stripe');

    sandbox.reset();
    mockFxaDb = {
      ...mocks.mockDB({ email: email, uid: uid }),
      fetchAccountSubscriptions: sinon.spy(
        async (uid) => expectedSubscriptions
      ),
    };
    mockOAuthDb = {};
    mockPush = mocks.mockPush();
    mockPushbox = mocks.mockPushbox();
    mockStatsd = { increment: sandbox.stub() };
    mockStripeHelper = {};
    mockLog = mocks.mockLog();
    mockAppleIap = {
      purchaseManager: {
        deletePurchases: sinon.fake.resolves(),
      },
    };
    mockPlayBilling = {
      purchaseManager: {
        deletePurchases: sinon.fake.resolves(),
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
    mockAuthModels = {};
    mockAuthModels.getAllPayPalBAByUid = sinon.spy(async () => {
      return [{ status: 'Active', billingAgreementId: 'B-test' }];
    });
    mockAuthModels.deleteAllPayPalBAs = sinon.spy(async () => {});
    mockAuthModels.getAccountCustomerByUid = sinon.spy(async (...args) => {
      return { stripeCustomerId: 'cus_993' };
    });

    mockOAuthDb = {
      removeTokensAndCodes: sinon.fake.resolves(),
      removePublicAndCanGrantTokens: sinon.fake.resolves(),
    };

    Container.set(StripeHelper, mockStripeHelper);
    Container.set(PayPalHelper, mockPaypalHelper);
    Container.set(AuthLogger, mockLog);
    Container.set(AppConfig, mockConfig);
    Container.set(AppleIAP, mockAppleIap);
    Container.set(PlayBilling, mockPlayBilling);

    const { AccountDeleteManager } = proxyquire('../../lib/account-delete', {
      'fxa-shared/db/models/auth': mockAuthModels,
    });

    accountDeleteManager = new AccountDeleteManager({
      fxaDb: mockFxaDb,
      oauthDb: mockOAuthDb,
      push: mockPush,
      pushbox: mockPushbox,
      statsd: mockStatsd,
    });
  });

  afterEach(() => {
    Container.reset();
    sandbox.reset();
  });

  it('can be instantiated', () => {
    assert.ok(accountDeleteManager);
  });

  describe('delete account', function () {
    it('should delete the account', async () => {
      mockPush.notifyAccountDestroyed = sinon.fake.resolves();
      mockFxaDb.devices = sinon.fake.resolves(['test123', 'test456']);
      await accountDeleteManager.deleteAccount(uid, deleteReason);

      sinon.assert.calledWithMatch(mockFxaDb.deleteAccount, {
        uid,
      });
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
        event: 'account.deleted',
      });
    });

    it('should delete even if already deleted from fxa db', async () => {
      const unkonwnError = error.unknownAccount('test@email.com');
      mockFxaDb.account = sinon.fake.rejects(unkonwnError);
      mockPush.notifyAccountDestroyed = sinon.fake.resolves();
      await accountDeleteManager.deleteAccount(uid, deleteReason);
      sinon.assert.calledWithMatch(mockStripeHelper.removeCustomer, uid);
      sinon.assert.callCount(mockPush.notifyAccountDestroyed, 0);
      sinon.assert.callCount(mockFxaDb.deleteAccount, 0);
      sinon.assert.callCount(mockLog.activityEvent, 0);
    });

    it('does not fail if pushbox fails to delete', async () => {
      mockPushbox.deleteAccount = sinon.fake.rejects();
      try {
        await accountDeleteManager.deleteAccount(uid, deleteReason);
      } catch (err) {
        assert.fail('no exception should have been thrown');
      }
    });

    it('should fail if stripeHelper update customer fails', async () => {
      mockStripeHelper.removeCustomer(async () => {
        throw new Error('wibble');
      });
      try {
        await accountDeleteManager.deleteAccount(uid, deleteReason);
        assert.fail('method should throw an error');
      } catch (err) {
        assert.isObject(err);
      }
    });

    it('should fail if paypalHelper cancel billing agreement fails', async () => {
      mockPaypalHelper.cancelBillingAgreement(async () => {
        throw new Error('wibble');
      });
      try {
        await accountDeleteManager.deleteAccount(uid, deleteReason);
        assert.fail('method should throw an error');
      } catch (err) {
        assert.isObject(err);
      }
    });
  });

  describe('quickDelete', () => {
    it('should delete the account', async () => {
      await accountDeleteManager.quickDelete(uid, deleteReason);

      sinon.assert.calledWithMatch(mockFxaDb.deleteAccount, {
        uid,
      });
      sinon.assert.calledOnceWithExactly(mockOAuthDb.removeTokensAndCodes, uid);
    });

    it('should error if its not user requested', async () => {
      try {
        await accountDeleteManager.quickDelete(uid, 'not_user_requested');
        assert.fail('method should throw an error');
      } catch (err) {
        assert.match(err.message, /^quickDelete only supports user/);
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
        assert.fail('expecting refundSubscriptions exception');
      } catch (error) {
        sinon.assert.calledOnceWithExactly(
          mockStripeHelper.refundInvoices,
          expectedInvoices
        );
        sinon.assert.calledOnceWithExactly(
          mockPaypalHelper.refundInvoices,
          expectedInvoices
        );
        assert.deepEqual(error, expectedError);
      }
    });
  });
});
