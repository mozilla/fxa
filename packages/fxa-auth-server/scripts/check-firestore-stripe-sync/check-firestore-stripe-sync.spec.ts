/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Container from 'typedi';

import { ConfigType } from '../../config';
import { AppConfig, AuthFirestore } from '../../lib/types';

import { FirestoreStripeSyncChecker } from './check-firestore-stripe-sync';
import Stripe from 'stripe';
import { StripeHelper } from '../../lib/payments/stripe';

import customer1 from '../../test/local/payments/fixtures/stripe/customer1.json';
import subscription1 from '../../test/local/payments/fixtures/stripe/subscription1.json';

const mockCustomer = customer1 as unknown as Stripe.Customer;
const mockSubscription = subscription1 as unknown as Stripe.Subscription;

const mockConfig = {
  authFirestore: {
    prefix: 'mock-fxa-',
  },
} as unknown as ConfigType;

describe('FirestoreStripeSyncChecker', () => {
  let syncChecker: FirestoreStripeSyncChecker;
  let stripeStub: Stripe;
  let stripeHelperStub: StripeHelper;
  let firestoreStub: any;
  let logStub: any;

  beforeEach(() => {
    firestoreStub = {
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn(),
        }),
      }),
    };

    Container.set(AuthFirestore, firestoreStub);
    Container.set(AppConfig, mockConfig);

    stripeStub = {
      on: jest.fn(),
      customers: {
        list: jest.fn(),
        update: jest.fn(),
      },
    } as unknown as Stripe;

    stripeHelperStub = {
      stripe: stripeStub,
    } as unknown as StripeHelper;

    logStub = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    syncChecker = new FirestoreStripeSyncChecker(stripeHelperStub, 20, logStub);
  });

  afterEach(() => {
    Container.reset();
  });

  describe('run', () => {
    let autoPagingEachStub: jest.Mock;
    let checkCustomerSyncStub: jest.Mock;

    beforeEach(async () => {
      autoPagingEachStub = jest
        .fn()
        .mockImplementation(async (callback: any) => {
          await callback(mockCustomer);
        });

      stripeStub.customers.list = jest.fn().mockReturnValue({
        autoPagingEach: autoPagingEachStub,
      }) as any;

      checkCustomerSyncStub = jest.fn().mockResolvedValue(undefined);
      syncChecker.checkCustomerSync = checkCustomerSyncStub;

      await syncChecker.run();
    });

    it('calls Stripe customers.list', () => {
      expect(stripeStub.customers.list as any).toHaveBeenCalledWith({
        limit: 25,
      });
    });

    it('calls autoPagingEach to iterate through all customers', () => {
      expect(autoPagingEachStub).toHaveBeenCalledTimes(1);
    });

    it('checks sync for each customer', () => {
      expect(checkCustomerSyncStub).toHaveBeenCalledTimes(1);
      expect(checkCustomerSyncStub).toHaveBeenCalledWith(mockCustomer);
    });

    it('logs summary', () => {
      expect(logStub.info).toHaveBeenCalledWith(
        'firestore-stripe-sync-check-complete',
        expect.any(Object)
      );
    });
  });

  describe('checkCustomerSync', () => {
    let checkSubscriptionSyncStub: jest.Mock;

    beforeEach(() => {
      checkSubscriptionSyncStub = jest.fn().mockResolvedValue(undefined);
    });

    describe('customer in sync', () => {
      const mockFirestoreCustomer = Object.assign({}, mockCustomer);

      beforeEach(async () => {
        const collectionStub = jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              exists: true,
              data: jest.fn().mockReturnValue(mockFirestoreCustomer),
            }),
            collection: jest.fn().mockReturnValue({
              doc: jest.fn().mockReturnValue({
                get: jest.fn().mockResolvedValue({
                  exists: true,
                  data: jest.fn().mockReturnValue({ status: 'active' }),
                }),
              }),
            }),
          }),
        });

        firestoreStub.collection = collectionStub;
        Container.set(AuthFirestore, firestoreStub);

        stripeStub.subscriptions = {
          list: jest.fn().mockResolvedValue({
            data: [mockSubscription],
          }),
        } as any;

        syncChecker = new FirestoreStripeSyncChecker(
          stripeHelperStub,
          20,
          logStub
        );
        syncChecker.checkSubscriptionSync = checkSubscriptionSyncStub;

        await syncChecker.checkCustomerSync(mockCustomer);
      });

      it('checks subscription sync', () => {
        expect(checkSubscriptionSyncStub).toHaveBeenCalledWith(
          mockCustomer.id,
          mockCustomer.metadata.userid,
          mockSubscription
        );
      });

      it('does not log out of sync', () => {
        expect(logStub.warn).not.toHaveBeenCalled();
      });
    });

    describe('customer missing in Firestore', () => {
      let handleOutOfSyncStub: jest.Mock;

      beforeEach(async () => {
        const collectionStub = jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              exists: false,
            }),
          }),
        });

        firestoreStub.collection = collectionStub;
        Container.set(AuthFirestore, firestoreStub);

        handleOutOfSyncStub = jest.fn();

        syncChecker = new FirestoreStripeSyncChecker(
          stripeHelperStub,
          20,
          logStub
        );
        syncChecker.handleOutOfSync = handleOutOfSyncStub;

        await syncChecker.checkCustomerSync(mockCustomer);
      });

      it('handles out of sync', () => {
        expect(handleOutOfSyncStub).toHaveBeenCalledWith(
          mockCustomer.id,
          'Customer exists in Stripe but not in Firestore',
          'customer_missing'
        );
      });
    });

    describe('customer metadata mismatch', () => {
      let handleOutOfSyncStub: jest.Mock;
      const mismatchedFirestoreCustomer = {
        email: 'different@example.com',
        created: mockCustomer.created,
      };

      beforeEach(async () => {
        const collectionStub = jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              exists: true,
              data: jest.fn().mockReturnValue(mismatchedFirestoreCustomer),
            }),
          }),
        });

        firestoreStub.collection = collectionStub;
        Container.set(AuthFirestore, firestoreStub);

        handleOutOfSyncStub = jest.fn();

        syncChecker = new FirestoreStripeSyncChecker(
          stripeHelperStub,
          20,
          logStub
        );
        syncChecker.handleOutOfSync = handleOutOfSyncStub;

        await syncChecker.checkCustomerSync(mockCustomer);
      });

      it('handles out of sync', () => {
        expect(handleOutOfSyncStub).toHaveBeenCalledWith(
          mockCustomer.id,
          'Customer mismatch',
          'customer_mismatch'
        );
      });
    });

    describe('deleted customer', () => {
      beforeEach(async () => {
        const deletedCustomer = {
          id: mockCustomer.id,
          deleted: true,
        };

        await syncChecker.checkCustomerSync(deletedCustomer as any);
      });

      it('skips deleted customers', () => {
        expect(syncChecker['customersCheckedCount']).toBe(0);
      });
    });

    describe('error checking customer', () => {
      beforeEach(async () => {
        firestoreStub.collection = jest.fn().mockReturnValue({
          doc: jest.fn().mockImplementation(() => {
            throw new Error('Firestore error');
          }),
        });

        await syncChecker.checkCustomerSync(mockCustomer);
      });

      it('logs error', () => {
        expect(logStub.error).toHaveBeenCalledWith(
          'error-checking-customer',
          expect.any(Object)
        );
      });
    });
  });

  describe('checkSubscriptionSync', () => {
    let handleOutOfSyncStub: jest.Mock;

    const mockFirestoreSubscription = Object.assign({}, mockSubscription);

    beforeEach(() => {
      handleOutOfSyncStub = jest.fn();
      syncChecker.handleOutOfSync = handleOutOfSyncStub;
    });

    describe('subscription in sync', () => {
      beforeEach(async () => {
        const collectionStub = jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({
            collection: jest.fn().mockReturnValue({
              doc: jest.fn().mockReturnValue({
                get: jest.fn().mockResolvedValue({
                  exists: true,
                  data: jest.fn().mockReturnValue(mockFirestoreSubscription),
                }),
              }),
            }),
          }),
        });

        firestoreStub.collection = collectionStub;
        Container.set(AuthFirestore, firestoreStub);

        // Recreate syncChecker with new firestore stub
        syncChecker = new FirestoreStripeSyncChecker(
          stripeHelperStub,
          20,
          logStub
        );
        syncChecker.handleOutOfSync = handleOutOfSyncStub;

        await syncChecker.checkSubscriptionSync(
          mockCustomer.id,
          mockCustomer.metadata.userid,
          mockSubscription
        );
      });

      it('does not call handleOutOfSync', () => {
        expect(handleOutOfSyncStub).not.toHaveBeenCalled();
      });
    });

    describe('subscription missing in Firestore', () => {
      beforeEach(async () => {
        const collectionStub = jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({
            collection: jest.fn().mockReturnValue({
              doc: jest.fn().mockReturnValue({
                get: jest.fn().mockResolvedValue({
                  exists: false,
                }),
              }),
            }),
          }),
        });

        firestoreStub.collection = collectionStub;
        Container.set(AuthFirestore, firestoreStub);

        // Recreate syncChecker with new firestore stub
        syncChecker = new FirestoreStripeSyncChecker(
          stripeHelperStub,
          20,
          logStub
        );
        syncChecker.handleOutOfSync = handleOutOfSyncStub;

        await syncChecker.checkSubscriptionSync(
          mockCustomer.id,
          mockCustomer.metadata.userid,
          mockSubscription
        );
      });

      it('handles out of sync', () => {
        expect(handleOutOfSyncStub).toHaveBeenCalledWith(
          mockCustomer.id,
          'Subscription exists in Stripe but not in Firestore',
          'subscription_missing',
          mockSubscription.id
        );
      });
    });

    describe('subscription data mismatch', () => {
      beforeEach(async () => {
        const mismatchedSubscription = {
          ...mockFirestoreSubscription,
          status: 'canceled',
        };

        const collectionStub = jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({
            collection: jest.fn().mockReturnValue({
              doc: jest.fn().mockReturnValue({
                get: jest.fn().mockResolvedValue({
                  exists: true,
                  data: jest.fn().mockReturnValue(mismatchedSubscription),
                }),
              }),
            }),
          }),
        });

        firestoreStub.collection = collectionStub;
        Container.set(AuthFirestore, firestoreStub);

        // Recreate syncChecker with new firestore stub
        syncChecker = new FirestoreStripeSyncChecker(
          stripeHelperStub,
          20,
          logStub
        );
        syncChecker.handleOutOfSync = handleOutOfSyncStub;

        await syncChecker.checkSubscriptionSync(
          mockCustomer.id,
          mockCustomer.metadata.userid,
          mockSubscription
        );
      });

      it('handles out of sync', () => {
        expect(handleOutOfSyncStub).toHaveBeenCalledWith(
          mockCustomer.id,
          'Subscription data mismatch',
          'subscription_mismatch',
          mockSubscription.id
        );
      });
    });
  });

  describe('isCustomerInSync', () => {
    it('returns true when customer data matches', () => {
      const firestoreCustomer = Object.assign({}, mockCustomer);

      const result = syncChecker.isCustomerInSync(
        firestoreCustomer,
        mockCustomer
      );
      expect(result).toBe(true);
    });

    it('returns false when email differs', () => {
      const firestoreCustomer = {
        email: 'different@example.com',
        created: mockCustomer.created,
      };

      const result = syncChecker.isCustomerInSync(
        firestoreCustomer,
        mockCustomer
      );
      expect(result).toBe(false);
    });

    it('returns false when created timestamp differs', () => {
      const firestoreCustomer = {
        email: mockCustomer.email,
        created: 999999,
      };

      const result = syncChecker.isCustomerInSync(
        firestoreCustomer,
        mockCustomer
      );
      expect(result).toBe(false);
    });
  });

  describe('isSubscriptionInSync', () => {
    it('returns true when subscription data matches', () => {
      const firestoreSubscription = Object.assign({}, mockSubscription);

      const result = syncChecker.isSubscriptionInSync(
        firestoreSubscription,
        mockSubscription
      );
      expect(result).toBe(true);
    });

    it('returns false when status differs', () => {
      const firestoreSubscription = {
        status: 'canceled',
        current_period_end: mockSubscription.current_period_end,
        current_period_start: mockSubscription.current_period_start,
      };

      const result = syncChecker.isSubscriptionInSync(
        firestoreSubscription,
        mockSubscription
      );
      expect(result).toBe(false);
    });

    it('returns false when period end differs', () => {
      const firestoreSubscription = {
        status: mockSubscription.status,
        current_period_end: 999999,
        current_period_start: mockSubscription.current_period_start,
      };

      const result = syncChecker.isSubscriptionInSync(
        firestoreSubscription,
        mockSubscription
      );
      expect(result).toBe(false);
    });
  });

  describe('handleOutOfSync', () => {
    let triggerResyncStub: jest.Mock;

    beforeEach(() => {
      triggerResyncStub = jest.fn().mockResolvedValue(undefined);
      syncChecker.triggerResync = triggerResyncStub;
    });

    it('increments out of sync counter', () => {
      const initialCount = syncChecker['outOfSyncCount'];
      syncChecker.handleOutOfSync(
        mockCustomer.id,
        'Test reason',
        'customer_missing'
      );
      expect(syncChecker['outOfSyncCount']).toBe(initialCount + 1);
    });

    it('increments customer missing counter', () => {
      const initialCount = syncChecker['customersMissingInFirestore'];
      syncChecker.handleOutOfSync(
        mockCustomer.id,
        'Test reason',
        'customer_missing'
      );
      expect(syncChecker['customersMissingInFirestore']).toBe(initialCount + 1);
    });

    it('increments subscription missing counter', () => {
      const initialCount = syncChecker['subscriptionsMissingInFirestore'];
      syncChecker.handleOutOfSync(
        mockCustomer.id,
        'Test reason',
        'subscription_missing',
        mockSubscription.id
      );
      expect(syncChecker['subscriptionsMissingInFirestore']).toBe(
        initialCount + 1
      );
    });

    it('logs out-of-sync warning', () => {
      syncChecker.handleOutOfSync(
        mockCustomer.id,
        'Test reason',
        'customer_missing',
        mockSubscription.id
      );

      expect(logStub.warn).toHaveBeenCalledWith(
        'firestore-stripe-out-of-sync',
        {
          customerId: mockCustomer.id,
          subscriptionId: mockSubscription.id,
          reason: 'Test reason',
          type: 'customer_missing',
        }
      );
    });

    it('triggers resync', () => {
      syncChecker.handleOutOfSync(
        mockCustomer.id,
        'Test reason',
        'customer_missing'
      );
      expect(triggerResyncStub).toHaveBeenCalledWith(mockCustomer.id);
    });
  });

  describe('triggerResync', () => {
    it('updates customer metadata with forcedResyncAt', async () => {
      stripeStub.customers.update = jest.fn().mockResolvedValue(undefined);

      await syncChecker.triggerResync(mockCustomer.id);

      expect(stripeStub.customers.update as any).toHaveBeenCalledWith(
        mockCustomer.id,
        expect.objectContaining({
          metadata: {
            forcedResyncAt: expect.any(String),
          },
        })
      );
    });

    it('logs error on failure', async () => {
      stripeStub.customers.update = jest
        .fn()
        .mockRejectedValue(new Error('Update failed'));

      await syncChecker.triggerResync(mockCustomer.id);

      expect(logStub.error).toHaveBeenCalledWith(
        'failed-to-trigger-resync',
        expect.any(Object)
      );
    });
  });
});
