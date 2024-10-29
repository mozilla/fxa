/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import cp from 'child_process';
import util from 'util';
import path from 'path';
import sinon from 'sinon';
import { expect } from 'chai';
import Container from 'typedi';

import { ConfigType } from '../../config';
import { AppConfig, AuthFirestore } from '../../lib/types';

import {
  CustomerPlanMover,
  FirestoreSubscription,
} from '../../scripts/move-customers-to-new-plan/move-customers-to-new-plan';
import Stripe from 'stripe';
import { StripeHelper } from '../../lib/payments/stripe';

import product1 from '../local/payments/fixtures/stripe/product1.json';
import customer1 from '../local/payments/fixtures/stripe/customer1.json';
import subscription1 from '../local/payments/fixtures/stripe/subscription1.json';

const mockProduct = product1 as unknown as Stripe.Product;
const mockCustomer = customer1 as unknown as Stripe.Customer;
const mockSubscription = subscription1 as unknown as FirestoreSubscription;

const mockAccount = {
  locale: 'en-US',
};

const ROOT_DIR = '../..';
const execAsync = util.promisify(cp.exec);
const cwd = path.resolve(__dirname, ROOT_DIR);
const execOptions = {
  cwd,
  env: {
    ...process.env,
    NODE_ENV: 'dev',
    LOG_LEVEL: 'error',
    AUTH_FIRESTORE_EMULATOR_HOST: 'localhost:9090',
  },
};

describe('starting script', () => {
  it('does not fail', function () {
    this.timeout(20000);
    return execAsync(
      'node -r esbuild-register scripts/remove-unverified-accounts.ts',
      execOptions
    );
  });
});

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
        cdnUrlRegex: '^http',
      },
    },
  },
} as unknown as ConfigType;

