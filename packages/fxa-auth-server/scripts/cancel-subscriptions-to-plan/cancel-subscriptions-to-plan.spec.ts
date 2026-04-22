/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PlanCanceller } from './cancel-subscriptions-to-plan';
import Stripe from 'stripe';
import { StripeHelper } from '../../lib/payments/stripe';

import product1 from '../../test/local/payments/fixtures/stripe/product1.json';
import customer1 from '../../test/local/payments/fixtures/stripe/customer1.json';
import subscription1 from '../../test/local/payments/fixtures/stripe/subscription1.json';
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
      on: jest.fn(),
      products: {},
      customers: {},
      subscriptions: {},
      invoices: {},
      refunds: {},
    } as unknown as Stripe;

    stripeHelperStub = {
      stripe: stripeStub,
      currencyHelper: {
        isCurrencyCompatibleWithCountry: jest.fn(),
      },
    } as unknown as StripeHelper;

    paypalHelperStub = {
      refundInvoice: jest.fn(),
    } as unknown as PayPalHelper;

    planCanceller = new PlanCanceller(
      'planId',
      'refund',
      null,
      ['exclude'],
      './cancel-subscriptions-to-plan.tmp.csv',
      stripeHelperStub,
      paypalHelperStub,
      false,
      20
    );
  });

  describe('constructor', () => {
    it('throws error if proratedRefundRate is less than or equal to zero', () => {
      expect(() => {
        void new PlanCanceller(
          'planId',
          'proratedRefund',
          0,
          ['exclude'],
          './cancel-subscriptions-to-plan.tmp.csv',
          stripeHelperStub,
          paypalHelperStub,
          false,
          20
        );
      }).toThrow('proratedRefundRate must be greater than zero');
    });

    it('throws error if proratedRefund mode is used without proratedRefundRate', () => {
      expect(() => {
        void new PlanCanceller(
          'planId',
          'proratedRefund',
          null,
          ['exclude'],
          './cancel-subscriptions-to-plan.tmp.csv',
          stripeHelperStub,
          paypalHelperStub,
          false,
          20
        );
      }).toThrow(
        'proratedRefundRate must be provided when using proratedRefund mode'
      );
    });

    it('does not throw error if proratedRefundRate is null for non-proratedRefund mode', () => {
      expect(() => {
        void new PlanCanceller(
          'planId',
          'refund',
          null,
          ['exclude'],
          './cancel-subscriptions-to-plan.tmp.csv',
          stripeHelperStub,
          paypalHelperStub,
          false,
          20
        );
      }).not.toThrow();
    });

    it('does not throw error if proratedRefundRate is positive', () => {
      expect(() => {
        void new PlanCanceller(
          'planId',
          'proratedRefund',
          100,
          ['exclude'],
          './cancel-subscriptions-to-plan.tmp.csv',
          stripeHelperStub,
          paypalHelperStub,
          false,
          20
        );
      }).not.toThrow();
    });
  });

  describe('run', () => {
    let processSubscriptionStub: jest.Mock;
    let writeReportHeaderStub: jest.Mock;
    const mockSubs = [mockSubscription];

    beforeEach(async () => {
      // Mock the async iterable returned by stripe.subscriptions.list
      const asyncIterable = {
        async *[Symbol.asyncIterator]() {
          for (const sub of mockSubs) {
            yield sub;
          }
        },
      };

      stripeStub.subscriptions.list = jest
        .fn()
        .mockReturnValue(asyncIterable) as any;

      processSubscriptionStub = jest.fn().mockResolvedValue(undefined);
      planCanceller.processSubscription = processSubscriptionStub;

      writeReportHeaderStub = jest.fn().mockResolvedValue(undefined);
      planCanceller.writeReportHeader = writeReportHeaderStub;

      await planCanceller.run();
    });

    it('writes report header', () => {
      expect(writeReportHeaderStub).toHaveBeenCalledTimes(1);
    });

    it('calls Stripe subscriptions.list with correct parameters', () => {
      expect(stripeStub.subscriptions.list as any).toHaveBeenCalledWith({
        price: 'planId',
        limit: 100,
      });
    });

    it('processes each subscription', () => {
      expect(processSubscriptionStub).toHaveBeenCalledTimes(1);
      expect(processSubscriptionStub).toHaveBeenCalledWith(mockSubscription);
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
    let logStub: jest.Mock;
    let cancelStub: jest.Mock;
    let attemptFullRefundStub: jest.Mock;
    let attemptProratedRefundStub: jest.Mock;
    let isCustomerExcludedStub: jest.Mock;
    let writeReportStub: jest.Mock;

    beforeEach(async () => {
      stripeStub.products.retrieve = jest.fn().mockResolvedValue(mockProduct);
      stripeStub.subscriptions.cancel = jest.fn().mockResolvedValue(undefined);
      cancelStub = stripeStub.subscriptions.cancel as jest.Mock;

      planCanceller.fetchCustomer = jest
        .fn()
        .mockResolvedValue(mockCustomer) as any;

      attemptFullRefundStub = jest.fn().mockResolvedValue(1000);
      planCanceller.attemptFullRefund = attemptFullRefundStub;

      attemptProratedRefundStub = jest.fn().mockResolvedValue(500);
      planCanceller.attemptProratedRefund = attemptProratedRefundStub;

      isCustomerExcludedStub = jest.fn().mockReturnValue(false);
      planCanceller.isCustomerExcluded = isCustomerExcludedStub;

      writeReportStub = jest.fn().mockResolvedValue(undefined);
      planCanceller.writeReport = writeReportStub;

      logStub = jest.spyOn(console, 'log') as unknown as jest.Mock;
    });

    afterEach(() => {
      logStub.mockRestore();
    });

    describe('success - not excluded', () => {
      beforeEach(async () => {
        await planCanceller.processSubscription(mockSub);
      });

      it('fetches customer', () => {
        expect(planCanceller.fetchCustomer as jest.Mock).toHaveBeenCalledTimes(
          1
        );
      });

      it('cancels subscription', () => {
        expect(cancelStub).toHaveBeenCalledWith('test', {
          prorate: false,
          cancellation_details: {
            comment: 'administrative_cancellation:subplat_script',
          },
        });
      });

      it('writes report', () => {
        expect(writeReportStub).toHaveBeenCalledWith(
          expect.objectContaining({
            subscription: mockSub,
            customer: mockCustomer,
            isExcluded: false,
            amountRefunded: 1000,
            isOwed: false,
            error: false,
          })
        );
      });
    });

    describe('success - with refund', () => {
      beforeEach(async () => {
        attemptFullRefundStub.mockResolvedValue(1000);
        await planCanceller.processSubscription(mockSub);
      });

      it('writes report with refund amount', () => {
        expect(writeReportStub).toHaveBeenCalledWith(
          expect.objectContaining({
            subscription: mockSub,
            customer: mockCustomer,
            isExcluded: false,
            amountRefunded: 1000,
            isOwed: false,
            error: false,
          })
        );
      });
    });

    describe('dry run', () => {
      beforeEach(async () => {
        planCanceller.dryRun = true;
        await planCanceller.processSubscription(mockSub);
      });

      it('does not cancel subscription', () => {
        expect(cancelStub).not.toHaveBeenCalled();
      });

      it('attempts refund', () => {
        expect(attemptFullRefundStub).toHaveBeenCalledTimes(1);
      });

      it('writes report', () => {
        expect(writeReportStub).toHaveBeenCalledWith(
          expect.objectContaining({
            subscription: mockSub,
            customer: mockCustomer,
            isExcluded: false,
            amountRefunded: 1000,
            isOwed: false,
            error: false,
          })
        );
      });
    });

    describe('customer excluded', () => {
      beforeEach(async () => {
        isCustomerExcludedStub.mockReturnValue(true);
        await planCanceller.processSubscription(mockSub);
      });

      it('does not cancel subscription', () => {
        expect(cancelStub).not.toHaveBeenCalled();
      });

      it('writes report marking as excluded', () => {
        expect(writeReportStub).toHaveBeenCalledWith(
          expect.objectContaining({
            subscription: mockSub,
            customer: mockCustomer,
            isExcluded: true,
            amountRefunded: null,
            isOwed: false,
            error: false,
          })
        );
      });
    });

    describe('invalid', () => {
      it('writes error report if customer does not exist', async () => {
        planCanceller.fetchCustomer = jest.fn().mockResolvedValue(null) as any;
        await planCanceller.processSubscription(mockSub);

        expect(writeReportStub).toHaveBeenCalledWith(
          expect.objectContaining({
            subscription: mockSub,
            customer: null,
            isExcluded: false,
            amountRefunded: null,
            isOwed: false,
            error: true,
          })
        );
      });

      it('writes error report if unexpected error occurs', async () => {
        cancelStub.mockRejectedValue(new Error('test error'));
        await planCanceller.processSubscription(mockSub);

        expect(writeReportStub).toHaveBeenCalledWith(
          expect.objectContaining({
            subscription: mockSub,
            customer: null,
            isExcluded: false,
            amountRefunded: null,
            isOwed: false,
            error: true,
          })
        );
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

        result = await planCanceller.fetchCustomer(mockCustomer.id);
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

        result = await planCanceller.fetchCustomer(mockCustomer.id);
      });

      it('returns null', () => {
        expect(result).toEqual(null);
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
      ] as any);
      expect(result).toBe(true);
    });

    it("returns false if the customer does not have a price that's excluded", () => {
      const result = planCanceller.isCustomerExcluded([
        {
          ...mockSubscription,
        },
      ] as any);
      expect(result).toBe(false);
    });
  });

  describe('attemptFullRefund', () => {
    let invoiceRetrieveStub: jest.Mock;
    let refundCreateStub: jest.Mock;
    let refundInvoiceStub: jest.Mock;
    const mockFullRefundInvoice = {
      charge: 'ch_123',
      amount_due: 1000,
      paid_out_of_band: false,
    };

    beforeEach(() => {
      invoiceRetrieveStub = jest.fn().mockResolvedValue(mockFullRefundInvoice);
      stripeStub.invoices.retrieve = invoiceRetrieveStub;

      refundCreateStub = jest.fn().mockResolvedValue(undefined);
      stripeStub.refunds.create = refundCreateStub;

      refundInvoiceStub = jest.fn().mockResolvedValue(undefined);
      paypalHelperStub.refundInvoice = refundInvoiceStub;
    });

    describe('Stripe refund', () => {
      beforeEach(async () => {
        await planCanceller.attemptFullRefund(mockSubscription);
      });

      it('retrieves invoice', () => {
        expect(invoiceRetrieveStub).toHaveBeenCalledWith(
          mockSubscription.latest_invoice
        );
      });

      it('creates refund', () => {
        expect(refundCreateStub).toHaveBeenCalledWith({
          charge: mockFullRefundInvoice.charge,
        });
      });

      it('returns amount refunded', async () => {
        const result = await planCanceller.attemptFullRefund(mockSubscription);
        expect(result).toBe(1000);
      });
    });

    describe('PayPal refund', () => {
      const mockPaypalInvoice = {
        ...mockFullRefundInvoice,
        paid_out_of_band: true,
      };

      beforeEach(async () => {
        invoiceRetrieveStub.mockResolvedValue(mockPaypalInvoice);
        await planCanceller.attemptFullRefund(mockSubscription);
      });

      it('calls PayPal refund', () => {
        expect(refundInvoiceStub).toHaveBeenCalledWith(mockPaypalInvoice);
      });
    });

    describe('dry run', () => {
      beforeEach(async () => {
        planCanceller.dryRun = true;
        await planCanceller.attemptFullRefund(mockSubscription);
      });

      it('does not create refund', () => {
        expect(refundCreateStub).not.toHaveBeenCalled();
      });
    });

    describe('errors', () => {
      it('throws if subscription has no latest_invoice', async () => {
        const subWithoutInvoice = {
          ...mockSubscription,
          latest_invoice: null,
        };
        await expect(
          planCanceller.attemptFullRefund(subWithoutInvoice as any)
        ).rejects.toThrow('No latest invoice');
      });

      it('throws if invoice has no charge', async () => {
        invoiceRetrieveStub.mockResolvedValue({
          ...mockFullRefundInvoice,
          charge: null,
        });
        await expect(
          planCanceller.attemptFullRefund(mockSubscription)
        ).rejects.toThrow('No charge');
      });
    });
  });

  describe('attemptProratedRefund', () => {
    let invoiceRetrieveStub: jest.Mock;
    let refundCreateStub: jest.Mock;
    let refundInvoiceStub: jest.Mock;
    const now = Math.floor(Date.now() / 1000);
    const mockProratedSubscription = {
      ...mockSubscription,
      current_period_start: now - 86400 * 2,
      current_period_end: now + 86400 * 28,
    };
    const mockProratedInvoice = {
      charge: 'ch_123',
      amount_due: 10000,
      paid: true,
      paid_out_of_band: false,
      created: Math.floor(Date.now() / 1000) - 86400,
    };

    beforeEach(() => {
      invoiceRetrieveStub = jest.fn().mockResolvedValue(mockProratedInvoice);
      stripeStub.invoices.retrieve = invoiceRetrieveStub;

      refundCreateStub = jest.fn().mockResolvedValue(undefined);
      stripeStub.refunds.create = refundCreateStub;

      refundInvoiceStub = jest.fn().mockResolvedValue(undefined);
      paypalHelperStub.refundInvoice = refundInvoiceStub;

      planCanceller = new PlanCanceller(
        'planId',
        'proratedRefund',
        100,
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
        await planCanceller.attemptProratedRefund(
          mockProratedSubscription as any
        );
        expect(invoiceRetrieveStub).toHaveBeenCalledWith(
          mockProratedSubscription.latest_invoice
        );
      });

      it('creates refund with calculated amount', async () => {
        await planCanceller.attemptProratedRefund(
          mockProratedSubscription as any
        );

        const oneDayMs = 1000 * 60 * 60 * 24;
        const periodEnd = new Date(
          mockProratedSubscription.current_period_end * 1000
        );
        const nowTime = new Date();
        const timeRemainingMs = periodEnd.getTime() - nowTime.getTime();
        const daysRemaining = Math.floor(timeRemainingMs / oneDayMs);
        const expectedRefund = daysRemaining * 100;

        expect(refundCreateStub).toHaveBeenCalledWith(
          expect.objectContaining({
            charge: mockProratedInvoice.charge,
            amount: expectedRefund,
          })
        );
      });
    });

    describe('PayPal refund - partial', () => {
      const mockPaypalInvoice = {
        ...mockProratedInvoice,
        paid_out_of_band: true,
      };

      beforeEach(async () => {
        invoiceRetrieveStub.mockResolvedValue(mockPaypalInvoice);
        await planCanceller.attemptProratedRefund(
          mockProratedSubscription as any
        );
      });

      it('calls PayPal refund with partial amount', () => {
        const oneDayMs = 1000 * 60 * 60 * 24;
        const periodEnd = new Date(
          mockProratedSubscription.current_period_end * 1000
        );
        const nowTime = new Date();
        const timeRemainingMs = periodEnd.getTime() - nowTime.getTime();
        const daysRemaining = Math.floor(timeRemainingMs / oneDayMs);
        const expectedRefund = daysRemaining * 100;

        expect(refundInvoiceStub).toHaveBeenCalledWith(mockPaypalInvoice, {
          refundType: 'Partial',
          amount: expectedRefund,
        });
      });
    });

    describe('dry run', () => {
      beforeEach(async () => {
        planCanceller.dryRun = true;
        await planCanceller.attemptProratedRefund(
          mockProratedSubscription as any
        );
      });

      it('does not create refund', () => {
        expect(refundCreateStub).not.toHaveBeenCalled();
      });
    });

    describe('errors', () => {
      it('throws if subscription has no latest_invoice', async () => {
        const subWithoutInvoice = {
          ...mockProratedSubscription,
          latest_invoice: null,
        };
        await expect(
          planCanceller.attemptProratedRefund(subWithoutInvoice as any)
        ).rejects.toThrow('No latest invoice');
      });

      it('throws if invoice is not paid', async () => {
        invoiceRetrieveStub.mockResolvedValue({
          ...mockProratedInvoice,
          paid: false,
        });
        await expect(
          planCanceller.attemptProratedRefund(mockProratedSubscription as any)
        ).rejects.toThrow('Customer is pending renewal');
      });

      it('throws if refund amount exceeds amount paid', async () => {
        const mockSmallInvoice = {
          ...mockProratedInvoice,
          amount_due: 0,
        };
        invoiceRetrieveStub.mockResolvedValue(mockSmallInvoice);
        await expect(
          planCanceller.attemptProratedRefund(mockProratedSubscription as any)
        ).rejects.toThrow('eclipse the amount due');
      });

      it('throws if invoice has no charge for Stripe refund', async () => {
        invoiceRetrieveStub.mockResolvedValue({
          ...mockProratedInvoice,
          charge: null,
        });
        await expect(
          planCanceller.attemptProratedRefund(mockProratedSubscription as any)
        ).rejects.toThrow('No charge');
      });
    });
  });
});
