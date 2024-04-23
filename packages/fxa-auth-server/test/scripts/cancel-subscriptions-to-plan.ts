/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import sinon from 'sinon';
import { expect } from 'chai';
import Container from 'typedi';

import { ConfigType } from '../../config';
import { AppConfig, AuthFirestore } from '../../lib/types';

import {
  PlanCanceller,
  FirestoreSubscription,
} from '../../scripts/cancel-subscriptions-to-plan/cancel-subscriptions-to-plan';
import Stripe from 'stripe';
import { StripeHelper } from '../../lib/payments/stripe';

import product1 from '../local/payments/fixtures/stripe/product1.json';
import customer1 from '../local/payments/fixtures/stripe/customer1.json';
import subscription1 from '../local/payments/fixtures/stripe/subscription1.json';
import { PayPalHelper } from '../../lib/payments/paypal/helper';

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
        cdnUrlRegex: '^http',
      },
    },
  },
} as unknown as ConfigType;

describe('PlanCanceller', () => {
  let planCanceller: PlanCanceller;
  let stripeStub: Stripe;
  let stripeHelperStub: StripeHelper;
  let paypalHelperStub: PayPalHelper;
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
      refunds: {},
    } as unknown as Stripe;

    stripeHelperStub = {
      stripe: stripeStub,
      currencyHelper: {
        isCurrencyCompatibleWithCountry: sinon.stub(),
      },
    } as unknown as StripeHelper;

    paypalHelperStub = {
      refundInvoice: sinon.stub(),
    } as unknown as PayPalHelper;

    dbStub = {
      account: sinon.stub(),
    };

    planCanceller = new PlanCanceller(
      'planId',
      true,
      false,
      ['exclude'],
      100,
      './cancel-subscriptions-to-plan.tmp.csv',
      stripeHelperStub,
      paypalHelperStub,
      dbStub,
      false,
      20
    );
  });

  afterEach(() => {
    Container.reset();
  });

  describe('run', () => {
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
      planCanceller.fetchSubsBatch = fetchSubsBatchStub;

      processSubscriptionStub = sinon.stub();
      planCanceller.processSubscription = processSubscriptionStub;

      await planCanceller.run();
    });

    it('fetches subscriptions until no results', () => {
      expect(fetchSubsBatchStub.callCount).eq(2);
    });

    it('generates a report for each applicable subscription', () => {
      expect(processSubscriptionStub.callCount).eq(1);
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

      result = await planCanceller.fetchSubsBatch(mockSubscriptionId);
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
    let cancelSubscriptionStub: sinon.SinonStub;
    let isCustomerExcludedStub: sinon.SinonStub;
    let buildReport: sinon.SinonStub;
    let writeReportStub: sinon.SinonStub;

    beforeEach(async () => {
      stripeStub.products.retrieve = sinon.stub().resolves(mockProduct);
      planCanceller.fetchCustomer = sinon.stub().resolves(mockCustomer);
      dbStub.account.resolves({
        locale: 'en-US',
      });
      cancelSubscriptionStub = sinon.stub().resolves();
      planCanceller.cancelSubscription = cancelSubscriptionStub;
      isCustomerExcludedStub = sinon.stub().returns(false);
      planCanceller.isCustomerExcluded = isCustomerExcludedStub;
      buildReport = sinon.stub().returns(mockReport);
      planCanceller.buildReport = buildReport;
      writeReportStub = sinon.stub().resolves();
      planCanceller.writeReport = writeReportStub;
      logStub = sinon.stub(console, 'log');
    });

    afterEach(() => {
      logStub.restore();
    });

    describe('success', () => {
      beforeEach(async () => {
        await planCanceller.processSubscription(mockFirestoreSub);
      });

      it('cancels subscription', () => {
        expect(cancelSubscriptionStub.calledWith(mockFirestoreSub)).true;
      });

      it('writes the report to disk', () => {
        expect(writeReportStub.calledWith(mockReport)).true;
      });
    });

    describe('dry run', () => {
      beforeEach(async () => {
        planCanceller.dryRun = true;
        await planCanceller.processSubscription(mockFirestoreSub);
      });

      it('does not cancel subscription', () => {
        expect(cancelSubscriptionStub.calledWith(mockFirestoreSub)).false;
      });

      it('writes the report to disk', () => {
        expect(writeReportStub.calledWith(mockReport)).true;
      });
    });

    describe('invalid', () => {
      it('aborts if customer does not exist', async () => {
        planCanceller.fetchCustomer = sinon.stub().resolves(null);
        await planCanceller.processSubscription(mockFirestoreSub);

        expect(writeReportStub.notCalled).true;
      });

      it('aborts if account for customer does not exist', async () => {
        dbStub.account.resolves(null);
        await planCanceller.processSubscription(mockFirestoreSub);

        expect(writeReportStub.notCalled).true;
      });

      it('does not cancel subscription if customer is excluded', async () => {
        planCanceller.isCustomerExcluded = sinon.stub().resolves(true);
        await planCanceller.processSubscription(mockFirestoreSub);

        expect(cancelSubscriptionStub.notCalled).true;
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

        result = await planCanceller.fetchCustomer(mockCustomer.id);
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

        result = await planCanceller.fetchCustomer(mockCustomer.id);
      });

      it('returns null', () => {
        sinon.assert.match(result, null);
      });
    });
  });

  describe('isCustomerExcluded', () => {
    it("returns true if the customer has a price that's excluded", () => {
      const result = planCanceller.isCustomerExcluded([
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
      const result = planCanceller.isCustomerExcluded([
        {
          ...mockSubscription,
        },
      ]);
      expect(result).false;
    });
  });

  describe('cancelSubscription', () => {
    let cancelStub: sinon.SinonStub;
    let invoiceStub: sinon.SinonStub;
    let refundStub: sinon.SinonStub;
    let refundInvoiceStub: sinon.SinonStub;
    const mockInvoice = {
      charge: 'abc',
    };

    beforeEach(async () => {
      cancelStub = sinon.stub().resolves();
      stripeStub.subscriptions.cancel = cancelStub;

      invoiceStub = sinon.stub().resolves(mockInvoice);
      stripeStub.invoices.retrieve = invoiceStub;

      refundStub = sinon.stub().resolves();
      stripeStub.refunds.create = refundStub;

      refundInvoiceStub = sinon.stub().resolves();
      paypalHelperStub.refundInvoice = refundInvoiceStub;
    });

    describe('with Stripe refund', () => {
      beforeEach(async () => {
        await planCanceller.cancelSubscription(mockSubscription);
      });

      it('cancels subscription', () => {
        expect(
          cancelStub.calledWith(mockSubscription.id, {
            prorate: false,
          })
        ).true;
      });

      it('fetches invoice', () => {
        expect(invoiceStub.calledWith(mockSubscription.latest_invoice)).true;
      });

      it('creates refund', () => {
        expect(
          refundStub.calledWith({
            charge: mockInvoice.charge,
          })
        ).true;
      });
    });

    describe('with Paypal refund', () => {
      const mockPaypalInvoice = {
        ...mockInvoice,
        collection_method: 'send_invoice',
      };

      beforeEach(async () => {
        invoiceStub = sinon.stub().resolves(mockPaypalInvoice);
        stripeStub.invoices.retrieve = invoiceStub;

        await planCanceller.cancelSubscription(mockSubscription);
      });

      it('cancels subscription', () => {
        expect(
          cancelStub.calledWith(mockSubscription.id, {
            prorate: false,
          })
        ).true;
      });

      it('fetches invoice', () => {
        expect(invoiceStub.calledWith(mockSubscription.latest_invoice)).true;
      });

      it('creates refund', () => {
        expect(refundInvoiceStub.calledWith(mockPaypalInvoice)).true;
      });
    });

    describe('with proration', () => {
      beforeEach(async () => {
        planCanceller = new PlanCanceller(
          'planId',
          false,
          true,
          ['exclude'],
          100,
          './cancel-subscriptions-to-plan.tmp.csv',
          stripeHelperStub,
          paypalHelperStub,
          dbStub,
          false,
          20
        );

        await planCanceller.cancelSubscription(mockSubscription);
      });

      it('cancels subscription', () => {
        expect(
          cancelStub.calledWith(mockSubscription.id, {
            prorate: true,
          })
        ).true;
      });

      it('does not creates refund', () => {
        expect(refundStub.notCalled).true;
      });
    });
  });

  describe('buildReport', () => {
    it('returns a report', () => {
      const result = planCanceller.buildReport(mockCustomer, mockAccount, true);

      sinon.assert.match(result, [
        mockCustomer.metadata.userid,
        `"${mockCustomer.email}"`,
        'true',
        `"${mockAccount.locale}"`,
      ]);
    });
  });
});
