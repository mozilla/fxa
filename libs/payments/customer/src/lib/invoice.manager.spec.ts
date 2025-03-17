/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import {
  StripeClient,
  MockStripeConfigProvider,
  StripeApiListFactory,
  StripeCouponFactory,
  StripeCustomerFactory,
  StripeInvoiceFactory,
  StripePriceFactory,
  StripePromotionCodeFactory,
  StripeResponseFactory,
  StripeUpcomingInvoiceFactory,
  StripeAddressFactory,
  StripeSubscriptionItemFactory,
} from '@fxa/payments/stripe';
import { TaxAddressFactory } from './factories/tax-address.factory';
import { InvoicePreviewFactory } from './invoice.factories';
import { InvoiceManager } from './invoice.manager';
import { stripeInvoiceToInvoicePreviewDTO } from './util/stripeInvoiceToFirstInvoicePreviewDTO';
import { getMinimumChargeAmountForCurrency } from '../lib/util/getMinimumChargeAmountForCurrency';
import {
  ChargeResponseFactory,
  PayPalClient,
  PaypalClientConfig,
} from '@fxa/payments/paypal';
import {
  CurrencyManager,
  MockCurrencyConfigProvider,
} from '@fxa/payments/currency';
import { STRIPE_CUSTOMER_METADATA, STRIPE_INVOICE_METADATA } from './types';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import { UpgradeCustomerMissingCurrencyInvoiceError } from './error';

jest.mock('../lib/util/stripeInvoiceToFirstInvoicePreviewDTO');
const mockedStripeInvoiceToFirstInvoicePreviewDTO = jest.mocked(
  stripeInvoiceToInvoicePreviewDTO
);

jest.mock('../lib/util/getMinimumChargeAmountForCurrency');
const mockedGetMinimumChargeAmountForCurrency = jest.mocked(
  getMinimumChargeAmountForCurrency
);

