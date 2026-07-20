/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Container from 'typedi';

import { ConfigType } from '../../config';
import { AppConfig, AuthFirestore } from '../../lib/types';

import {
  SubscriptionUpdater,
  FirestoreSubscription,
} from './update-subscriptions-to-new-plan';
import Stripe from 'stripe';
import { StripeHelper } from '../../lib/payments/stripe';

import product1 from '../../test/local/payments/fixtures/stripe/product1.json';
import customer1 from '../../test/local/payments/fixtures/stripe/customer1.json';
import subscription1 from '../../test/local/payments/fixtures/stripe/subscription1.json';

const mockProduct = product1 as unknown as Stripe.Product;
const mockCustomer = customer1 as unknown as Stripe.Customer;
const mockSubscription = subscription1 as unknown as FirestoreSubscription;

const mockAccount = {
  locale: 'en-US',
};

const mockConfig = {
  authFirestore: {
    prefix: 'mock-fxa-',
  },
  subscriptions: {
    playApiServiceAccount: {
      credentials: {
        clientEmail: 'mock-client-email',
      },
      keyFile: 'mock-private-keyfile',
    },
    productConfigsFirestore: {
      schemaValidation: {
        cdnUrlRegex: ['^http'],
      },
    },
  },
} as unknown as ConfigType;

