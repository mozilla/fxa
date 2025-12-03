/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import cp from 'child_process';
import util from 'util';
import path from 'path';
import sinon from 'sinon';
import { expect } from 'chai';

import { CustomerPlanMover } from '../../scripts/move-customers-to-new-plan-v2/move-customers-to-new-plan-v2';
import Stripe from 'stripe';
import { PayPalHelper } from '../../lib/payments/paypal';

import customer1 from '../local/payments/fixtures/stripe/customer1.json';
import subscription1 from '../local/payments/fixtures/stripe/subscription1.json';
import invoicePaid from '../local/payments/fixtures/stripe/invoice_paid.json';

const mockCustomer = customer1 as unknown as Stripe.Customer;
const mockSubscription = subscription1 as unknown as Stripe.Subscription;
const mockInvoice = invoicePaid as unknown as Stripe.Invoice;

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
      'node -r esbuild-register scripts/move-customers-to-new-plan-v2.ts --help',
      execOptions
    );
  });
});

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
          paypalHelperStub
        );
      }).to.throw('proratedRefundRate must be greater than zero');
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
          paypalHelperStub
        );
      }).to.not.throw();
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
          paypalHelperStub
        );
      }).to.not.throw();
    });
  });

  describe('convert', () => {
    let autoPagingEachStub: sinon.SinonStub;
    let convertSubscriptionStub: sinon.SinonStub;
    let writeReportHeaderStub: sinon.SinonStub;

    beforeEach(async () => {
      autoPagingEachStub = sinon.stub().resolves();
      stripeStub.subscriptions.list = sinon.stub().returns({
        autoPagingEach: autoPagingEachStub,
      }) as any;

      writeReportHeaderStub = sinon.stub().resolves();
      customerPlanMover.writeReportHeader = writeReportHeaderStub;

      convertSubscriptionStub = sinon.stub().resolves();
      customerPlanMover.convertSubscription = convertSubscriptionStub;

      await customerPlanMover.convert();
    });

    it('writes report header', () => {
      expect(writeReportHeaderStub.calledOnce).true;
    });

    it('lists subscriptions with source price id', () => {
      expect(
        (stripeStub.subscriptions.list as sinon.SinonStub).calledWith({
          price: 'source-price-id',
          limit: 100,
        })
      ).true;
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
        stripeStub.subscriptions.update = sinon.stub().resolves(mockStripeSubscription);

        await customerPlanMover.convertSubscription(mockStripeSubscription);
      });

      it('fetches customer', () => {
        expect(fetchCustomerStub.calledWith('cus_123')).true;
      });

      it('updates subscription to destination price', () => {
        expect(
          (stripeStub.subscriptions.update as sinon.SinonStub).calledWith('sub_123', {
            items: [
              {
                id: 'si_123',
                price: 'destination-price-id',
              },
            ],
            discounts: undefined,
            proration_behavior: 'none',
          })
        ).true;
      });

      it('writes report', () => {
        expect(writeReportStub.calledOnce).true;
        const reportArgs = writeReportStub.firstCall.args[0];
        expect(reportArgs.subscription.id).eq('sub_123');
        expect(reportArgs.isExcluded).false;
        expect(reportArgs.amountRefunded).null;
        expect(reportArgs.approximateAmountWasOwed).null;
        expect(reportArgs.daysUntilNextBill).null;
        expect(reportArgs.daysSinceLastBill).null;
        expect(reportArgs.previousInvoiceAmountPaid).null;
        expect(reportArgs.isOwed).false;
        expect(reportArgs.error).false;
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
          paypalHelperStub
        );
        customerPlanMover.fetchCustomer = fetchCustomerStub;
        customerPlanMover.isCustomerExcluded = isCustomerExcludedStub;
        customerPlanMover.writeReport = writeReportStub;

        stripeStub.subscriptions.update = sinon.stub().resolves(mockStripeSubscription);

        await customerPlanMover.convertSubscription(mockStripeSubscription);
      });

      it('applies coupon to subscription', () => {
        expect(
          (stripeStub.subscriptions.update as sinon.SinonStub).calledWith('sub_123', {
            items: [
              {
                id: 'si_123',
                price: 'destination-price-id',
              },
            ],
            discounts: [{ coupon: 'test-coupon' }],
            proration_behavior: 'none',
          })
        ).true;
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
          paypalHelperStub
        );
        customerPlanMover.fetchCustomer = fetchCustomerStub;
        customerPlanMover.isCustomerExcluded = isCustomerExcludedStub;
        customerPlanMover.writeReport = writeReportStub;

        stripeStub.subscriptions.update = sinon.stub().resolves(mockStripeSubscription);

        await customerPlanMover.convertSubscription(mockStripeSubscription);
      });

      it('uses specified proration behavior', () => {
        expect(
          (stripeStub.subscriptions.update as sinon.SinonStub).calledWith('sub_123', {
            items: [
              {
                id: 'si_123',
                price: 'destination-price-id',
              },
            ],
            discounts: undefined,
            proration_behavior: 'create_prorations',
          })
        ).true;
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
          paypalHelperStub
        );
        customerPlanMover.fetchCustomer = fetchCustomerStub;
        customerPlanMover.isCustomerExcluded = isCustomerExcludedStub;
        customerPlanMover.writeReport = writeReportStub;

        attemptRefundStub = sinon.stub().resolves(500);
        customerPlanMover.attemptRefund = attemptRefundStub;

        stripeStub.subscriptions.update = sinon.stub().resolves(mockStripeSubscription);

        await customerPlanMover.convertSubscription(mockStripeSubscription);
      });

      it('attempts refund', () => {
        expect(attemptRefundStub.calledWith(mockStripeSubscription)).true;
      });

      it('writes report with refund amount', () => {
        const reportArgs = writeReportStub.firstCall.args[0];
        expect(reportArgs.amountRefunded).eq(500);
        expect(reportArgs.isOwed).false;
        expect(reportArgs.error).false;
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
          paypalHelperStub
        );
        customerPlanMover.fetchCustomer = fetchCustomerStub;
        customerPlanMover.isCustomerExcluded = isCustomerExcludedStub;
        customerPlanMover.writeReport = writeReportStub;

        attemptRefundStub = sinon.stub().rejects(new Error('Refund failed'));
        customerPlanMover.attemptRefund = attemptRefundStub;

        stripeStub.subscriptions.update = sinon.stub().resolves(mockStripeSubscription);

        await customerPlanMover.convertSubscription(mockStripeSubscription);
      });

      it('marks customer as owed', () => {
        const reportArgs = writeReportStub.firstCall.args[0];
        expect(reportArgs.isOwed).true;
        expect(reportArgs.amountRefunded).null;
        expect(reportArgs.error).false;
      });
    });

    describe('dry run', () => {
      beforeEach(async () => {
        customerPlanMover.dryRun = true;
        stripeStub.subscriptions.update = sinon.stub().resolves(mockStripeSubscription);

        await customerPlanMover.convertSubscription(mockStripeSubscription);
      });

      it('does not update subscription', () => {
        expect((stripeStub.subscriptions.update as sinon.SinonStub).notCalled).true;
      });

      it('still writes report', () => {
        expect(writeReportStub.calledOnce).true;
      });
    });

    describe('customer excluded', () => {
      beforeEach(async () => {
        isCustomerExcludedStub.returns(true);
        stripeStub.subscriptions.update = sinon.stub().resolves(mockStripeSubscription);

        await customerPlanMover.convertSubscription(mockStripeSubscription);
      });

      it('does not update subscription', () => {
        expect((stripeStub.subscriptions.update as sinon.SinonStub).notCalled).true;
      });

      it('writes report marking as excluded', () => {
        const reportArgs = writeReportStub.firstCall.args[0];
        expect(reportArgs.isExcluded).true;
        expect(reportArgs.error).false;
        expect(reportArgs.amountRefunded).null;
        expect(reportArgs.isOwed).false;
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
          paypalHelperStub
        );
        customerPlanMover.fetchCustomer = fetchCustomerStub;
        customerPlanMover.isCustomerExcluded = isCustomerExcludedStub;
        customerPlanMover.writeReport = writeReportStub;

        stripeStub.subscriptions.update = sinon.stub().resolves(mockStripeSubscription);

        const subscriptionSetToCancel = {
          ...mockStripeSubscription,
          cancel_at_period_end: true,
        } as Stripe.Subscription;

        await customerPlanMover.convertSubscription(subscriptionSetToCancel);
      });

      it('does not update subscription', () => {
        expect((stripeStub.subscriptions.update as sinon.SinonStub).notCalled).true;
      });

      it('does not write report', () => {
        expect(writeReportStub.notCalled).true;
      });

      it('logs skip message', () => {
        expect(logStub.calledWith(sinon.match(/Skipping subscription.*set to cancel/))).true;
      });
    });

    describe('invalid', () => {
      it('writes error report if subscription is not active', async () => {
        const inactiveSubscription = {
          ...mockStripeSubscription,
          status: 'canceled',
        } as Stripe.Subscription;

        await customerPlanMover.convertSubscription(inactiveSubscription);

        expect(writeReportStub.calledOnce).true;
        const reportArgs = writeReportStub.firstCall.args[0];
        expect(reportArgs.customer).null;
        expect(reportArgs.error).true;
        expect(reportArgs.isOwed).false;
        expect(reportArgs.isExcluded).false;
      });

      it('writes error report if customer does not exist', async () => {
        customerPlanMover.fetchCustomer = sinon.stub().resolves(null);

        await customerPlanMover.convertSubscription(mockStripeSubscription);

        expect(writeReportStub.calledOnce).true;
        const reportArgs = writeReportStub.firstCall.args[0];
        expect(reportArgs.customer).null;
        expect(reportArgs.error).true;
        expect(reportArgs.isOwed).false;
        expect(reportArgs.isExcluded).false;
      });

      it('writes error report if customer has no subscriptions data', async () => {
        customerPlanMover.fetchCustomer = sinon.stub().resolves({
          ...mockCustomer,
          subscriptions: undefined,
        });

        await customerPlanMover.convertSubscription(mockStripeSubscription);

        expect(writeReportStub.calledOnce).true;
        const reportArgs = writeReportStub.firstCall.args[0];
        expect(reportArgs.error).true;
        expect(reportArgs.isOwed).false;
        expect(reportArgs.isExcluded).false;
      });

      it('writes error report if subscription update fails', async () => {
        stripeStub.subscriptions.update = sinon.stub().rejects(new Error('Update failed'));

        await customerPlanMover.convertSubscription(mockStripeSubscription);

        expect(writeReportStub.calledOnce).true;
        const reportArgs = writeReportStub.firstCall.args[0];
        expect(reportArgs.error).true;
        expect(reportArgs.isOwed).false;
        expect(reportArgs.isExcluded).false;
      });

      it('writes error report if unexpected error occurs', async () => {
        customerPlanMover.fetchCustomer = sinon.stub().rejects(new Error('Unexpected error'));

        await customerPlanMover.convertSubscription(mockStripeSubscription);

        expect(writeReportStub.calledOnce).true;
        const reportArgs = writeReportStub.firstCall.args[0];
        expect(reportArgs.error).true;
        expect(reportArgs.customer).null;
        expect(reportArgs.isOwed).false;
        expect(reportArgs.isExcluded).false;
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
      amount_paid: 2000,
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
        expect(enqueueRequestStub.calledTwice).true;
      });

      it('creates refund', () => {
        expect(enqueueRequestStub.calledTwice).true;
      });
    });

    describe('PayPal refund - full', () => {
      let calculatedRefundAmount: number;
      let mockPayPalInvoice: Stripe.Invoice;

      beforeEach(async () => {
        const now = new Date().getTime();
        const nextBillAt = new Date(mockSubscriptionWithInvoice.current_period_end * 1000);
        const timeUntilBillMs = nextBillAt.getTime() - now;
        const daysUntilBill = Math.floor(timeUntilBillMs / (1000 * 60 * 60 * 24));
        calculatedRefundAmount = daysUntilBill * 100;

        mockPayPalInvoice = {
          ...mockPaidInvoice,
          amount_paid: calculatedRefundAmount,
          paid_out_of_band: true,
        } as unknown as Stripe.Invoice;

        enqueueRequestStub.resolves(mockPayPalInvoice);

        await customerPlanMover.attemptRefund(mockSubscriptionWithInvoice);
      });

      it('calls paypalHelper.refundInvoice with full refund', () => {
        expect((paypalHelperStub.refundInvoice as sinon.SinonStub).calledOnce).true;
        const args = (paypalHelperStub.refundInvoice as sinon.SinonStub).firstCall.args;
        expect(args[1].refundType).eq('Full');
      });
    });

    describe('PayPal refund - partial', () => {
      let calculatedRefundAmount: number;
      let mockPayPalInvoice: Stripe.Invoice;

      beforeEach(async () => {
        const now = new Date().getTime();
        const nextBillAt = new Date(mockSubscriptionWithInvoice.current_period_end * 1000);
        const timeUntilBillMs = nextBillAt.getTime() - now;
        const daysUntilBill = Math.floor(timeUntilBillMs / (1000 * 60 * 60 * 24));
        calculatedRefundAmount = daysUntilBill * 100;

        mockPayPalInvoice = {
          ...mockPaidInvoice,
          amount_paid: calculatedRefundAmount * 2,
          paid_out_of_band: true,
        } as unknown as Stripe.Invoice;

        enqueueRequestStub.resolves(mockPayPalInvoice);

        await customerPlanMover.attemptRefund(mockSubscriptionWithInvoice);
      });

      it('calls paypalHelper.refundInvoice with partial refund', () => {
        expect((paypalHelperStub.refundInvoice as sinon.SinonStub).calledOnce).true;
        const args = (paypalHelperStub.refundInvoice as sinon.SinonStub).firstCall.args;
        expect(args[1].refundType).eq('Partial');
        expect(args[1].amount).eq(calculatedRefundAmount);
      });
    });

    describe('dry run', () => {
      beforeEach(async () => {
        customerPlanMover.dryRun = true;
        enqueueRequestStub.resolves(mockPaidInvoice);

        await customerPlanMover.attemptRefund(mockSubscriptionWithInvoice);
      });

      it('does not create refund', () => {
        expect(enqueueRequestStub.callCount).eq(1); // Only invoice retrieval
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
          paypalHelperStub
        );

        await expect(
          customerPlanMover.attemptRefund(mockSubscriptionWithInvoice)
        ).to.be.rejectedWith('proratedRefundRate must be specified');
      });

      it('throws if subscription has no latest_invoice', async () => {
        const subWithoutInvoice = {
          ...mockSubscription,
          latest_invoice: null,
        } as Stripe.Subscription;

        await expect(
          customerPlanMover.attemptRefund(subWithoutInvoice)
        ).to.be.rejectedWith('No latest invoice');
      });

      it('throws if invoice is not paid', async () => {
        const unpaidInvoice = {
          ...mockPaidInvoice,
          paid: false,
        } as Stripe.Invoice;
        enqueueRequestStub.resolves(unpaidInvoice);

        await expect(
          customerPlanMover.attemptRefund(mockSubscriptionWithInvoice)
        ).to.be.rejectedWith('Customer is pending renewal right now!');
      });

      it('throws if refund amount exceeds amount paid', async () => {
        const oldInvoice = {
          ...mockPaidInvoice,
          amount_paid: 100,
          created: Math.floor(Date.now() / 1000) - 86400 * 50, // 50 days ago
        } as Stripe.Invoice;
        enqueueRequestStub.resolves(oldInvoice);

        await expect(
          customerPlanMover.attemptRefund(mockSubscriptionWithInvoice)
        ).to.be.rejectedWith('Will not refund');
      });

      it('throws if invoice has no charge for Stripe refund', async () => {
        const invoiceNoCharge = {
          ...mockPaidInvoice,
          charge: null,
        } as unknown as Stripe.Invoice;
        enqueueRequestStub.resolves(invoiceNoCharge);

        await expect(
          customerPlanMover.attemptRefund(mockSubscriptionWithInvoice)
        ).to.be.rejectedWith('No charge for');
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
      expect(result).true;
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
      expect(result).false;
    });

    it('returns false for empty subscriptions array', () => {
      const result = customerPlanMover.isCustomerExcluded([]);
      expect(result).false;
    });
  });
});