describe('InvoiceManager', () => {
  let invoiceManager: InvoiceManager;
  let stripeClient: StripeClient;
  let paypalClient: PayPalClient;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        StripeClient,
        PayPalClient,
        PaypalClientConfig,
        CurrencyManager,
        MockCurrencyConfigProvider,
        MockStripeConfigProvider,
        InvoiceManager,
        MockStatsDProvider,
      ],
    }).compile();

    invoiceManager = module.get(InvoiceManager);
    stripeClient = module.get(StripeClient);
    paypalClient = module.get(PayPalClient);
  });

  describe('finalizeWithoutAutoAdvance', () => {
    it('works successfully', async () => {
      const mockInvoice = StripeResponseFactory(
        StripeInvoiceFactory({
          auto_advance: false,
        })
      );

      jest
        .spyOn(stripeClient, 'invoicesFinalizeInvoice')
        .mockResolvedValue(mockInvoice);

      const result = await invoiceManager.finalizeWithoutAutoAdvance(
        mockInvoice.id
      );
      expect(result).toEqual(mockInvoice);
    });
  });

  describe('previewUpcoming', () => {
    it('returns upcoming invoice', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPrice = StripePriceFactory();
      const mockUpcomingInvoice = StripeResponseFactory(
        StripeUpcomingInvoiceFactory()
      );

      const mockTaxAddress = TaxAddressFactory();
      const mockInvoicePreview = InvoicePreviewFactory();

      jest
        .spyOn(stripeClient, 'invoicesRetrieveUpcoming')
        .mockResolvedValue(mockUpcomingInvoice);

      mockedStripeInvoiceToFirstInvoicePreviewDTO.mockReturnValue(
        mockInvoicePreview
      );

      const result = await invoiceManager.previewUpcoming({
        priceId: mockPrice.id,
        currency: mockPrice.currency,
        customer: mockCustomer,
        taxAddress: mockTaxAddress,
      });
      expect(result).toEqual(mockInvoicePreview);
    });

    it('returns upcoming invoice with coupon', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPrice = StripePriceFactory();
      const mockUpcomingInvoice = StripeResponseFactory(
        StripeUpcomingInvoiceFactory()
      );
      const mockPromotionCode = StripePromotionCodeFactory({
        coupon: StripeCouponFactory({
          valid: true,
        }),
      });

      const mockTaxAddress = TaxAddressFactory();
      const mockInvoicePreview = InvoicePreviewFactory();

      jest
        .spyOn(stripeClient, 'promotionCodesList')
        .mockResolvedValue(
          StripeResponseFactory(StripeApiListFactory([mockPromotionCode]))
        );
      jest
        .spyOn(stripeClient, 'invoicesRetrieveUpcoming')
        .mockResolvedValue(mockUpcomingInvoice);

      mockedStripeInvoiceToFirstInvoicePreviewDTO.mockReturnValue(
        mockInvoicePreview
      );

      const result = await invoiceManager.previewUpcoming({
        priceId: mockPrice.id,
        currency: mockPrice.currency,
        customer: mockCustomer,
        taxAddress: mockTaxAddress,
        couponCode: mockPromotionCode.code,
      });
      expect(result).toEqual(mockInvoicePreview);
    });
  });

  describe('previewUpcomingUpgrade', () => {
    it('returns upcoming invoice for an upgrade', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPrice = StripePriceFactory();
      const mockUpcomingInvoice = StripeResponseFactory(
        StripeUpcomingInvoiceFactory()
      );
      const mockInvoicePreview = InvoicePreviewFactory();
      const mockSubscriptionItem = StripeSubscriptionItemFactory();

      jest
        .spyOn(stripeClient, 'invoicesRetrieveUpcoming')
        .mockResolvedValue(mockUpcomingInvoice);

      mockedStripeInvoiceToFirstInvoicePreviewDTO.mockReturnValue(
        mockInvoicePreview
      );

      const result = await invoiceManager.previewUpcomingUpgrade({
        priceId: mockPrice.id,
        customer: mockCustomer,
        fromSubscriptionItem: mockSubscriptionItem,
      });
      expect(result).toEqual(mockInvoicePreview);
    });
  });

  describe('previewUpcomingForUpgrade', () => {
    const mockPrice = StripePriceFactory();
    const mockSubscriptionItem = StripeSubscriptionItemFactory();

    it('returns upcoming invoice for upgrade', async () => {
      const mockCustomer = StripeCustomerFactory({ currency: 'usd' });
      const mockPreviewSubsequentInvoice = InvoicePreviewFactory();
      const mockPreviewUpcomingUpgradeInvoice = InvoicePreviewFactory();

      jest
        .spyOn(invoiceManager, 'previewUpcoming')
        .mockResolvedValue(mockPreviewSubsequentInvoice);
      jest
        .spyOn(invoiceManager, 'previewUpcomingUpgrade')
        .mockResolvedValue(mockPreviewUpcomingUpgradeInvoice);

      const result = await invoiceManager.previewUpcomingForUpgrade({
        priceId: mockPrice.id,
        customer: mockCustomer,
        fromSubscriptionItem: mockSubscriptionItem,
      });

      expect(result).toEqual({
        ...mockPreviewSubsequentInvoice,
        oneTimeCharge: mockPreviewUpcomingUpgradeInvoice.totalAmount,
      });
    });

    it('throws an error if customer is missing currency', async () => {
      const mockCustomer = StripeCustomerFactory();

      await expect(
        invoiceManager.previewUpcomingForUpgrade({
          priceId: mockPrice.id,
          customer: mockCustomer,
          fromSubscriptionItem: mockSubscriptionItem,
        })
      ).rejects.toThrowError(UpgradeCustomerMissingCurrencyInvoiceError);
    });
  });

  describe('retrieve', () => {
    it('retrieves an invoice', async () => {
      const mockInvoice = StripeResponseFactory(StripeInvoiceFactory());
      const mockResponse = StripeResponseFactory(mockInvoice);

      jest
        .spyOn(stripeClient, 'invoicesRetrieve')
        .mockResolvedValue(mockResponse);

      const result = await invoiceManager.retrieve(mockInvoice.id);

      expect(stripeClient.invoicesRetrieve).toBeCalledWith(mockInvoice.id);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('processInvoice', () => {
    it('calls processZeroInvoice when amount is less than minimum amount', async () => {
      const mockInvoice = StripeResponseFactory(
        StripeInvoiceFactory({
          amount_due: 0,
          currency: 'usd',
        })
      );

      mockedGetMinimumChargeAmountForCurrency.mockReturnValue(10);
      jest
        .spyOn(invoiceManager, 'processPayPalZeroInvoice')
        .mockResolvedValue(mockInvoice);
      jest
        .spyOn(invoiceManager, 'processPayPalNonZeroInvoice')
        .mockResolvedValue(StripeResponseFactory(mockInvoice));

      await invoiceManager.processPayPalInvoice(mockInvoice);
      expect(invoiceManager.processPayPalZeroInvoice).toBeCalledWith(
        mockInvoice.id
      );
      expect(invoiceManager.processPayPalNonZeroInvoice).not.toHaveBeenCalled();
    });

    it('calls InvoiceManager processNonZeroInvoice when amount is greater than minimum amount', async () => {
      const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockInvoice = StripeInvoiceFactory({
        amount_due: 50,
        currency: 'usd',
        customer_shipping: { address: StripeAddressFactory() },
      });

      mockedGetMinimumChargeAmountForCurrency.mockReturnValue(10);
      jest
        .spyOn(stripeClient, 'customersRetrieve')
        .mockResolvedValue(mockCustomer);
      jest
        .spyOn(invoiceManager, 'processPayPalZeroInvoice')
        .mockResolvedValue(StripeResponseFactory(mockInvoice));
      jest
        .spyOn(invoiceManager, 'processPayPalNonZeroInvoice')
        .mockResolvedValue(StripeResponseFactory(mockInvoice));

      await invoiceManager.processPayPalInvoice(mockInvoice);

      expect(invoiceManager.processPayPalNonZeroInvoice).toBeCalledWith(
        mockCustomer,
        mockInvoice
      );
      expect(invoiceManager.processPayPalZeroInvoice).not.toHaveBeenCalled();
    });
  });

  describe('processZeroInvoice', () => {
    it('finalizes invoices with no amount set to zero', async () => {
      const mockInvoice = StripeResponseFactory(StripeInvoiceFactory());

      jest
        .spyOn(invoiceManager, 'finalizeWithoutAutoAdvance')
        .mockResolvedValue(mockInvoice);

      const result = await invoiceManager.processPayPalZeroInvoice(
        mockInvoice.id
      );

      expect(result).toEqual(mockInvoice);
      expect(invoiceManager.finalizeWithoutAutoAdvance).toBeCalledWith(
        mockInvoice.id
      );
    });
  });

  describe('processNonZeroInvoice', () => {
    it('successfully processes non-zero invoice', async () => {
      const mockPaymentAttemptCount = 1;
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          metadata: {
            [STRIPE_CUSTOMER_METADATA.PaypalAgreement]: '1',
          },
        })
      );
      const mockInvoice = StripeResponseFactory(
        StripeInvoiceFactory({
          status: 'open',
          currency: 'usd',
          metadata: {
            [STRIPE_INVOICE_METADATA.RetryAttempts]: String(
              mockPaymentAttemptCount
            ),
          },
          customer_shipping: { address: StripeAddressFactory() },
        })
      );
      const mockPayPalCharge = ChargeResponseFactory({
        paymentStatus: 'Completed',
      });

      jest
        .spyOn(paypalClient, 'chargeCustomer')
        .mockResolvedValue(mockPayPalCharge);
      jest
        .spyOn(stripeClient, 'invoicesFinalizeInvoice')
        .mockResolvedValue(mockInvoice);
      jest.spyOn(stripeClient, 'invoicesUpdate').mockResolvedValue(mockInvoice);
      jest
        .spyOn(stripeClient, 'invoicesRetrieve')
        .mockResolvedValue(mockInvoice);
      jest.spyOn(stripeClient, 'invoicesPay').mockResolvedValue();

      const result = await invoiceManager.processPayPalNonZeroInvoice(
        mockCustomer,
        mockInvoice
      );

      expect(result).toEqual(mockInvoice);

      expect(paypalClient.chargeCustomer).toHaveBeenCalledWith({
        amountInCents: mockInvoice.amount_due,
        billingAgreementId:
          mockCustomer.metadata[STRIPE_CUSTOMER_METADATA.PaypalAgreement],
        invoiceNumber: mockInvoice.id,
        currencyCode: mockInvoice.currency,
        countryCode: mockInvoice.customer_shipping?.address?.country,
        idempotencyKey: `${mockInvoice.id}-${mockPaymentAttemptCount}`,
        taxAmountInCents: mockInvoice.tax,
      });
      expect(stripeClient.invoicesFinalizeInvoice).toHaveBeenCalledWith(
        mockInvoice.id
      );
      expect(stripeClient.invoicesUpdate).toHaveBeenNthCalledWith(
        1,
        mockInvoice.id,
        {
          metadata: {
            [STRIPE_INVOICE_METADATA.RetryAttempts]:
              mockPaymentAttemptCount + 1,
          },
        }
      );
      expect(stripeClient.invoicesUpdate).toHaveBeenNthCalledWith(
        2,
        mockInvoice.id,
        {
          metadata: {
            [STRIPE_INVOICE_METADATA.PaypalTransactionId]:
              mockPayPalCharge.transactionId,
          },
        }
      );
      expect(stripeClient.invoicesPay).toHaveBeenCalledWith(mockInvoice.id);
    });
    it('throws an error if the customer has no paypal agreement id', async () => {
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({ metadata: {} })
      );
      const mockInvoice = StripeResponseFactory(
        StripeInvoiceFactory({
          customer_shipping: { address: StripeAddressFactory() },
        })
      );

      await expect(
        invoiceManager.processPayPalNonZeroInvoice(mockCustomer, mockInvoice)
      ).rejects.toThrowError();
    });
    it('throws an error for an already-paid invoice', async () => {
      const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockInvoice = StripeResponseFactory(
        StripeInvoiceFactory({
          status: 'paid',
          customer_shipping: { address: StripeAddressFactory() },
        })
      );

      await expect(
        invoiceManager.processPayPalNonZeroInvoice(mockCustomer, mockInvoice)
      ).rejects.toThrowError();
    });
    it('throws an error for an uncollectible invoice', async () => {
      const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockInvoice = StripeResponseFactory(
        StripeInvoiceFactory({
          status: 'uncollectible',
          customer_shipping: { address: StripeAddressFactory() },
        })
      );

      await expect(
        invoiceManager.processPayPalNonZeroInvoice(mockCustomer, mockInvoice)
      ).rejects.toThrowError();
    });
    it('returns on pending invoices without marking it as paid', async () => {
      const mockPaymentAttemptCount = 1;
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          metadata: {
            [STRIPE_CUSTOMER_METADATA.PaypalAgreement]: '1',
          },
        })
      );
      const mockInvoice = StripeResponseFactory(
        StripeInvoiceFactory({
          status: 'open',
          currency: 'usd',
          metadata: {
            [STRIPE_INVOICE_METADATA.RetryAttempts]: String(
              mockPaymentAttemptCount
            ),
          },
          customer_shipping: { address: StripeAddressFactory() },
        })
      );
      const mockPayPalCharge = ChargeResponseFactory({
        paymentStatus: 'Pending',
      });

      jest
        .spyOn(paypalClient, 'chargeCustomer')
        .mockResolvedValue(mockPayPalCharge);
      jest
        .spyOn(stripeClient, 'invoicesFinalizeInvoice')
        .mockResolvedValue(mockInvoice);
      jest.spyOn(stripeClient, 'invoicesUpdate').mockResolvedValue(mockInvoice);
      jest.spyOn(stripeClient, 'invoicesPay').mockResolvedValue();

      const result = await invoiceManager.processPayPalNonZeroInvoice(
        mockCustomer,
        mockInvoice
      );

      expect(result).toEqual(mockInvoice);

      expect(paypalClient.chargeCustomer).toHaveBeenCalledWith({
        amountInCents: mockInvoice.amount_due,
        billingAgreementId:
          mockCustomer.metadata[STRIPE_CUSTOMER_METADATA.PaypalAgreement],
        invoiceNumber: mockInvoice.id,
        currencyCode: mockInvoice.currency,
        countryCode: mockInvoice.customer_shipping?.address?.country,
        idempotencyKey: `${mockInvoice.id}-${mockPaymentAttemptCount}`,
        taxAmountInCents: mockInvoice.tax,
      });
      expect(stripeClient.invoicesFinalizeInvoice).toHaveBeenCalledWith(
        mockInvoice.id
      );
      expect(stripeClient.invoicesUpdate).toHaveBeenNthCalledWith(
        1,
        mockInvoice.id,
        {
          metadata: {
            [STRIPE_INVOICE_METADATA.RetryAttempts]:
              mockPaymentAttemptCount + 1,
          },
        }
      );
      expect(stripeClient.invoicesUpdate).toHaveBeenCalledTimes(1);
      expect(stripeClient.invoicesPay).not.toHaveBeenCalled();
    });
    it('throws an error for "Denied" paypal transaction state', async () => {
      const mockPaymentAttemptCount = 1;
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          metadata: {
            [STRIPE_CUSTOMER_METADATA.PaypalAgreement]: '1',
          },
        })
      );
      const mockInvoice = StripeResponseFactory(
        StripeInvoiceFactory({
          status: 'open',
          currency: 'usd',
          metadata: {
            [STRIPE_INVOICE_METADATA.RetryAttempts]: String(
              mockPaymentAttemptCount
            ),
          },
          customer_shipping: { address: StripeAddressFactory() },
        })
      );
      const mockPayPalCharge = ChargeResponseFactory({
        paymentStatus: 'Failed',
      });

      jest
        .spyOn(paypalClient, 'chargeCustomer')
        .mockResolvedValue(mockPayPalCharge);
      jest
        .spyOn(stripeClient, 'invoicesFinalizeInvoice')
        .mockResolvedValue(mockInvoice);
      jest.spyOn(stripeClient, 'invoicesUpdate').mockResolvedValue(mockInvoice);
      jest.spyOn(stripeClient, 'invoicesPay').mockResolvedValue();

      await expect(
        invoiceManager.processPayPalNonZeroInvoice(mockCustomer, mockInvoice)
      ).rejects.toThrowError();

      expect(paypalClient.chargeCustomer).toHaveBeenCalledWith({
        amountInCents: mockInvoice.amount_due,
        billingAgreementId:
          mockCustomer.metadata[STRIPE_CUSTOMER_METADATA.PaypalAgreement],
        invoiceNumber: mockInvoice.id,
        currencyCode: mockInvoice.currency,
        countryCode: mockInvoice.customer_shipping?.address?.country,
        idempotencyKey: `${mockInvoice.id}-${mockPaymentAttemptCount}`,
        taxAmountInCents: mockInvoice.tax,
      });
      expect(stripeClient.invoicesFinalizeInvoice).toHaveBeenCalledWith(
        mockInvoice.id
      );
      expect(stripeClient.invoicesUpdate).toHaveBeenNthCalledWith(
        1,
        mockInvoice.id,
        {
          metadata: {
            [STRIPE_INVOICE_METADATA.RetryAttempts]:
              mockPaymentAttemptCount + 1,
          },
        }
      );
      expect(stripeClient.invoicesUpdate).toHaveBeenCalledTimes(1);
      expect(stripeClient.invoicesPay).not.toHaveBeenCalled();
    });
    it('successfully processes non-zero invoice with a tax of 0', async () => {
      const mockPaymentAttemptCount = 1;
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          metadata: {
            [STRIPE_CUSTOMER_METADATA.PaypalAgreement]: '1',
          },
        })
      );
      const mockInvoice = StripeResponseFactory(
        StripeInvoiceFactory({
          status: 'open',
          currency: 'usd',
          metadata: {
            [STRIPE_INVOICE_METADATA.RetryAttempts]: String(
              mockPaymentAttemptCount
            ),
          },
          tax: 0,
          customer_shipping: { address: StripeAddressFactory() },
        })
      );
      const mockPayPalCharge = ChargeResponseFactory({
        paymentStatus: 'Completed',
      });

      jest
        .spyOn(paypalClient, 'chargeCustomer')
        .mockResolvedValue(mockPayPalCharge);
      jest
        .spyOn(stripeClient, 'invoicesFinalizeInvoice')
        .mockResolvedValue(mockInvoice);
      jest.spyOn(stripeClient, 'invoicesUpdate').mockResolvedValue(mockInvoice);
      jest
        .spyOn(stripeClient, 'invoicesRetrieve')
        .mockResolvedValue(mockInvoice);
      jest.spyOn(stripeClient, 'invoicesPay').mockResolvedValue();

      const result = await invoiceManager.processPayPalNonZeroInvoice(
        mockCustomer,
        mockInvoice
      );

      expect(result).toEqual(mockInvoice);

      expect(paypalClient.chargeCustomer).toHaveBeenCalledWith({
        amountInCents: mockInvoice.amount_due,
        billingAgreementId:
          mockCustomer.metadata[STRIPE_CUSTOMER_METADATA.PaypalAgreement],
        invoiceNumber: mockInvoice.id,
        currencyCode: mockInvoice.currency,
        countryCode: mockInvoice.customer_shipping?.address?.country,
        idempotencyKey: `${mockInvoice.id}-${mockPaymentAttemptCount}`,
        taxAmountInCents: mockInvoice.tax,
      });
      expect(stripeClient.invoicesFinalizeInvoice).toHaveBeenCalledWith(
        mockInvoice.id
      );
      expect(stripeClient.invoicesUpdate).toHaveBeenNthCalledWith(
        1,
        mockInvoice.id,
        {
          metadata: {
            [STRIPE_INVOICE_METADATA.RetryAttempts]:
              mockPaymentAttemptCount + 1,
          },
        }
      );
      expect(stripeClient.invoicesUpdate).toHaveBeenNthCalledWith(
        2,
        mockInvoice.id,
        {
          metadata: {
            [STRIPE_INVOICE_METADATA.PaypalTransactionId]:
              mockPayPalCharge.transactionId,
          },
        }
      );
      expect(stripeClient.invoicesPay).toHaveBeenCalledWith(mockInvoice.id);
    });
  });
});