describe('CustomerPlanMover', () => {
  let customerPlanMover: CustomerPlanMover;
  let stripeStub: Stripe;
  let stripeHelperStub: StripeHelper;
  let dbStub: any;
  let firestoreGetStub: sinon.SinonStub;

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

  describe('convert', () => {
    let fetchSubsBatchStub: sinon.SinonStub;
    let convertSubscriptionStub: sinon.SinonStub;
    const mockSubs = [mockSubscription];

    beforeEach(async () => {
      fetchSubsBatchStub = sinon
        .stub()
        .onFirstCall()
        .returns(mockSubs)
        .onSecondCall()
        .returns([]);
      customerPlanMover.fetchSubsBatch = fetchSubsBatchStub;

      convertSubscriptionStub = sinon.stub();
      customerPlanMover.convertSubscription = convertSubscriptionStub;

      await customerPlanMover.convert();
    });

    it('fetches subscriptions until no results', () => {
      expect(fetchSubsBatchStub.callCount).eq(2);
    });

    it('generates a report for each applicable subscription', () => {
      expect(convertSubscriptionStub.callCount).eq(1);
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

      result = await customerPlanMover.fetchSubsBatch(mockSubscriptionId);
    });

    it('returns a list of subscriptions from Firestore', () => {
      sinon.assert.match(result, [mockSubscription]);
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
    let logStub: sinon.SinonStub;
    let cancelSubscriptionStub: sinon.SinonStub;
    let createSubscriptionStub: sinon.SinonStub;
    let isCustomerExcludedStub: sinon.SinonStub;
    let buildReport: sinon.SinonStub;
    let writeReportStub: sinon.SinonStub;

    beforeEach(async () => {
      stripeStub.products.retrieve = sinon.stub().resolves(mockProduct);
      customerPlanMover.fetchCustomer = sinon.stub().resolves(mockCustomer);
      dbStub.account.resolves({
        locale: 'en-US',
      });
      cancelSubscriptionStub = sinon.stub().resolves();
      customerPlanMover.cancelSubscription = cancelSubscriptionStub;
      createSubscriptionStub = sinon.stub().resolves();
      customerPlanMover.createSubscription = createSubscriptionStub;
      isCustomerExcludedStub = sinon.stub().returns(false);
      customerPlanMover.isCustomerExcluded = isCustomerExcludedStub;
      buildReport = sinon.stub().returns(mockReport);
      customerPlanMover.buildReport = buildReport;
      writeReportStub = sinon.stub().resolves();
      customerPlanMover.writeReport = writeReportStub;
      logStub = sinon.stub(console, 'log');
    });

    afterEach(() => {
      logStub.restore();
    });

    describe('success', () => {
      beforeEach(async () => {
        await customerPlanMover.convertSubscription(mockFirestoreSub);
      });

      it('cancels old subscription', () => {
        expect(cancelSubscriptionStub.calledWith(mockFirestoreSub)).true;
      });

      it('creates new subscription', () => {
        expect(createSubscriptionStub.calledWith(mockCustomer.id)).true;
      });

      it('writes the report to disk', () => {
        expect(writeReportStub.calledWith(mockReport)).true;
      });
    });

    describe('dry run', () => {
      beforeEach(async () => {
        customerPlanMover.dryRun = true;
        await customerPlanMover.convertSubscription(mockFirestoreSub);
      });

      it('does not cancel old subscription', () => {
        expect(cancelSubscriptionStub.calledWith(mockFirestoreSub)).false;
      });

      it('does not create new subscription', () => {
        expect(createSubscriptionStub.calledWith(mockCustomer.id)).false;
      });

      it('writes the report to disk', () => {
        expect(writeReportStub.calledWith(mockReport)).true;
      });
    });

    describe('invalid', () => {
      it('aborts if customer does not exist', async () => {
        customerPlanMover.fetchCustomer = sinon.stub().resolves(null);
        await customerPlanMover.convertSubscription(mockFirestoreSub);

        expect(writeReportStub.notCalled).true;
      });

      it('aborts if account for customer does not exist', async () => {
        dbStub.account.resolves(null);
        await customerPlanMover.convertSubscription(mockFirestoreSub);

        expect(writeReportStub.notCalled).true;
      });

      it('does not create subscription if customer is excluded', async () => {
        customerPlanMover.isCustomerExcluded = sinon.stub().resolves(true);
        await customerPlanMover.convertSubscription(mockFirestoreSub);

        expect(createSubscriptionStub.notCalled).true;
      });

      it('does not cancel subscription if customer is excluded', async () => {
        customerPlanMover.isCustomerExcluded = sinon.stub().resolves(true);
        await customerPlanMover.convertSubscription(mockFirestoreSub);

        expect(cancelSubscriptionStub.notCalled).true;
      });

      it('does not move subscription if subscription is not in active state', async () => {
        await customerPlanMover.convertSubscription({
          ...mockFirestoreSub,
          status: 'canceled',
        });

        expect(cancelSubscriptionStub.notCalled).true;
        expect(createSubscriptionStub.notCalled).true;
        expect(writeReportStub.notCalled).true;
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

        result = await customerPlanMover.fetchCustomer(mockCustomer.id);
      });

      it('fetches customer from Stripe', () => {
        expect(
          customerRetrieveStub.calledWith(mockCustomer.id, {
            expand: ['subscriptions'],
          })
        ).true;
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

        result = await customerPlanMover.fetchCustomer(mockCustomer.id);
      });

      it('returns null', () => {
        sinon.assert.match(result, null);
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
      expect(result).true;
    });

    it("returns false if the customer does not have a price that's excluded", () => {
      const result = customerPlanMover.isCustomerExcluded([
        {
          // TODO: Either provide full mock, or reduce type required isCustomerExcluded
          ...(subscription1 as unknown as Stripe.Subscription),
        },
      ]);
      expect(result).false;
    });
  });

  describe('createSubscription', () => {
    let createStub: sinon.SinonStub;

    beforeEach(async () => {
      createStub = sinon.stub().resolves(mockSubscription);
      stripeStub.subscriptions.create = createStub;

      await customerPlanMover.createSubscription(mockCustomer.id);
    });

    it('creates a subscription', () => {
      expect(
        createStub.calledWith({
          customer: mockCustomer.id,
          items: [
            {
              price: 'destination',
            },
          ],
        })
      ).true;
    });
  });

  describe('buildReport', () => {
    it('returns a report', () => {
      const result = customerPlanMover.buildReport(
        mockCustomer,
        mockAccount,
        true
      );

      sinon.assert.match(result, [
        mockCustomer.metadata.userid,
        `"${mockCustomer.email}"`,
        'true',
        `"${mockAccount.locale}"`,
      ]);
    });
  });
});