describe('CustomerPlanMover', () => {
  let subscriptionUpdater: SubscriptionUpdater;
  let stripeStub: Stripe;
  let stripeHelperStub: StripeHelper;
  let dbStub: any;
  let firestoreGetStub: jest.Mock;
  const planIdMap = {
    [mockSubscription.items.data[0].plan.id]: 'updated',
  };
  const prorationBehavior = 'none';

  beforeEach(() => {
    firestoreGetStub = jest.fn();
    Container.set(AuthFirestore, {
      collectionGroup: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        startAfter: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: firestoreGetStub,
      }),
    });

    Container.set(AppConfig, mockConfig);

    stripeStub = {
      on: jest.fn(),
      products: {},
      customers: {},
      subscriptions: {},
      invoices: {},
    } as unknown as Stripe;

    stripeHelperStub = {
      stripe: stripeStub,
      currencyHelper: {
        isCurrencyCompatibleWithCountry: jest.fn(),
      },
    } as unknown as StripeHelper;

    dbStub = {
      account: jest.fn(),
    };

    subscriptionUpdater = new SubscriptionUpdater(
      planIdMap,
      'none',
      100,
      './update-subscriptions-to-new-plan.tmp.csv',
      stripeHelperStub,
      dbStub,
      false,
      20
    );
  });

  afterEach(() => {
    Container.reset();
  });

  describe('update', () => {
    let fetchSubsBatchStub: jest.Mock;
    let processSubscriptionStub: jest.Mock;
    const mockSubs = [mockSubscription];

    beforeEach(async () => {
      fetchSubsBatchStub = jest
        .fn()
        .mockReturnValueOnce(mockSubs)
        .mockReturnValueOnce([]);
      subscriptionUpdater.fetchSubsBatch = fetchSubsBatchStub;

      processSubscriptionStub = jest.fn();
      subscriptionUpdater.processSubscription = processSubscriptionStub;

      await subscriptionUpdater.update();
    });

    it('fetches subscriptions until no results', () => {
      expect(fetchSubsBatchStub).toHaveBeenCalledTimes(2);
    });

    it('generates a report for each applicable subscription', () => {
      expect(processSubscriptionStub).toHaveBeenCalledTimes(1);
    });
  });

  describe('fetchSubsBatch', () => {
    const mockSubscriptionId = 'mock-id';
    let result: FirestoreSubscription[];

    beforeEach(async () => {
      firestoreGetStub.mockResolvedValue({
        docs: [
          {
            data: jest.fn().mockReturnValue(mockSubscription),
          },
        ],
      });

      result = await subscriptionUpdater.fetchSubsBatch(mockSubscriptionId);
    });

    it('returns a list of subscriptions from Firestore', () => {
      expect(result).toEqual([mockSubscription]);
    });
  });

  describe('processSubscription', () => {
    const mockFirestoreSub = {
      id: 'test',
      customer: 'test',
      plan: {
        product: 'example-product',
      },
      status: 'active',
    } as FirestoreSubscription;
    const mockReport = ['mock-report'];
    let logStub: jest.SpyInstance;
    let updateSubscriptionStub: jest.Mock;
    let buildReport: jest.Mock;
    let writeReportStub: jest.Mock;

    beforeEach(async () => {
      stripeStub.products.retrieve = jest.fn().mockResolvedValue(mockProduct);
      subscriptionUpdater.fetchCustomer = jest
        .fn()
        .mockResolvedValue(mockCustomer);
      dbStub.account.mockResolvedValue({
        locale: 'en-US',
      });
      updateSubscriptionStub = jest.fn().mockResolvedValue(undefined);
      subscriptionUpdater.updateSubscription = updateSubscriptionStub;
      buildReport = jest.fn().mockReturnValue(mockReport);
      subscriptionUpdater.buildReport = buildReport;
      writeReportStub = jest.fn().mockResolvedValue(undefined);
      subscriptionUpdater.writeReport = writeReportStub;
      logStub = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      logStub.mockRestore();
    });

    describe('success', () => {
      beforeEach(async () => {
        await subscriptionUpdater.processSubscription(mockFirestoreSub);
      });

      it('updates subscription', () => {
        expect(updateSubscriptionStub).toHaveBeenCalledWith(mockFirestoreSub);
      });

      it('writes the report to disk', () => {
        expect(writeReportStub).toHaveBeenCalledWith(mockReport);
      });
    });

    describe('dry run', () => {
      beforeEach(async () => {
        subscriptionUpdater.dryRun = true;
        await subscriptionUpdater.processSubscription(mockFirestoreSub);
      });

      it('does not update subscription', () => {
        expect(updateSubscriptionStub).not.toHaveBeenCalledWith(
          mockFirestoreSub
        );
      });

      it('writes the report to disk', () => {
        expect(writeReportStub).toHaveBeenCalledWith(mockReport);
      });
    });

    describe('invalid', () => {
      it('aborts if customer does not exist', async () => {
        subscriptionUpdater.fetchCustomer = jest.fn().mockResolvedValue(null);
        await subscriptionUpdater.processSubscription(mockFirestoreSub);

        expect(writeReportStub).not.toHaveBeenCalled();
      });

      it('aborts if account for customer does not exist', async () => {
        dbStub.account.mockResolvedValue(null);
        await subscriptionUpdater.processSubscription(mockFirestoreSub);

        expect(writeReportStub).not.toHaveBeenCalled();
      });

      it('does not move subscription if subscription is not in active state', async () => {
        await subscriptionUpdater.processSubscription({
          ...mockFirestoreSub,
          status: 'canceled',
        });

        expect(updateSubscriptionStub).not.toHaveBeenCalled();
        expect(writeReportStub).not.toHaveBeenCalled();
      });
    });
  });

  describe('fetchCustomer', () => {
    let customerRetrieveStub: jest.Mock;
    let result: Stripe.Customer | Stripe.DeletedCustomer | null;

    describe('customer exists', () => {
      beforeEach(async () => {
        customerRetrieveStub = jest.fn().mockResolvedValue(mockCustomer);
        stripeStub.customers.retrieve = customerRetrieveStub;

        result = await subscriptionUpdater.fetchCustomer(mockCustomer.id);
      });

      it('fetches customer from Stripe', () => {
        expect(customerRetrieveStub).toHaveBeenCalledWith(mockCustomer.id, {
          expand: ['subscriptions'],
        });
      });

      it('returns customer', () => {
        expect(result).toEqual(mockCustomer);
      });
    });

    describe('customer deleted', () => {
      beforeEach(async () => {
        const deletedCustomer = {
          ...mockCustomer,
          deleted: true,
        };
        customerRetrieveStub = jest.fn().mockResolvedValue(deletedCustomer);
        stripeStub.customers.retrieve = customerRetrieveStub;

        result = await subscriptionUpdater.fetchCustomer(mockCustomer.id);
      });

      it('returns null', () => {
        expect(result).toEqual(null);
      });
    });
  });

  describe('updateSubscription', () => {
    let retrieveStub: jest.Mock;
    let updateStub: jest.Mock;

    beforeEach(async () => {
      retrieveStub = jest.fn().mockResolvedValue(mockSubscription);
      stripeStub.subscriptions.retrieve = retrieveStub;

      updateStub = jest.fn().mockResolvedValue(undefined);
      stripeStub.subscriptions.update = updateStub;

      await subscriptionUpdater.updateSubscription(mockSubscription);
    });

    it('retrieves the subscription', () => {
      expect(retrieveStub).toHaveBeenCalledWith(mockSubscription.id);
    });

    it('updates the subscription', () => {
      expect(updateStub).toHaveBeenCalledWith(mockSubscription.id, {
        proration_behavior: prorationBehavior,
        items: [
          {
            id: mockSubscription.items.data[0].id,
            plan: 'updated',
          },
        ],
        metadata: {
          previous_plan_id: mockSubscription.items.data[0].plan.id,
          plan_change_date: expect.any(Number),
        },
      });
    });
  });

  describe('buildReport', () => {
    it('returns a report', () => {
      const result = subscriptionUpdater.buildReport(mockCustomer, mockAccount);

      expect(result).toEqual([
        mockCustomer.metadata.userid,
        `"${mockCustomer.email}"`,
        `"${mockAccount.locale}"`,
      ]);
    });
  });
});
