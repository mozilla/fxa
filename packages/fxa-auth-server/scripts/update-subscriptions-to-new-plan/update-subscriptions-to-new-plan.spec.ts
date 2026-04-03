/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';
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

describe('SubscriptionUpdater', () => {
  let subscriptionUpdater: SubscriptionUpdater;
  let stripeStub: Stripe;
  let stripeHelperStub: StripeHelper;
  let dbStub: any;
  let firestoreGetStub: sinon.SinonStub;
  const planIdMap = {
    [mockSubscription.items.data[0].plan.id]: 'updated',
  };
  const prorationBehavior = 'none';

  beforeEach(() => {
    firestoreGetStub = sinon.stub();
    Container.set(AuthFirestore, {
      collectionGroup: sinon.stub().returns({
        where: sinon.stub().returnsThis(),
        orderBy: sinon.stub().returnsThis(),
        startAfter: sinon.stub().returnsThis(),
        limit: sinon.stub().returnsThis(),
        get: firestoreGetStub,
      }),
    });

    Container.set(AppConfig, mockConfig);

    stripeStub = {
      on: sinon.stub(),
      products: {},
      customers: {},
      subscriptions: {},
      invoices: {},
    } as unknown as Stripe;

    stripeHelperStub = {
      stripe: stripeStub,
      currencyHelper: {
        isCurrencyCompatibleWithCountry: sinon.stub(),
      },
    } as unknown as StripeHelper;

    dbStub = {
      account: sinon.stub(),
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
    let fetchSubsBatchStub: sinon.SinonStub;
    let processSubscriptionStub: sinon.SinonStub;
    const mockSubs = [mockSubscription];

    beforeEach(async () => {
      fetchSubsBatchStub = sinon
        .stub()
        .onFirstCall()
        .returns(mockSubs)
        .onSecondCall()
        .returns([]);
      subscriptionUpdater.fetchSubsBatch = fetchSubsBatchStub;

      processSubscriptionStub = sinon.stub();
      subscriptionUpdater.processSubscription = processSubscriptionStub;

      await subscriptionUpdater.update();
    });

    it('fetches subscriptions until no results', () => {
      expect(fetchSubsBatchStub.callCount).toBe(2);
    });

    it('generates a report for each applicable subscription', () => {
      expect(processSubscriptionStub.callCount).toBe(1);
    });
  });

  describe('fetchSubsBatch', () => {
    const mockSubscriptionId = 'mock-id';
    let result: FirestoreSubscription[];

    beforeEach(async () => {
      firestoreGetStub.resolves({
        docs: [
          {
            data: sinon.stub().returns(mockSubscription),
          },
        ],
      });

      result = await subscriptionUpdater.fetchSubsBatch(mockSubscriptionId);
    });

    it('returns a list of subscriptions from Firestore', () => {
      sinon.assert.match(result, [mockSubscription]);
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
    let logStub: sinon.SinonStub;
    let updateSubscriptionStub: sinon.SinonStub;
    let buildReport: sinon.SinonStub;
    let writeReportStub: sinon.SinonStub;

    beforeEach(async () => {
      stripeStub.products.retrieve = sinon.stub().resolves(mockProduct);
      subscriptionUpdater.fetchCustomer = sinon.stub().resolves(mockCustomer);
      dbStub.account.resolves({
        locale: 'en-US',
      });
      updateSubscriptionStub = sinon.stub().resolves();
      subscriptionUpdater.updateSubscription = updateSubscriptionStub;
      buildReport = sinon.stub().returns(mockReport);
      subscriptionUpdater.buildReport = buildReport;
      writeReportStub = sinon.stub().resolves();
      subscriptionUpdater.writeReport = writeReportStub;
      logStub = sinon.stub(console, 'log');
    });

    afterEach(() => {
      logStub.restore();
    });

    describe('success', () => {
      beforeEach(async () => {
        await subscriptionUpdater.processSubscription(mockFirestoreSub);
      });

      it('updates subscription', () => {
        expect(updateSubscriptionStub.calledWith(mockFirestoreSub)).toBe(true);
      });

      it('writes the report to disk', () => {
        expect(writeReportStub.calledWith(mockReport)).toBe(true);
      });
    });

    describe('dry run', () => {
      beforeEach(async () => {
        subscriptionUpdater.dryRun = true;
        await subscriptionUpdater.processSubscription(mockFirestoreSub);
      });

      it('does not update subscription', () => {
        expect(updateSubscriptionStub.calledWith(mockFirestoreSub)).toBe(false);
      });

      it('writes the report to disk', () => {
        expect(writeReportStub.calledWith(mockReport)).toBe(true);
      });
    });

    describe('invalid', () => {
      it('aborts if customer does not exist', async () => {
        subscriptionUpdater.fetchCustomer = sinon.stub().resolves(null);
        await subscriptionUpdater.processSubscription(mockFirestoreSub);

        expect(writeReportStub.notCalled).toBe(true);
      });

      it('aborts if account for customer does not exist', async () => {
        dbStub.account.resolves(null);
        await subscriptionUpdater.processSubscription(mockFirestoreSub);

        expect(writeReportStub.notCalled).toBe(true);
      });

      it('does not move subscription if subscription is not in active state', async () => {
        await subscriptionUpdater.processSubscription({
          ...mockFirestoreSub,
          status: 'canceled',
        });

        expect(updateSubscriptionStub.notCalled).toBe(true);
        expect(writeReportStub.notCalled).toBe(true);
      });
    });
  });

  describe('fetchCustomer', () => {
    let customerRetrieveStub: sinon.SinonStub;
    let result: Stripe.Customer | Stripe.DeletedCustomer | null;

    describe('customer exists', () => {
      beforeEach(async () => {
        customerRetrieveStub = sinon.stub().resolves(mockCustomer);
        stripeStub.customers.retrieve = customerRetrieveStub;

        result = await subscriptionUpdater.fetchCustomer(mockCustomer.id);
      });

      it('fetches customer from Stripe', () => {
        expect(
          customerRetrieveStub.calledWith(mockCustomer.id, {
            expand: ['subscriptions'],
          })
        ).toBe(true);
      });

      it('returns customer', () => {
        sinon.assert.match(result, mockCustomer);
      });
    });

    describe('customer deleted', () => {
      beforeEach(async () => {
        const deletedCustomer = {
          ...mockCustomer,
          deleted: true,
        };
        customerRetrieveStub = sinon.stub().resolves(deletedCustomer);
        stripeStub.customers.retrieve = customerRetrieveStub;

        result = await subscriptionUpdater.fetchCustomer(mockCustomer.id);
      });

      it('returns null', () => {
        sinon.assert.match(result, null);
      });
    });
  });

  describe('updateSubscription', () => {
    let retrieveStub: sinon.SinonStub;
    let updateStub: sinon.SinonStub;

    beforeEach(async () => {
      retrieveStub = sinon.stub().resolves(mockSubscription);
      stripeStub.subscriptions.retrieve = retrieveStub;

      updateStub = sinon.stub().resolves();
      stripeStub.subscriptions.update = updateStub;

      await subscriptionUpdater.updateSubscription(mockSubscription);
    });

    it('retrieves the subscription', () => {
      expect(retrieveStub.calledWith(mockSubscription.id)).toBe(true);
    });

    it('updates the subscription', () => {
      expect(
        updateStub.calledWith(mockSubscription.id, {
          proration_behavior: prorationBehavior,
          items: [
            {
              id: mockSubscription.items.data[0].id,
              plan: 'updated',
            },
          ],
          metadata: {
            previous_plan_id: mockSubscription.items.data[0].plan.id,
            plan_change_date: sinon.match.number,
          },
        })
      ).toBe(true);
    });
  });

  describe('buildReport', () => {
    it('returns a report', () => {
      const result = subscriptionUpdater.buildReport(mockCustomer, mockAccount);

      sinon.assert.match(result, [
        mockCustomer.metadata.userid,
        `"${mockCustomer.email}"`,
        `"${mockAccount.locale}"`,
      ]);
    });
  });
});
