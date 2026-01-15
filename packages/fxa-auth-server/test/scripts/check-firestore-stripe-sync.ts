/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import sinon from 'sinon';
import { expect } from 'chai';
import Container from 'typedi';

import { ConfigType } from '../../config';
import { AppConfig, AuthFirestore } from '../../lib/types';

import { FirestoreStripeSyncChecker } from '../../scripts/check-firestore-stripe-sync/check-firestore-stripe-sync';
import Stripe from 'stripe';
import { StripeHelper } from '../../lib/payments/stripe';

import customer1 from '../local/payments/fixtures/stripe/customer1.json';
import subscription1 from '../local/payments/fixtures/stripe/subscription1.json';

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
      collection: sinon.stub().returns({
        doc: sinon.stub().returns({
          get: sinon.stub(),
        }),
      }),
    };

    Container.set(AuthFirestore, firestoreStub);
    Container.set(AppConfig, mockConfig);

    stripeStub = {
      on: sinon.stub(),
      customers: {
        list: sinon.stub(),
        update: sinon.stub(),
      },
    } as unknown as Stripe;

    stripeHelperStub = {
      stripe: stripeStub,
    } as unknown as StripeHelper;

    logStub = {
      info: sinon.stub(),
      warn: sinon.stub(),
      error: sinon.stub(),
    };

    syncChecker = new FirestoreStripeSyncChecker(
      stripeHelperStub,
      20,
      logStub
    );
  });

  afterEach(() => {
    Container.reset();
  });

  describe('run', () => {
    let autoPagingEachStub: sinon.SinonStub;
    let checkCustomerSyncStub: sinon.SinonStub;

    beforeEach(async () => {
      autoPagingEachStub = sinon.stub().callsFake(async (callback: any) => {
        await callback(mockCustomer);
      });

      stripeStub.customers.list = sinon.stub().returns({
        autoPagingEach: autoPagingEachStub,
      }) as any;

      checkCustomerSyncStub = sinon.stub().resolves();
      syncChecker.checkCustomerSync = checkCustomerSyncStub;

      await syncChecker.run();
    });

    it('calls Stripe customers.list', () => {
      sinon.assert.calledWith(stripeStub.customers.list as any, {
        limit: 25,
      });
    });

    it('calls autoPagingEach to iterate through all customers', () => {
      sinon.assert.calledOnce(autoPagingEachStub);
    });

    it('checks sync for each customer', () => {
      sinon.assert.calledOnce(checkCustomerSyncStub);
      sinon.assert.calledWith(checkCustomerSyncStub, mockCustomer);
    });

    it('logs summary', () => {
      sinon.assert.calledWith(logStub.info, 'firestore-stripe-sync-check-complete', sinon.match.object);
    });
  });

  describe('checkCustomerSync', () => {
    let checkSubscriptionSyncStub: sinon.SinonStub;

    beforeEach(() => {
      checkSubscriptionSyncStub = sinon.stub().resolves();
    });

    describe('customer in sync', () => {
      const mockFirestoreCustomer = Object.assign({}, mockCustomer);

      beforeEach(async () => {
        const collectionStub = sinon.stub().returns({
          doc: sinon.stub().returns({
            get: sinon.stub().resolves({
              exists: true,
              data: sinon.stub().returns(mockFirestoreCustomer),
            }),
            collection: sinon.stub().returns({
              doc: sinon.stub().returns({
                get: sinon.stub().resolves({
                  exists: true,
                  data: sinon.stub().returns({status: 'active'}),
                }),
              }),
            }),
          }),
        });

        firestoreStub.collection = collectionStub;
        Container.set(AuthFirestore, firestoreStub);

        stripeStub.subscriptions = {
          list: sinon.stub().resolves({
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
        sinon.assert.calledWith(checkSubscriptionSyncStub, mockCustomer.id, mockCustomer.metadata.userid, mockSubscription);
      });

      it('does not log out of sync', () => {
        sinon.assert.notCalled(logStub.warn);
      });
    });

    describe('customer missing in Firestore', () => {
      let handleOutOfSyncStub: sinon.SinonStub;

      beforeEach(async () => {
        const collectionStub = sinon.stub().returns({
          doc: sinon.stub().returns({
            get: sinon.stub().resolves({
              exists: false,
            }),
          }),
        });

        firestoreStub.collection = collectionStub;
        Container.set(AuthFirestore, firestoreStub);

        handleOutOfSyncStub = sinon.stub();

        syncChecker = new FirestoreStripeSyncChecker(
          stripeHelperStub,
          20,
          logStub
        );
        syncChecker.handleOutOfSync = handleOutOfSyncStub;

        await syncChecker.checkCustomerSync(mockCustomer);
      });

      it('handles out of sync', () => {
        sinon.assert.calledWith(handleOutOfSyncStub, mockCustomer.id, 'Customer exists in Stripe but not in Firestore', 'customer_missing');
      });
    });

    describe('customer metadata mismatch', () => {
      let handleOutOfSyncStub: sinon.SinonStub;
      const mismatchedFirestoreCustomer = {
        email: 'different@example.com',
        created: mockCustomer.created,
      };

      beforeEach(async () => {
        const collectionStub = sinon.stub().returns({
          doc: sinon.stub().returns({
            get: sinon.stub().resolves({
              exists: true,
              data: sinon.stub().returns(mismatchedFirestoreCustomer),
            }),
          }),
        });

        firestoreStub.collection = collectionStub;
        Container.set(AuthFirestore, firestoreStub);

        handleOutOfSyncStub = sinon.stub();

        syncChecker = new FirestoreStripeSyncChecker(
          stripeHelperStub,
          20,
          logStub
        );
        syncChecker.handleOutOfSync = handleOutOfSyncStub;

        await syncChecker.checkCustomerSync(mockCustomer);
      });

      it('handles out of sync', () => {
        sinon.assert.calledWith(handleOutOfSyncStub, mockCustomer.id, 'Customer mismatch', 'customer_mismatch');
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
        expect(syncChecker['customersCheckedCount']).eq(0);
      });
    });

    describe('error checking customer', () => {
      beforeEach(async () => {
        firestoreStub.collection = sinon.stub().returns({
          doc: sinon.stub().throws(new Error('Firestore error')),
        });

        await syncChecker.checkCustomerSync(mockCustomer);
      });

      it('logs error', () => {
        sinon.assert.calledWith(logStub.error, 'error-checking-customer', sinon.match.object);
      });
    });
  });

  describe('checkSubscriptionSync', () => {
    let handleOutOfSyncStub: sinon.SinonStub;

    const mockFirestoreSubscription = Object.assign({}, mockSubscription);

    beforeEach(() => {
      handleOutOfSyncStub = sinon.stub();
      syncChecker.handleOutOfSync = handleOutOfSyncStub;
    });

    describe('subscription in sync', () => {
      beforeEach(async () => {
        const collectionStub = sinon.stub().returns({
          doc: sinon.stub().returns({
            collection: sinon.stub().returns({
              doc: sinon.stub().returns({
                get: sinon.stub().resolves({
                  exists: true,
                  data: sinon.stub().returns(mockFirestoreSubscription),
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

        await syncChecker.checkSubscriptionSync(mockCustomer.id, mockCustomer.metadata.userid, mockSubscription);
      });

      it('does not call handleOutOfSync', () => {
        sinon.assert.notCalled(handleOutOfSyncStub);
      });
    });

    describe('subscription missing in Firestore', () => {
      beforeEach(async () => {
        const collectionStub = sinon.stub().returns({
          doc: sinon.stub().returns({
            collection: sinon.stub().returns({
              doc: sinon.stub().returns({
                get: sinon.stub().resolves({
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

        await syncChecker.checkSubscriptionSync(mockCustomer.id, mockCustomer.metadata.userid, mockSubscription);
      });

      it('handles out of sync', () => {
        sinon.assert.calledWith(handleOutOfSyncStub, mockCustomer.id, 'Subscription exists in Stripe but not in Firestore', 'subscription_missing', mockSubscription.id);
      });
    });

    describe('subscription data mismatch', () => {
      beforeEach(async () => {
        const mismatchedSubscription = {
          ...mockFirestoreSubscription,
          status: 'canceled',
        };

        const collectionStub = sinon.stub().returns({
          doc: sinon.stub().returns({
            collection: sinon.stub().returns({
              doc: sinon.stub().returns({
                get: sinon.stub().resolves({
                  exists: true,
                  data: sinon.stub().returns(mismatchedSubscription),
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

        await syncChecker.checkSubscriptionSync(mockCustomer.id, mockCustomer.metadata.userid, mockSubscription);
      });

      it('handles out of sync', () => {
        sinon.assert.calledWith(handleOutOfSyncStub, mockCustomer.id, 'Subscription data mismatch', 'subscription_mismatch', mockSubscription.id);
      });
    });
  });

  describe('isCustomerInSync', () => {
    it('returns true when customer data matches', () => {
      const firestoreCustomer = Object.assign({}, mockCustomer);

      const result = syncChecker.isCustomerInSync(firestoreCustomer, mockCustomer);
      expect(result).true;
    });

    it('returns false when email differs', () => {
      const firestoreCustomer = {
        email: 'different@example.com',
        created: mockCustomer.created,
      };

      const result = syncChecker.isCustomerInSync(firestoreCustomer, mockCustomer);
      expect(result).false;
    });

    it('returns false when created timestamp differs', () => {
      const firestoreCustomer = {
        email: mockCustomer.email,
        created: 999999,
      };

      const result = syncChecker.isCustomerInSync(firestoreCustomer, mockCustomer);
      expect(result).false;
    });
  });

  describe('isSubscriptionInSync', () => {
    it('returns true when subscription data matches', () => {
      const firestoreSubscription = Object.assign({}, mockSubscription);

      const result = syncChecker.isSubscriptionInSync(firestoreSubscription, mockSubscription);
      expect(result).true;
    });

    it('returns false when status differs', () => {
      const firestoreSubscription = {
        status: 'canceled',
        current_period_end: mockSubscription.current_period_end,
        current_period_start: mockSubscription.current_period_start,
      };

      const result = syncChecker.isSubscriptionInSync(firestoreSubscription, mockSubscription);
      expect(result).false;
    });

    it('returns false when period end differs', () => {
      const firestoreSubscription = {
        status: mockSubscription.status,
        current_period_end: 999999,
        current_period_start: mockSubscription.current_period_start,
      };

      const result = syncChecker.isSubscriptionInSync(firestoreSubscription, mockSubscription);
      expect(result).false;
    });
  });

  describe('handleOutOfSync', () => {
    let triggerResyncStub: sinon.SinonStub;

    beforeEach(() => {
      triggerResyncStub = sinon.stub().resolves();
      syncChecker.triggerResync = triggerResyncStub;
    });

    it('increments out of sync counter', () => {
      const initialCount = syncChecker['outOfSyncCount'];
      syncChecker.handleOutOfSync(mockCustomer.id, 'Test reason', 'customer_missing');
      expect(syncChecker['outOfSyncCount']).eq(initialCount + 1);
    });

    it('increments customer missing counter', () => {
      const initialCount = syncChecker['customersMissingInFirestore'];
      syncChecker.handleOutOfSync(mockCustomer.id, 'Test reason', 'customer_missing');
      expect(syncChecker['customersMissingInFirestore']).eq(initialCount + 1);
    });

    it('increments subscription missing counter', () => {
      const initialCount = syncChecker['subscriptionsMissingInFirestore'];
      syncChecker.handleOutOfSync(mockCustomer.id, 'Test reason', 'subscription_missing', mockSubscription.id);
      expect(syncChecker['subscriptionsMissingInFirestore']).eq(initialCount + 1);
    });

    it('logs out-of-sync warning', () => {
      syncChecker.handleOutOfSync(mockCustomer.id, 'Test reason', 'customer_missing', mockSubscription.id);

      sinon.assert.calledWith(logStub.warn, 'firestore-stripe-out-of-sync', {
        customerId: mockCustomer.id,
        subscriptionId: mockSubscription.id,
        reason: 'Test reason',
        type: 'customer_missing',
      });
    });

    it('triggers resync', () => {
      syncChecker.handleOutOfSync(mockCustomer.id, 'Test reason', 'customer_missing');
      sinon.assert.calledWith(triggerResyncStub, mockCustomer.id);
    });
  });

  describe('triggerResync', () => {
    it('updates customer metadata with forcedResyncAt', async () => {
      stripeStub.customers.update = sinon.stub().resolves();

      await syncChecker.triggerResync(mockCustomer.id);

      sinon.assert.calledWith(stripeStub.customers.update as any, mockCustomer.id, sinon.match({
        metadata: {
          forcedResyncAt: sinon.match.string,
        },
      }));
    });

    it('logs error on failure', async () => {
      stripeStub.customers.update = sinon.stub().rejects(new Error('Update failed'));

      await syncChecker.triggerResync(mockCustomer.id);

      sinon.assert.calledWith(logStub.error, 'failed-to-trigger-resync', sinon.match.object);
    });
  });
});
