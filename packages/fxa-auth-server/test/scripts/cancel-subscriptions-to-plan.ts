/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import sinon from 'sinon';
import { expect } from 'chai';

import { PlanCanceller } from '../../scripts/cancel-subscriptions-to-plan/cancel-subscriptions-to-plan';
import Stripe from 'stripe';
import { StripeHelper } from '../../lib/payments/stripe';

import product1 from '../local/payments/fixtures/stripe/product1.json';
import customer1 from '../local/payments/fixtures/stripe/customer1.json';
import subscription1 from '../local/payments/fixtures/stripe/subscription1.json';
import { PayPalHelper } from '../../lib/payments/paypal/helper';

const mockProduct = product1 as unknown as Stripe.Product;
const mockCustomer = customer1 as unknown as Stripe.Customer;
const mockSubscription = subscription1 as unknown as Stripe.Subscription;

describe('PlanCanceller', () => {
  let planCanceller: PlanCanceller;
  let stripeStub: Stripe;
  let stripeHelperStub: StripeHelper;
  let paypalHelperStub: PayPalHelper;

  beforeEach(() => {
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

    planCanceller = new PlanCanceller(
      'planId',
      'refund',
      ['exclude'],
      './cancel-subscriptions-to-plan.tmp.csv',
      stripeHelperStub,
      paypalHelperStub,
      false,
      20
    );
  });

  describe('run', () => {
    let autoPagingEachStub: sinon.SinonStub;
    let processSubscriptionStub: sinon.SinonStub;
    let writeReportHeaderStub: sinon.SinonStub;
    const mockSubs = [mockSubscription];

    beforeEach(async () => {
      autoPagingEachStub = sinon.stub().callsFake(async (callback: any) => {
        for (const sub of mockSubs) {
          await callback(sub);
        }
      });

      stripeStub.subscriptions.list = sinon.stub().returns({
        autoPagingEach: autoPagingEachStub,
      }) as any;

      processSubscriptionStub = sinon.stub().resolves();
      planCanceller.processSubscription = processSubscriptionStub;

      writeReportHeaderStub = sinon.stub().resolves();
      planCanceller.writeReportHeader = writeReportHeaderStub;

      await planCanceller.run();
    });

    it('writes report header', () => {
      expect(writeReportHeaderStub.calledOnce).true;
    });

    it('calls Stripe subscriptions.list with correct parameters', () => {
      sinon.assert.calledWith(stripeStub.subscriptions.list as any, {
        price: 'planId',
        limit: 100,
      });
    });

    it('calls autoPagingEach to iterate through all subscriptions', () => {
      sinon.assert.calledOnce(autoPagingEachStub);
    });

    it('processes each subscription', () => {
      sinon.assert.calledOnce(processSubscriptionStub);
      sinon.assert.calledWith(processSubscriptionStub, mockSubscription);
    });
  });

  describe('processSubscription', () => {
    const mockSub = {
      id: 'test',
      customer: 'test',
      plan: {
        product: 'example-product',
      },
      status: 'active',
    } as unknown as Stripe.Subscription;
    let logStub: sinon.SinonStub;
    let cancelStub: sinon.SinonStub;
    let attemptFullRefundStub: sinon.SinonStub;
    let attemptProratedRefundStub: sinon.SinonStub;
    let isCustomerExcludedStub: sinon.SinonStub;
    let writeReportStub: sinon.SinonStub;

    beforeEach(async () => {
      stripeStub.products.retrieve = sinon.stub().resolves(mockProduct);
      stripeStub.subscriptions.cancel = sinon.stub().resolves();
      cancelStub = stripeStub.subscriptions.cancel as sinon.SinonStub;

      planCanceller.fetchCustomer = sinon.stub().resolves(mockCustomer);

      attemptFullRefundStub = sinon.stub().resolves(1000);
      planCanceller.attemptFullRefund = attemptFullRefundStub;

      attemptProratedRefundStub = sinon.stub().resolves(500);
      planCanceller.attemptProratedRefund = attemptProratedRefundStub;

      isCustomerExcludedStub = sinon.stub().returns(false);
      planCanceller.isCustomerExcluded = isCustomerExcludedStub;

      writeReportStub = sinon.stub().resolves();
      planCanceller.writeReport = writeReportStub;

      logStub = sinon.stub(console, 'log');
    });

    afterEach(() => {
      logStub.restore();
    });

    describe('success - not excluded', () => {
      beforeEach(async () => {
        await planCanceller.processSubscription(mockSub);
      });

      it('fetches customer', () => {
        sinon.assert.calledOnce(planCanceller.fetchCustomer as sinon.SinonStub);
      });

      it('cancels subscription', () => {
        sinon.assert.calledWith(cancelStub, 'test', { prorate: false });
      });

      it('writes report', () => {
        sinon.assert.calledWith(writeReportStub, sinon.match({
          subscription: mockSub,
          customer: mockCustomer,
          isExcluded: false,
          amountRefunded: 1000,
          isOwed: false,
          error: false,
        }));
      });
    });

    describe('success - with refund', () => {
      beforeEach(async () => {
        attemptFullRefundStub.resolves(1000);
        await planCanceller.processSubscription(mockSub);
      });

      it('writes report with refund amount', () => {
        sinon.assert.calledWith(writeReportStub, sinon.match({
          subscription: mockSub,
          customer: mockCustomer,
          isExcluded: false,
          amountRefunded: 1000,
          isOwed: false,
          error: false,
        }));
      });
    });

    describe('dry run', () => {
      beforeEach(async () => {
        planCanceller.dryRun = true;
        await planCanceller.processSubscription(mockSub);
      });

      it('does not cancel subscription', () => {
        sinon.assert.notCalled(cancelStub);
      });

      it('attempts refund', () => {
        sinon.assert.calledOnce(attemptFullRefundStub);
      });

      it('writes report', () => {
        sinon.assert.calledWith(writeReportStub, sinon.match({
          subscription: mockSub,
          customer: mockCustomer,
          isExcluded: false,
          amountRefunded: 1000,
          isOwed: false,
          error: false,
        }));
      });
    });

    describe('customer excluded', () => {
      beforeEach(async () => {
        isCustomerExcludedStub.returns(true);
        await planCanceller.processSubscription(mockSub);
      });

      it('does not cancel subscription', () => {
        sinon.assert.notCalled(cancelStub);
      });

      it('writes report marking as excluded', () => {
        sinon.assert.calledWith(writeReportStub, sinon.match({
          subscription: mockSub,
          customer: mockCustomer,
          isExcluded: true,
          amountRefunded: null,
          isOwed: false,
          error: false,
        }));
      });
    });

    describe('invalid', () => {
      it('writes error report if customer does not exist', async () => {
        planCanceller.fetchCustomer = sinon.stub().resolves(null);
        await planCanceller.processSubscription(mockSub);

        sinon.assert.calledWith(writeReportStub, sinon.match({
          subscription: mockSub,
          customer: null,
          isExcluded: false,
          amountRefunded: null,
          isOwed: false,
          error: true,
        }));
      });

      it('writes error report if unexpected error occurs', async () => {
        cancelStub.rejects(new Error('test error'));
        await planCanceller.processSubscription(mockSub);

        sinon.assert.calledWith(writeReportStub, sinon.match({
          subscription: mockSub,
          customer: null,
          isExcluded: false,
          amountRefunded: null,
          isOwed: false,
          error: true,
        }));
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

  describe('attemptFullRefund', () => {
    let invoiceRetrieveStub: sinon.SinonStub;
    let refundCreateStub: sinon.SinonStub;
    let refundInvoiceStub: sinon.SinonStub;
    const mockFullRefundInvoice = {
      charge: 'ch_123',
      amount_paid: 1000,
      paid_out_of_band: false,
    };

    beforeEach(() => {
      invoiceRetrieveStub = sinon.stub().resolves(mockFullRefundInvoice);
      stripeStub.invoices.retrieve = invoiceRetrieveStub;

      refundCreateStub = sinon.stub().resolves();
      stripeStub.refunds.create = refundCreateStub;

      refundInvoiceStub = sinon.stub().resolves();
      paypalHelperStub.refundInvoice = refundInvoiceStub;
    });

    describe('Stripe refund', () => {
      beforeEach(async () => {
        await planCanceller.attemptFullRefund(mockSubscription);
      });

      it('retrieves invoice', () => {
        sinon.assert.calledWith(invoiceRetrieveStub, mockSubscription.latest_invoice);
      });

      it('creates refund', () => {
        sinon.assert.calledWith(refundCreateStub, {
          charge: mockFullRefundInvoice.charge,
        });
      });

      it('returns amount refunded', async () => {
        const result = await planCanceller.attemptFullRefund(mockSubscription);
        expect(result).to.equal(1000);
      });
    });

    describe('PayPal refund', () => {
      const mockPaypalInvoice = {
        ...mockFullRefundInvoice,
        paid_out_of_band: true,
      };

      beforeEach(async () => {
        invoiceRetrieveStub.resolves(mockPaypalInvoice);
        await planCanceller.attemptFullRefund(mockSubscription);
      });

      it('calls PayPal refund', () => {
        sinon.assert.calledWith(refundInvoiceStub, mockPaypalInvoice);
      });
    });

    describe('dry run', () => {
      beforeEach(async () => {
        planCanceller.dryRun = true;
        await planCanceller.attemptFullRefund(mockSubscription);
      });

      it('does not create refund', () => {
        sinon.assert.notCalled(refundCreateStub);
      });
    });

    describe('errors', () => {
      it('throws if subscription has no latest_invoice', async () => {
        const subWithoutInvoice = { ...mockSubscription, latest_invoice: null };
        await expect(
          planCanceller.attemptFullRefund(subWithoutInvoice)
        ).to.be.rejectedWith('No latest invoice');
      });

      it('throws if invoice has no charge', async () => {
        invoiceRetrieveStub.resolves({ ...mockFullRefundInvoice, charge: null });
        await expect(
          planCanceller.attemptFullRefund(mockSubscription)
        ).to.be.rejectedWith('No charge');
      });
    });
  });

  describe('attemptProratedRefund', () => {
    let invoiceRetrieveStub: sinon.SinonStub;
    let refundCreateStub: sinon.SinonStub;
    let refundInvoiceStub: sinon.SinonStub;
    const now = Math.floor(Date.now() / 1000);
    const mockProratedSubscription = {
      ...mockSubscription,
      current_period_start: now - 86400 * 2,
      current_period_end: now + 86400 * 28,
    };
    const mockProratedInvoice = {
      charge: 'ch_123',
      amount_paid: 10000,
      paid: true,
      paid_out_of_band: false,
      created: Math.floor(Date.now() / 1000) - 86400,
    };

    beforeEach(() => {
      invoiceRetrieveStub = sinon.stub().resolves(mockProratedInvoice);
      stripeStub.invoices.retrieve = invoiceRetrieveStub;

      refundCreateStub = sinon.stub().resolves();
      stripeStub.refunds.create = refundCreateStub;

      refundInvoiceStub = sinon.stub().resolves();
      paypalHelperStub.refundInvoice = refundInvoiceStub;

      planCanceller = new PlanCanceller(
        'planId',
        'proratedRefund',
        ['exclude'],
        './cancel-subscriptions-to-plan.tmp.csv',
        stripeHelperStub,
        paypalHelperStub,
        false,
        20
      );
    });

    describe('Stripe refund', () => {
      it('retrieves invoice', async () => {
        await planCanceller.attemptProratedRefund(mockProratedSubscription);
        sinon.assert.calledWith(invoiceRetrieveStub, mockProratedSubscription.latest_invoice);
      });

      it('creates refund with calculated amount', async () => {
        await planCanceller.attemptProratedRefund(mockProratedSubscription);

        const oneDayMs = 1000 * 60 * 60 * 24;
        const periodStart = new Date(mockProratedSubscription.current_period_start * 1000);
        const periodEnd = new Date(mockProratedSubscription.current_period_end * 1000);
        const nowTime = new Date();
        const totalPeriodMs = periodEnd.getTime() - periodStart.getTime();
        const timeRemainingMs = periodEnd.getTime() - nowTime.getTime();
        const totalDaysInPeriod = Math.floor(totalPeriodMs / oneDayMs);
        const daysRemaining = Math.floor(timeRemainingMs / oneDayMs);
        const expectedRefund = Math.floor((daysRemaining / totalDaysInPeriod) * 10000);

        sinon.assert.calledWith(refundCreateStub, sinon.match({
          charge: mockProratedInvoice.charge,
          amount: expectedRefund,
        }));
      });
    });

    describe('PayPal refund - partial', () => {
      const mockPaypalInvoice = {
        ...mockProratedInvoice,
        paid_out_of_band: true,
      };

      beforeEach(async () => {
        invoiceRetrieveStub.resolves(mockPaypalInvoice);
        await planCanceller.attemptProratedRefund(mockProratedSubscription);
      });

      it('calls PayPal refund with partial amount', () => {
        const oneDayMs = 1000 * 60 * 60 * 24;
        const periodStart = new Date(mockProratedSubscription.current_period_start * 1000);
        const periodEnd = new Date(mockProratedSubscription.current_period_end * 1000);
        const nowTime = new Date();
        const totalPeriodMs = periodEnd.getTime() - periodStart.getTime();
        const timeRemainingMs = periodEnd.getTime() - nowTime.getTime();
        const totalDaysInPeriod = Math.floor(totalPeriodMs / oneDayMs);
        const daysRemaining = Math.floor(timeRemainingMs / oneDayMs);
        const expectedRefund = Math.floor((daysRemaining / totalDaysInPeriod) * 10000);

        sinon.assert.calledWith(refundInvoiceStub, mockPaypalInvoice, {
          refundType: 'Partial',
          amount: expectedRefund,
        });
      });
    });

    describe('dry run', () => {
      beforeEach(async () => {
        planCanceller.dryRun = true;
        await planCanceller.attemptProratedRefund(mockProratedSubscription);
      });

      it('does not create refund', () => {
        sinon.assert.notCalled(refundCreateStub);
      });
    });

    describe('errors', () => {
      it('throws if subscription has no latest_invoice', async () => {
        const subWithoutInvoice = { ...mockProratedSubscription, latest_invoice: null };
        await expect(
          planCanceller.attemptProratedRefund(subWithoutInvoice)
        ).to.be.rejectedWith('No latest invoice');
      });

      it('throws if invoice is not paid', async () => {
        invoiceRetrieveStub.resolves({ ...mockProratedInvoice, paid: false });
        await expect(
          planCanceller.attemptProratedRefund(mockProratedSubscription)
        ).to.be.rejectedWith('Customer is pending renewal');
      });

      it('throws if refund amount exceeds amount paid', async () => {
        const mockSmallInvoice = {
          ...mockProratedInvoice,
          amount_paid: 0,
        };
        invoiceRetrieveStub.resolves(mockSmallInvoice);
        await expect(
          planCanceller.attemptProratedRefund(mockProratedSubscription)
        ).to.be.rejectedWith('less than or equal to zero');
      });

      it('throws if invoice has no charge for Stripe refund', async () => {
        invoiceRetrieveStub.resolves({ ...mockProratedInvoice, charge: null });
        await expect(
          planCanceller.attemptProratedRefund(mockProratedSubscription)
        ).to.be.rejectedWith('No charge');
      });
    });
  });
});
