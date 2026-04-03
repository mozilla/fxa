/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';

import { CustomerPlanMover } from './move-customers-to-new-plan-v2';
import Stripe from 'stripe';
import { PayPalHelper } from '../../lib/payments/paypal';

import customer1 from '../../test/local/payments/fixtures/stripe/customer1.json';
import subscription1 from '../../test/local/payments/fixtures/stripe/subscription1.json';
import invoicePaid from '../../test/local/payments/fixtures/stripe/invoice_paid.json';

const mockCustomer = customer1 as unknown as Stripe.Customer;
const mockSubscription = subscription1 as unknown as Stripe.Subscription;
const mockInvoice = invoicePaid as unknown as Stripe.Invoice;
const mockPrice = {
  id: 'destination-price-id',
  currency: 'usd',
  unit_amount: 999,
} as unknown as Stripe.Price;

describe('CustomerPlanMover v2', () => {
  let customerPlanMover: CustomerPlanMover;
  let stripeStub: Stripe;
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

    paypalHelperStub = {
      refundInvoice: sinon.stub(),
    } as unknown as PayPalHelper;

    customerPlanMover = new CustomerPlanMover(
      'source-price-id',
      'destination-price-id',
      ['exclude-price-id'],
      './move-customers-to-new-plan-output.tmp.csv',
      stripeStub,
      false,
      20,
      null,
      null,
      'none',
      false,
      false,
      paypalHelperStub
    );
  });

  describe('constructor', () => {
    it('throws error if proratedRefundRate is less than or equal to zero', () => {
      expect(() => {
        void new CustomerPlanMover(
          'source-price-id',
          'destination-price-id',
          [],
          './output.csv',
          stripeStub,
          false,
          20,
          0,
          null,
          'none',
          false,
          false,
          paypalHelperStub
        );
      }).toThrow('proratedRefundRate must be greater than zero');
    });

    it('does not throw error if proratedRefundRate is null', () => {
      expect(() => {
        void new CustomerPlanMover(
          'source-price-id',
          'destination-price-id',
          [],
          './output.csv',
          stripeStub,
          false,
          20,
          null,
          null,
          'none',
          false,
          false,
          paypalHelperStub
        );
      }).not.toThrow();
    });

    it('does not throw error if proratedRefundRate is positive', () => {
      expect(() => {
        void new CustomerPlanMover(
          'source-price-id',
          'destination-price-id',
          [],
          './output.csv',
          stripeStub,
          false,
          20,
          100,
          null,
          'none',
          false,
          false,
          paypalHelperStub
        );
      }).not.toThrow();
    });
  });

  describe('convert', () => {
    let convertSubscriptionStub: sinon.SinonStub;
    let writeReportHeaderStub: sinon.SinonStub;

    beforeEach(async () => {
      // Mock the async iterable returned by stripe.subscriptions.list
      const asyncIterable = {
        async *[Symbol.asyncIterator]() {
          // Empty generator for testing setup
        },
      };

      stripeStub.subscriptions.list = sinon
        .stub()
        .returns(asyncIterable) as any;

      stripeStub.prices = {
        retrieve: sinon.stub().resolves(mockPrice),
      } as any;

      writeReportHeaderStub = sinon.stub().resolves();
      customerPlanMover.writeReportHeader = writeReportHeaderStub;

      convertSubscriptionStub = sinon.stub().resolves();
      customerPlanMover.convertSubscription = convertSubscriptionStub;

      await customerPlanMover.convert();
    });

    it('writes report header', () => {
      expect(writeReportHeaderStub.calledOnce).toBe(true);
    });

    it('lists subscriptions with source price id', () => {
      expect(
        (stripeStub.subscriptions.list as sinon.SinonStub).calledWith({
          price: 'source-price-id',
          limit: 100,
        })
      ).toBe(true);
    });
  });

  describe('convertSubscription', () => {
    const mockStripeSubscription = {
      id: 'sub_123',
      customer: 'cus_123',
      status: 'active',
      items: {
        data: [
          {
            id: 'si_123',
            plan: {
              id: 'price_123',
            },
          },
        ],
      },
    } as unknown as Stripe.Subscription;

    let logStub: sinon.SinonStub;
    let errorStub: sinon.SinonStub;
    let fetchCustomerStub: sinon.SinonStub;
    let isCustomerExcludedStub: sinon.SinonStub;
    let writeReportStub: sinon.SinonStub;

    beforeEach(() => {
      logStub = sinon.stub(console, 'log');
      errorStub = sinon.stub(console, 'error');
      fetchCustomerStub = sinon.stub().resolves({
        ...mockCustomer,
        subscriptions: {
          data: [mockStripeSubscription],
        },
      });
      customerPlanMover.fetchCustomer = fetchCustomerStub;

      isCustomerExcludedStub = sinon.stub().returns(false);
      customerPlanMover.isCustomerExcluded = isCustomerExcludedStub;

      writeReportStub = sinon.stub().resolves();
      customerPlanMover.writeReport = writeReportStub;
    });

    afterEach(() => {
      logStub.restore();
      errorStub.restore();
    });

    describe('success - not excluded', () => {
      beforeEach(async () => {
        stripeStub.subscriptions.update = sinon
          .stub()
          .resolves(mockStripeSubscription);

        await customerPlanMover.convertSubscription(
          mockStripeSubscription,
          mockPrice
        );
      });

      it('fetches customer', () => {
        expect(fetchCustomerStub.calledWith('cus_123')).toBe(true);
      });

      it('updates subscription to destination price', () => {
        expect(
          (stripeStub.subscriptions.update as sinon.SinonStub).calledWith(
            'sub_123',
            sinon.match({
              items: [
                {
                  id: 'si_123',
                  price: 'destination-price-id',
                },
              ],
              discounts: undefined,
              proration_behavior: 'none',
              billing_cycle_anchor: 'unchanged',
            })
          )
        ).toBe(true);
      });

      it('writes report', () => {
        expect(writeReportStub.calledOnce).toBe(true);
        const reportArgs = writeReportStub.firstCall.args[0];
        expect(reportArgs.subscription.id).toBe('sub_123');
        expect(reportArgs.isExcluded).toBe(false);
        expect(reportArgs.amountRefunded).toBe(null);
        expect(reportArgs.approximateAmountWasOwed).toBe(null);
        expect(reportArgs.daysUntilNextBill).toBe(null);
        expect(reportArgs.daysSinceLastBill).toBe(null);
        expect(reportArgs.previousInvoiceAmountDue).toBe(null);
        expect(reportArgs.isOwed).toBe(false);
        expect(reportArgs.error).toBe(false);
      });
    });

    describe('success - with coupon', () => {
      beforeEach(async () => {
        customerPlanMover = new CustomerPlanMover(
          'source-price-id',
          'destination-price-id',
          [],
          './output.csv',
          stripeStub,
          false,
          20,
          null,
          'test-coupon',
          'none',
          false,
          false,
          paypalHelperStub
        );
        customerPlanMover.fetchCustomer = fetchCustomerStub;
        customerPlanMover.isCustomerExcluded = isCustomerExcludedStub;
        customerPlanMover.writeReport = writeReportStub;

        stripeStub.subscriptions.update = sinon
          .stub()
          .resolves(mockStripeSubscription);

        await customerPlanMover.convertSubscription(
          mockStripeSubscription,
          mockPrice
        );
      });

      it('applies coupon to subscription', () => {
        expect(
          (stripeStub.subscriptions.update as sinon.SinonStub).calledWith(
            'sub_123',
            sinon.match({
              items: [
                {
                  id: 'si_123',
                  price: 'destination-price-id',
                },
              ],
              discounts: [{ coupon: 'test-coupon' }],
              proration_behavior: 'none',
              billing_cycle_anchor: 'unchanged',
            })
          )
        ).toBe(true);
      });
    });

    describe('success - with proration behavior', () => {
      beforeEach(async () => {
        customerPlanMover = new CustomerPlanMover(
          'source-price-id',
          'destination-price-id',
          [],
          './output.csv',
          stripeStub,
          false,
          20,
          null,
          null,
          'create_prorations',
          false,
          false,
          paypalHelperStub
        );
        customerPlanMover.fetchCustomer = fetchCustomerStub;
        customerPlanMover.isCustomerExcluded = isCustomerExcludedStub;
        customerPlanMover.writeReport = writeReportStub;

        stripeStub.subscriptions.update = sinon
          .stub()
          .resolves(mockStripeSubscription);

        await customerPlanMover.convertSubscription(
          mockStripeSubscription,
          mockPrice
        );
      });

      it('uses specified proration behavior', () => {
        expect(
          (stripeStub.subscriptions.update as sinon.SinonStub).calledWith(
            'sub_123',
            sinon.match({
              items: [
                {
                  id: 'si_123',
                  price: 'destination-price-id',
                },
              ],
              discounts: undefined,
              proration_behavior: 'create_prorations',
              billing_cycle_anchor: 'unchanged',
            })
          )
        ).toBe(true);
      });
    });

    describe('success - with reset billing cycle anchor', () => {
      beforeEach(async () => {
        customerPlanMover = new CustomerPlanMover(
          'source-price-id',
          'destination-price-id',
          [],
          './output.csv',
          stripeStub,
          false,
          20,
          null,
          null,
          'none',
          false,
          true,
          paypalHelperStub
        );
        customerPlanMover.fetchCustomer = fetchCustomerStub;
        customerPlanMover.isCustomerExcluded = isCustomerExcludedStub;
        customerPlanMover.writeReport = writeReportStub;

        stripeStub.subscriptions.update = sinon
          .stub()
          .resolves(mockStripeSubscription);

        await customerPlanMover.convertSubscription(
          mockStripeSubscription,
          mockPrice
        );
      });

      it('sets billing_cycle_anchor to "now"', () => {
        expect(
          (stripeStub.subscriptions.update as sinon.SinonStub).calledWith(
            'sub_123',
            sinon.match({
              billing_cycle_anchor: 'now',
            })
          )
        ).toBe(true);
      });
    });

    describe('success - without reset billing cycle anchor', () => {
      beforeEach(async () => {
        customerPlanMover = new CustomerPlanMover(
          'source-price-id',
          'destination-price-id',
          [],
          './output.csv',
          stripeStub,
          false,
          20,
          null,
          null,
          'none',
          false,
          false,
          paypalHelperStub
        );
        customerPlanMover.fetchCustomer = fetchCustomerStub;
        customerPlanMover.isCustomerExcluded = isCustomerExcludedStub;
        customerPlanMover.writeReport = writeReportStub;

        stripeStub.subscriptions.update = sinon
          .stub()
          .resolves(mockStripeSubscription);

        await customerPlanMover.convertSubscription(
          mockStripeSubscription,
          mockPrice
        );
      });

      it('sets billing_cycle_anchor to "unchanged"', () => {
        expect(
          (stripeStub.subscriptions.update as sinon.SinonStub).calledWith(
            'sub_123',
            sinon.match({
              billing_cycle_anchor: 'unchanged',
            })
          )
        ).toBe(true);
      });
    });

    describe('success - with prorated refund', () => {
      let attemptRefundStub: sinon.SinonStub;

      beforeEach(async () => {
        customerPlanMover = new CustomerPlanMover(
          'source-price-id',
          'destination-price-id',
          [],
          './output.csv',
          stripeStub,
          false,
          20,
          100,
          null,
          'none',
          false,
          false,
          paypalHelperStub
        );
        customerPlanMover.fetchCustomer = fetchCustomerStub;
        customerPlanMover.isCustomerExcluded = isCustomerExcludedStub;
        customerPlanMover.writeReport = writeReportStub;

        attemptRefundStub = sinon.stub().resolves(500);
        customerPlanMover.attemptRefund = attemptRefundStub;

        stripeStub.subscriptions.update = sinon
          .stub()
          .resolves(mockStripeSubscription);

        await customerPlanMover.convertSubscription(
          mockStripeSubscription,
          mockPrice
        );
      });

      it('attempts refund', () => {
        expect(attemptRefundStub.calledWith(mockStripeSubscription)).toBe(true);
      });

      it('writes report with refund amount', () => {
        const reportArgs = writeReportStub.firstCall.args[0];
        expect(reportArgs.amountRefunded).toBe(500);
        expect(reportArgs.isOwed).toBe(false);
        expect(reportArgs.error).toBe(false);
      });
    });

    describe('refund failure', () => {
      let attemptRefundStub: sinon.SinonStub;

      beforeEach(async () => {
        customerPlanMover = new CustomerPlanMover(
          'source-price-id',
          'destination-price-id',
          [],
          './output.csv',
          stripeStub,
          false,
          20,
          100,
          null,
          'none',
          false,
          false,
          paypalHelperStub
        );
        customerPlanMover.fetchCustomer = fetchCustomerStub;
        customerPlanMover.isCustomerExcluded = isCustomerExcludedStub;
        customerPlanMover.writeReport = writeReportStub;

        attemptRefundStub = sinon.stub().rejects(new Error('Refund failed'));
        customerPlanMover.attemptRefund = attemptRefundStub;

        stripeStub.subscriptions.update = sinon
          .stub()
          .resolves(mockStripeSubscription);

        await customerPlanMover.convertSubscription(
          mockStripeSubscription,
          mockPrice
        );
      });

      it('marks customer as owed', () => {
        const reportArgs = writeReportStub.firstCall.args[0];
        expect(reportArgs.isOwed).toBe(true);
        expect(reportArgs.amountRefunded).toBe(null);
        expect(reportArgs.error).toBe(false);
      });
    });

    describe('dry run', () => {
      beforeEach(async () => {
        customerPlanMover.dryRun = true;
        stripeStub.subscriptions.update = sinon
          .stub()
          .resolves(mockStripeSubscription);

        await customerPlanMover.convertSubscription(
          mockStripeSubscription,
          mockPrice
        );
      });

      it('does not update subscription', () => {
        expect(
          (stripeStub.subscriptions.update as sinon.SinonStub).notCalled
        ).toBe(true);
      });

      it('still writes report', () => {
        expect(writeReportStub.calledOnce).toBe(true);
      });
    });

    describe('customer excluded', () => {
      beforeEach(async () => {
        isCustomerExcludedStub.returns(true);
        stripeStub.subscriptions.update = sinon
          .stub()
          .resolves(mockStripeSubscription);

        await customerPlanMover.convertSubscription(
          mockStripeSubscription,
          mockPrice
        );
      });

      it('does not update subscription', () => {
        expect(
          (stripeStub.subscriptions.update as sinon.SinonStub).notCalled
        ).toBe(true);
      });

      it('writes report marking as excluded', () => {
        const reportArgs = writeReportStub.firstCall.args[0];
        expect(reportArgs.isExcluded).toBe(true);
        expect(reportArgs.error).toBe(false);
        expect(reportArgs.amountRefunded).toBe(null);
        expect(reportArgs.isOwed).toBe(false);
      });
    });

    describe('subscription set to cancel', () => {
      beforeEach(async () => {
        customerPlanMover = new CustomerPlanMover(
          'source-price-id',
          'destination-price-id',
          [],
          './output.csv',
          stripeStub,
          false,
          20,
          null,
          null,
          'none',
          true,
          false,
          paypalHelperStub
        );
        customerPlanMover.fetchCustomer = fetchCustomerStub;
        customerPlanMover.isCustomerExcluded = isCustomerExcludedStub;
        customerPlanMover.writeReport = writeReportStub;

        stripeStub.subscriptions.update = sinon
          .stub()
          .resolves(mockStripeSubscription);

        const subscriptionSetToCancel = {
          ...mockStripeSubscription,
          cancel_at_period_end: true,
        } as Stripe.Subscription;

        await customerPlanMover.convertSubscription(
          subscriptionSetToCancel,
          mockPrice
        );
      });

      it('does not update subscription', () => {
        expect(
          (stripeStub.subscriptions.update as sinon.SinonStub).notCalled
        ).toBe(true);
      });

      it('does not write report', () => {
        expect(writeReportStub.notCalled).toBe(true);
      });

      it('logs skip message', () => {
        expect(
          logStub.calledWith(
            sinon.match(/Skipping subscription.*set to cancel/)
          )
        ).toBe(true);
      });
    });

    describe('invalid', () => {
      it('writes error report if subscription is not active', async () => {
        const inactiveSubscription = {
          ...mockStripeSubscription,
          status: 'canceled',
        } as Stripe.Subscription;

        await customerPlanMover.convertSubscription(
          inactiveSubscription,
          mockPrice
        );

        expect(writeReportStub.calledOnce).toBe(true);
        const reportArgs = writeReportStub.firstCall.args[0];
        expect(reportArgs.customer).toBe(null);
        expect(reportArgs.error).toBe(true);
        expect(reportArgs.isOwed).toBe(false);
        expect(reportArgs.isExcluded).toBe(false);
      });

      it('writes error report if customer does not exist', async () => {
        customerPlanMover.fetchCustomer = sinon.stub().resolves(null);

        await customerPlanMover.convertSubscription(
          mockStripeSubscription,
          mockPrice
        );

        expect(writeReportStub.calledOnce).toBe(true);
        const reportArgs = writeReportStub.firstCall.args[0];
        expect(reportArgs.customer).toBe(null);
        expect(reportArgs.error).toBe(true);
        expect(reportArgs.isOwed).toBe(false);
        expect(reportArgs.isExcluded).toBe(false);
      });

      it('writes error report if customer has no subscriptions data', async () => {
        customerPlanMover.fetchCustomer = sinon.stub().resolves({
          ...mockCustomer,
          subscriptions: undefined,
        });

        await customerPlanMover.convertSubscription(
          mockStripeSubscription,
          mockPrice
        );

        expect(writeReportStub.calledOnce).toBe(true);
        const reportArgs = writeReportStub.firstCall.args[0];
        expect(reportArgs.error).toBe(true);
        expect(reportArgs.isOwed).toBe(false);
        expect(reportArgs.isExcluded).toBe(false);
      });

      it('writes error report if subscription update fails', async () => {
        stripeStub.subscriptions.update = sinon
          .stub()
          .rejects(new Error('Update failed'));

        await customerPlanMover.convertSubscription(
          mockStripeSubscription,
          mockPrice
        );

        expect(writeReportStub.calledOnce).toBe(true);
        const reportArgs = writeReportStub.firstCall.args[0];
        expect(reportArgs.error).toBe(true);
        expect(reportArgs.isOwed).toBe(false);
        expect(reportArgs.isExcluded).toBe(false);
      });

      it('writes error report if unexpected error occurs', async () => {
        customerPlanMover.fetchCustomer = sinon
          .stub()
          .rejects(new Error('Unexpected error'));

        await customerPlanMover.convertSubscription(
          mockStripeSubscription,
          mockPrice
        );

        expect(writeReportStub.calledOnce).toBe(true);
        const reportArgs = writeReportStub.firstCall.args[0];
        expect(reportArgs.error).toBe(true);
        expect(reportArgs.customer).toBe(null);
        expect(reportArgs.isOwed).toBe(false);
        expect(reportArgs.isExcluded).toBe(false);
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

      it('fetches customer from Stripe with subscriptions expanded', () => {
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

        result = await customerPlanMover.fetchCustomer(mockCustomer.id);
      });

      it('returns null', () => {
        sinon.assert.match(result, null);
      });
    });
  });

  describe('attemptRefund', () => {
    const now = Math.floor(Date.now() / 1000);
    const mockSubscriptionWithInvoice = {
      ...mockSubscription,
      id: 'sub_123',
      latest_invoice: 'inv_123',
      current_period_start: now - 86400 * 25,
      current_period_end: now + 86400 * 10,
    } as Stripe.Subscription;

    const mockPaidInvoice = {
      ...mockInvoice,
      id: 'inv_123',
      paid: true,
      amount_due: 2000,
      created: Math.floor(Date.now() / 1000) - 86400 * 5,
      charge: 'ch_123',
      paid_out_of_band: false,
    } as unknown as Stripe.Invoice;

    let enqueueRequestStub: sinon.SinonStub;
    let logStub: sinon.SinonStub;

    beforeEach(() => {
      customerPlanMover = new CustomerPlanMover(
        'source-price-id',
        'destination-price-id',
        [],
        './output.csv',
        stripeStub,
        false,
        20,
        100,
        null,
        'none',
        false,
        false,
        paypalHelperStub
      );

      enqueueRequestStub = sinon.stub();
      customerPlanMover.enqueueRequest = enqueueRequestStub;
      logStub = sinon.stub(console, 'log');
    });

    afterEach(() => {
      logStub.restore();
    });

    describe('Stripe refund', () => {
      beforeEach(async () => {
        enqueueRequestStub.onFirstCall().resolves(mockPaidInvoice);
        enqueueRequestStub.onSecondCall().resolves({});

        await customerPlanMover.attemptRefund(mockSubscriptionWithInvoice);
      });

      it('retrieves invoice', () => {
        expect(enqueueRequestStub.calledTwice).toBe(true);
      });

      it('creates refund', () => {
        expect(enqueueRequestStub.calledTwice).toBe(true);
      });
    });

    describe('PayPal refund - full', () => {
      let calculatedRefundAmount: number;
      let mockPayPalInvoice: Stripe.Invoice;

      beforeEach(async () => {
        const now = new Date().getTime();
        const nextBillAt = new Date(
          mockSubscriptionWithInvoice.current_period_end * 1000
        );
        const timeUntilBillMs = nextBillAt.getTime() - now;
        const daysUntilBill = Math.floor(
          timeUntilBillMs / (1000 * 60 * 60 * 24)
        );
        calculatedRefundAmount = daysUntilBill * 100;

        mockPayPalInvoice = {
          ...mockPaidInvoice,
          amount_due: calculatedRefundAmount,
          paid_out_of_band: true,
        } as unknown as Stripe.Invoice;

        enqueueRequestStub.resolves(mockPayPalInvoice);

        await customerPlanMover.attemptRefund(mockSubscriptionWithInvoice);
      });

      it('calls paypalHelper.refundInvoice with full refund', () => {
        expect(
          (paypalHelperStub.refundInvoice as sinon.SinonStub).calledOnce
        ).toBe(true);
        const args = (paypalHelperStub.refundInvoice as sinon.SinonStub)
          .firstCall.args;
        expect(args[1].refundType).toBe('Full');
      });
    });

    describe('PayPal refund - partial', () => {
      let calculatedRefundAmount: number;
      let mockPayPalInvoice: Stripe.Invoice;

      beforeEach(async () => {
        const now = new Date().getTime();
        const nextBillAt = new Date(
          mockSubscriptionWithInvoice.current_period_end * 1000
        );
        const timeUntilBillMs = nextBillAt.getTime() - now;
        const daysUntilBill = Math.floor(
          timeUntilBillMs / (1000 * 60 * 60 * 24)
        );
        calculatedRefundAmount = daysUntilBill * 100;

        mockPayPalInvoice = {
          ...mockPaidInvoice,
          amount_due: calculatedRefundAmount * 2,
          paid_out_of_band: true,
        } as unknown as Stripe.Invoice;

        enqueueRequestStub.resolves(mockPayPalInvoice);

        await customerPlanMover.attemptRefund(mockSubscriptionWithInvoice);
      });

      it('calls paypalHelper.refundInvoice with partial refund', () => {
        expect(
          (paypalHelperStub.refundInvoice as sinon.SinonStub).calledOnce
        ).toBe(true);
        const args = (paypalHelperStub.refundInvoice as sinon.SinonStub)
          .firstCall.args;
        expect(args[1].refundType).toBe('Partial');
        expect(args[1].amount).toBe(calculatedRefundAmount);
      });
    });

    describe('dry run', () => {
      beforeEach(async () => {
        customerPlanMover.dryRun = true;
        enqueueRequestStub.resolves(mockPaidInvoice);

        await customerPlanMover.attemptRefund(mockSubscriptionWithInvoice);
      });

      it('does not create refund', () => {
        expect(enqueueRequestStub.callCount).toBe(1); // Only invoice retrieval
      });
    });

    describe('errors', () => {
      it('throws if proratedRefundRate is not set', async () => {
        customerPlanMover = new CustomerPlanMover(
          'source-price-id',
          'destination-price-id',
          [],
          './output.csv',
          stripeStub,
          false,
          20,
          null,
          null,
          'none',
          false,
          false,
          paypalHelperStub
        );

        await expect(
          customerPlanMover.attemptRefund(mockSubscriptionWithInvoice)
        ).rejects.toThrow('proratedRefundRate must be specified');
      });

      it('throws if subscription has no latest_invoice', async () => {
        const subWithoutInvoice = {
          ...mockSubscription,
          latest_invoice: null,
        } as Stripe.Subscription;

        await expect(
          customerPlanMover.attemptRefund(subWithoutInvoice)
        ).rejects.toThrow('No latest invoice');
      });

      it('throws if invoice is not paid', async () => {
        const unpaidInvoice = {
          ...mockPaidInvoice,
          paid: false,
        } as Stripe.Invoice;
        enqueueRequestStub.resolves(unpaidInvoice);

        await expect(
          customerPlanMover.attemptRefund(mockSubscriptionWithInvoice)
        ).rejects.toThrow('Customer is pending renewal right now!');
      });

      it('throws if refund amount exceeds amount paid', async () => {
        const oldInvoice = {
          ...mockPaidInvoice,
          amount_due: 100,
          created: Math.floor(Date.now() / 1000) - 86400 * 50, // 50 days ago
        } as Stripe.Invoice;
        enqueueRequestStub.resolves(oldInvoice);

        await expect(
          customerPlanMover.attemptRefund(mockSubscriptionWithInvoice)
        ).rejects.toThrow('Will not refund');
      });

      it('throws if invoice has no charge for Stripe refund', async () => {
        const invoiceNoCharge = {
          ...mockPaidInvoice,
          charge: null,
        } as unknown as Stripe.Invoice;
        enqueueRequestStub.resolves(invoiceNoCharge);

        await expect(
          customerPlanMover.attemptRefund(mockSubscriptionWithInvoice)
        ).rejects.toThrow('No charge for');
      });
    });
  });

  describe('isCustomerExcluded', () => {
    it("returns true if the customer has a price that's excluded", () => {
      const subscriptions = [
        {
          ...mockSubscription,
          items: {
            data: [
              {
                plan: {
                  id: 'exclude-price-id',
                },
              },
            ],
          },
        },
      ] as Stripe.Subscription[];

      const result = customerPlanMover.isCustomerExcluded(subscriptions);
      expect(result).toBe(true);
    });

    it("returns false if the customer does not have a price that's excluded", () => {
      const subscriptions = [
        {
          ...mockSubscription,
          items: {
            data: [
              {
                plan: {
                  id: 'other-price-id',
                },
              },
            ],
          },
        },
      ] as Stripe.Subscription[];

      const result = customerPlanMover.isCustomerExcluded(subscriptions);
      expect(result).toBe(false);
    });

    it('returns false for empty subscriptions array', () => {
      const result = customerPlanMover.isCustomerExcluded([]);
      expect(result).toBe(false);
    });
  });
});
