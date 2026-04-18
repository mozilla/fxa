/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Container from 'typedi';

import { ConfigType } from '../../config';
import { AppConfig, AuthFirestore } from '../../lib/types';

import {
  CustomerPlanMover,
  FirestoreSubscription,
} from './move-customers-to-new-plan';
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
  let customerPlanMover: CustomerPlanMover;
  let stripeStub: Stripe;
  let stripeHelperStub: StripeHelper;
  let dbStub: any;
  let firestoreGetStub: jest.Mock;

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

    customerPlanMover = new CustomerPlanMover(
      'source',
      'destination',
      ['exclude'],
      100,
      './move-customers-to-new-plan.tmp.csv',
      stripeHelperStub,
      dbStub,
      false,
      20
    );
  });

  afterEach(() => {
    Container.reset();
  });

  describe('convert', () => {
    let fetchSubsBatchStub: jest.Mock;
    let convertSubscriptionStub: jest.Mock;
    const mockSubs = [mockSubscription];

    beforeEach(async () => {
      fetchSubsBatchStub = jest
        .fn()
        .mockReturnValueOnce(mockSubs)
        .mockReturnValueOnce([]);
      customerPlanMover.fetchSubsBatch = fetchSubsBatchStub;

      convertSubscriptionStub = jest.fn();
      customerPlanMover.convertSubscription = convertSubscriptionStub;

      await customerPlanMover.convert();
    });

    it('fetches subscriptions until no results', () => {
      expect(fetchSubsBatchStub).toHaveBeenCalledTimes(2);
    });

    it('generates a report for each applicable subscription', () => {
      expect(convertSubscriptionStub).toHaveBeenCalledTimes(1);
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

      result = await customerPlanMover.fetchSubsBatch(mockSubscriptionId);
    });

    it('returns a list of subscriptions from Firestore', () => {
      expect(result).toEqual([mockSubscription]);
    });
  });

  describe('convertSubscription', () => {
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
    let cancelSubscriptionStub: jest.Mock;
    let createSubscriptionStub: jest.Mock;
    let isCustomerExcludedStub: jest.Mock;
    let buildReport: jest.Mock;
    let writeReportStub: jest.Mock;

    beforeEach(async () => {
      stripeStub.products.retrieve = jest.fn().mockResolvedValue(mockProduct);
      customerPlanMover.fetchCustomer = jest
        .fn()
        .mockResolvedValue(mockCustomer);
      dbStub.account.mockResolvedValue({
        locale: 'en-US',
      });
      cancelSubscriptionStub = jest.fn().mockResolvedValue(undefined);
      customerPlanMover.cancelSubscription = cancelSubscriptionStub;
      createSubscriptionStub = jest.fn().mockResolvedValue(undefined);
      customerPlanMover.createSubscription = createSubscriptionStub;
      isCustomerExcludedStub = jest.fn().mockReturnValue(false);
      customerPlanMover.isCustomerExcluded = isCustomerExcludedStub;
      buildReport = jest.fn().mockReturnValue(mockReport);
      customerPlanMover.buildReport = buildReport;
      writeReportStub = jest.fn().mockResolvedValue(undefined);
      customerPlanMover.writeReport = writeReportStub;
      logStub = jest.spyOn(console, 'log');
    });

    afterEach(() => {
      logStub.mockRestore();
    });

    describe('success', () => {
      beforeEach(async () => {
        await customerPlanMover.convertSubscription(mockFirestoreSub);
      });

      it('cancels old subscription', () => {
        expect(cancelSubscriptionStub).toHaveBeenCalledWith(mockFirestoreSub);
      });

      it('creates new subscription', () => {
        expect(createSubscriptionStub).toHaveBeenCalledWith(mockCustomer.id);
      });

      it('writes the report to disk', () => {
        expect(writeReportStub).toHaveBeenCalledWith(mockReport);
      });
    });

    describe('dry run', () => {
      beforeEach(async () => {
        customerPlanMover.dryRun = true;
        await customerPlanMover.convertSubscription(mockFirestoreSub);
      });

      it('does not cancel old subscription', () => {
        expect(cancelSubscriptionStub).not.toHaveBeenCalledWith(
          mockFirestoreSub
        );
      });

      it('does not create new subscription', () => {
        expect(createSubscriptionStub).not.toHaveBeenCalledWith(
          mockCustomer.id
        );
      });

      it('writes the report to disk', () => {
        expect(writeReportStub).toHaveBeenCalledWith(mockReport);
      });
    });

    describe('invalid', () => {
      it('aborts if customer does not exist', async () => {
        customerPlanMover.fetchCustomer = jest.fn().mockResolvedValue(null);
        await customerPlanMover.convertSubscription(mockFirestoreSub);

        expect(writeReportStub).not.toHaveBeenCalled();
      });

      it('aborts if account for customer does not exist', async () => {
        dbStub.account.mockResolvedValue(null);
        await customerPlanMover.convertSubscription(mockFirestoreSub);

        expect(writeReportStub).not.toHaveBeenCalled();
      });

      it('does not create subscription if customer is excluded', async () => {
        customerPlanMover.isCustomerExcluded = jest
          .fn()
          .mockResolvedValue(true);
        await customerPlanMover.convertSubscription(mockFirestoreSub);

        expect(createSubscriptionStub).not.toHaveBeenCalled();
      });

      it('does not cancel subscription if customer is excluded', async () => {
        customerPlanMover.isCustomerExcluded = jest
          .fn()
          .mockResolvedValue(true);
        await customerPlanMover.convertSubscription(mockFirestoreSub);

        expect(cancelSubscriptionStub).not.toHaveBeenCalled();
      });

      it('does not move subscription if subscription is not in active state', async () => {
        await customerPlanMover.convertSubscription({
          ...mockFirestoreSub,
          status: 'canceled',
        });

        expect(cancelSubscriptionStub).not.toHaveBeenCalled();
        expect(createSubscriptionStub).not.toHaveBeenCalled();
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

        result = await customerPlanMover.fetchCustomer(mockCustomer.id);
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

        result = await customerPlanMover.fetchCustomer(mockCustomer.id);
      });

      it('returns null', () => {
        expect(result).toEqual(null);
      });
    });
  });

  describe('isCustomerExcluded', () => {
    it("returns true if the customer has a price that's excluded", () => {
      const result = customerPlanMover.isCustomerExcluded([
        {
          ...mockSubscription,
          items: {
            ...mockSubscription.items,
            data: [
              {
                ...mockSubscription.items.data[0],
                plan: {
                  ...mockSubscription.items.data[0].plan,
                  id: 'exclude',
                },
              },
            ],
          },
        },
      ]);
      expect(result).toBe(true);
    });

    it("returns false if the customer does not have a price that's excluded", () => {
      const result = customerPlanMover.isCustomerExcluded([
        {
          // TODO: Either provide full mock, or reduce type required isCustomerExcluded
          ...(subscription1 as unknown as Stripe.Subscription),
        },
      ]);
      expect(result).toBe(false);
    });
  });

  describe('createSubscription', () => {
    let createStub: jest.Mock;

    beforeEach(async () => {
      createStub = jest.fn().mockResolvedValue(mockSubscription);
      stripeStub.subscriptions.create = createStub;

      await customerPlanMover.createSubscription(mockCustomer.id);
    });

    it('creates a subscription', () => {
      expect(createStub).toHaveBeenCalledWith({
        customer: mockCustomer.id,
        items: [
          {
            price: 'destination',
          },
        ],
      });
    });
  });

  describe('buildReport', () => {
    it('returns a report', () => {
      const result = customerPlanMover.buildReport(
        mockCustomer,
        mockAccount,
        true
      );

      expect(result).toEqual([
        mockCustomer.metadata.userid,
        `"${mockCustomer.email}"`,
        'true',
        `"${mockAccount.locale}"`,
      ]);
    });
  });
});
