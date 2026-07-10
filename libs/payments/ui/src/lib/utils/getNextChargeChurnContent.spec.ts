/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import {
  getNextChargeChurnContent,
  SubPlatPaymentMethodType,
} from './getNextChargeChurnContent';

describe('getNextChargeChurnContent', () => {
  const mockContent = {
    currentPeriodEnd: faker.date.future().getDate(),
    currency: faker.finance.currencyCode().toLowerCase(),
    locale: faker.helpers.arrayElement(['en-US', 'de', 'es', 'fr-FR']),
    nextInvoiceTotal: faker.number.int({ min: 1, max: 1000 }),
    productName: 'Cooking with Foxkeh',
    webIcon: faker.internet.url(),
  };

  const expectedL10nVars = {
    currentPeriodEnd: expect.any(String),
    nextInvoiceTotal: expect.any(String),
  };

  describe('with discount', () => {
    describe('with tax - returns content', () => {
      const expectedDiscountedAndTaxL10nVars = {
        ...expectedL10nVars,
        discountPercent: expect.any(Number),
        taxDue: expect.any(String),
      };

      it('returns next charge content - card', () => {
        const expectedWithLast4L10nVars = {
          ...expectedDiscountedAndTaxL10nVars,
          last4: expect.any(String),
        };
        const mockSubscriptionPageContent = {
          ...mockContent,
          defaultPaymentMethodType: SubPlatPaymentMethodType.Card,
          discountAmount: faker.number.int({ min: 1, max: 100 }),
          last4: faker.string.numeric({ length: 4 }),
          nextInvoiceTax: faker.number.int({ min: 1, max: 1000 }),
        };
        const content = getNextChargeChurnContent(mockSubscriptionPageContent);
        expect(content.l10nId).toBe('next-charge-with-discount-and-tax-card');
        expect(content.l10nVars).toEqual(
          expect.objectContaining(expectedWithLast4L10nVars)
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining({
            last4: expectedWithLast4L10nVars.last4,
          })
        );
      });

      it('returns next charge content - PayPal', () => {
        const mockSubscriptionPageContent = {
          ...mockContent,
          defaultPaymentMethodType: SubPlatPaymentMethodType.PayPal,
          discountAmount: faker.number.int({ min: 1, max: 100 }),
          nextInvoiceTax: faker.number.int({ min: 1, max: 1000 }),
        };
        const content = getNextChargeChurnContent(mockSubscriptionPageContent);
        expect(content.l10nId).toBe(
          'next-charge-with-discount-and-tax-payment-method'
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining(expectedDiscountedAndTaxL10nVars)
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining({
            paymentMethod: 'PayPal',
          })
        );
      });

      it('returns next charge content - Link', () => {
        const mockSubscriptionPageContent = {
          ...mockContent,
          defaultPaymentMethodType: SubPlatPaymentMethodType.Link,
          discountAmount: faker.number.int({ min: 1, max: 100 }),
          nextInvoiceTax: faker.number.int({ min: 1, max: 1000 }),
        };
        const content = getNextChargeChurnContent(mockSubscriptionPageContent);
        expect(content.l10nId).toBe(
          'next-charge-with-discount-and-tax-payment-method'
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining(expectedDiscountedAndTaxL10nVars)
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining({
            paymentMethod: 'Link',
          })
        );
      });

      it('returns next charge content - Apple Pay', () => {
        const mockSubscriptionPageContent = {
          ...mockContent,
          defaultPaymentMethodType: SubPlatPaymentMethodType.ApplePay,
          discountAmount: faker.number.int({ min: 1, max: 100 }),
          nextInvoiceTax: faker.number.int({ min: 1, max: 1000 }),
        };
        const content = getNextChargeChurnContent(mockSubscriptionPageContent);
        expect(content.l10nId).toBe(
          'next-charge-with-discount-and-tax-payment-method'
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining(expectedDiscountedAndTaxL10nVars)
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining({
            paymentMethod: 'Apple Pay',
          })
        );
      });

      it('returns next charge content - Google Pay', () => {
        const mockSubscriptionPageContent = {
          ...mockContent,
          defaultPaymentMethodType: SubPlatPaymentMethodType.GooglePay,
          discountAmount: faker.number.int({ min: 1, max: 100 }),
          nextInvoiceTax: faker.number.int({ min: 1, max: 1000 }),
        };
        const content = getNextChargeChurnContent(mockSubscriptionPageContent);
        expect(content.l10nId).toBe(
          'next-charge-with-discount-and-tax-payment-method'
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining(expectedDiscountedAndTaxL10nVars)
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining({
            paymentMethod: 'Google Pay',
          })
        );
      });

      it('returns default', () => {
        const mockSubscriptionPageContent = {
          ...mockContent,
          discountAmount: faker.number.int({ min: 1, max: 100 }),
          nextInvoiceTax: faker.number.int({ min: 1, max: 1000 }),
        };
        const content = getNextChargeChurnContent(mockSubscriptionPageContent);
        expect(content.l10nId).toBe('next-charge-with-discount-and-tax');
        expect(content.l10nVars).toEqual(
          expect.objectContaining(expectedDiscountedAndTaxL10nVars)
        );
        expect(content.l10nVars).not.toHaveProperty('paymentMethod');
      });
    });

    describe('without tax - returns information', () => {
      const expectedDiscountedL10nVars = {
        ...expectedL10nVars,
        discountPercent: expect.any(Number),
      };

      it('returns next charge content - card', () => {
        const expectedWithLast4L10nVars = {
          ...expectedDiscountedL10nVars,
          last4: expect.any(String),
        };
        const mockSubscriptionPageContent = {
          ...mockContent,
          defaultPaymentMethodType: SubPlatPaymentMethodType.Card,
          discountAmount: faker.number.int({ min: 1, max: 100 }),
          last4: faker.string.numeric({ length: 4 }),
        };
        const content = getNextChargeChurnContent(mockSubscriptionPageContent);
        expect(content.l10nId).toBe('next-charge-with-discount-no-tax-card');
        expect(content.l10nVars).toEqual(
          expect.objectContaining(expectedWithLast4L10nVars)
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining({
            last4: expectedWithLast4L10nVars.last4,
          })
        );
      });

      it('returns next charge content - PayPal', () => {
        const mockSubscriptionPageContent = {
          ...mockContent,
          defaultPaymentMethodType: SubPlatPaymentMethodType.PayPal,
          discountAmount: faker.number.int({ min: 1, max: 100 }),
        };
        const content = getNextChargeChurnContent(mockSubscriptionPageContent);
        expect(content.l10nId).toBe(
          'next-charge-with-discount-no-tax-payment-method'
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining(expectedDiscountedL10nVars)
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining({
            paymentMethod: 'PayPal',
          })
        );
      });

      it('returns next charge content - Link', () => {
        const mockSubscriptionPageContent = {
          ...mockContent,
          defaultPaymentMethodType: SubPlatPaymentMethodType.Link,
          discountAmount: faker.number.int({ min: 1, max: 100 }),
        };
        const content = getNextChargeChurnContent(mockSubscriptionPageContent);
        expect(content.l10nId).toBe(
          'next-charge-with-discount-no-tax-payment-method'
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining(expectedDiscountedL10nVars)
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining({
            paymentMethod: 'Link',
          })
        );
      });

      it('returns next charge content - Apple Pay', () => {
        const mockSubscriptionPageContent = {
          ...mockContent,
          defaultPaymentMethodType: SubPlatPaymentMethodType.ApplePay,
          discountAmount: faker.number.int({ min: 1, max: 100 }),
        };
        const content = getNextChargeChurnContent(mockSubscriptionPageContent);
        expect(content.l10nId).toBe(
          'next-charge-with-discount-no-tax-payment-method'
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining(expectedDiscountedL10nVars)
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining({
            paymentMethod: 'Apple Pay',
          })
        );
      });

      it('returns next charge content - Google Pay', () => {
        const mockSubscriptionPageContent = {
          ...mockContent,
          defaultPaymentMethodType: SubPlatPaymentMethodType.GooglePay,
          discountAmount: faker.number.int({ min: 1, max: 100 }),
        };
        const content = getNextChargeChurnContent(mockSubscriptionPageContent);
        expect(content.l10nId).toBe(
          'next-charge-with-discount-no-tax-payment-method'
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining(expectedDiscountedL10nVars)
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining({
            paymentMethod: 'Google Pay',
          })
        );
      });

      it('returns default', () => {
        const mockSubscriptionPageContent = {
          ...mockContent,
          discountAmount: faker.number.int({ min: 1, max: 100 }),
        };
        const content = getNextChargeChurnContent(mockSubscriptionPageContent);
        expect(content.l10nId).toBe('next-charge-with-discount-no-tax');
        expect(content.l10nVars).toEqual(
          expect.objectContaining(expectedDiscountedL10nVars)
        );
        expect(content.l10nVars).not.toHaveProperty('paymentMethod');
      });
    });
  });

  describe('no discount', () => {
    describe('with tax - returns content', () => {
      const expectedTaxL10nVars = {
        ...expectedL10nVars,
        taxDue: expect.any(String),
      };
      it('returns next charge content - card', () => {
        const expectedWithLast4L10nVars = {
          ...expectedTaxL10nVars,
          last4: expect.any(String),
        };
        const mockSubscriptionPageContent = {
          ...mockContent,
          defaultPaymentMethodType: SubPlatPaymentMethodType.Card,
          last4: faker.string.numeric({ length: 4 }),
          nextInvoiceTax: faker.number.int({ min: 1, max: 1000 }),
        };
        const content = getNextChargeChurnContent(mockSubscriptionPageContent);
        expect(content.l10nId).toBe('next-charge-with-tax-card');
        expect(content.l10nVars).toEqual(
          expect.objectContaining(expectedWithLast4L10nVars)
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining({
            last4: expectedWithLast4L10nVars.last4,
          })
        );
      });

      it('returns next charge content - PayPal', () => {
        const mockSubscriptionPageContent = {
          ...mockContent,
          defaultPaymentMethodType: SubPlatPaymentMethodType.PayPal,
          nextInvoiceTax: faker.number.int({ min: 1, max: 1000 }),
        };
        const content = getNextChargeChurnContent(mockSubscriptionPageContent);
        expect(content.l10nId).toBe('next-charge-with-tax-payment-method');
        expect(content.l10nVars).toEqual(
          expect.objectContaining(expectedTaxL10nVars)
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining({
            paymentMethod: 'PayPal',
          })
        );
      });

      it('returns next charge content - Link', () => {
        const mockSubscriptionPageContent = {
          ...mockContent,
          defaultPaymentMethodType: SubPlatPaymentMethodType.Link,
          nextInvoiceTax: faker.number.int({ min: 1, max: 1000 }),
        };
        const content = getNextChargeChurnContent(mockSubscriptionPageContent);
        expect(content.l10nId).toBe('next-charge-with-tax-payment-method');
        expect(content.l10nVars).toEqual(
          expect.objectContaining(expectedTaxL10nVars)
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining({
            paymentMethod: 'Link',
          })
        );
      });

      it('returns next charge content - Apple Pay', () => {
        const mockSubscriptionPageContent = {
          ...mockContent,
          defaultPaymentMethodType: SubPlatPaymentMethodType.ApplePay,
          nextInvoiceTax: faker.number.int({ min: 1, max: 1000 }),
        };
        const content = getNextChargeChurnContent(mockSubscriptionPageContent);
        expect(content.l10nId).toBe('next-charge-with-tax-payment-method');
        expect(content.l10nVars).toEqual(
          expect.objectContaining(expectedTaxL10nVars)
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining({
            paymentMethod: 'Apple Pay',
          })
        );
      });

      it('returns next charge content - Google Pay', () => {
        const mockSubscriptionPageContent = {
          ...mockContent,
          defaultPaymentMethodType: SubPlatPaymentMethodType.GooglePay,
          nextInvoiceTax: faker.number.int({ min: 1, max: 1000 }),
        };
        const content = getNextChargeChurnContent(mockSubscriptionPageContent);
        expect(content.l10nId).toBe('next-charge-with-tax-payment-method');
        expect(content.l10nVars).toEqual(
          expect.objectContaining(expectedTaxL10nVars)
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining({
            paymentMethod: 'Google Pay',
          })
        );
      });

      it('returns default', () => {
        const mockSubscriptionPageContent = {
          ...mockContent,
          nextInvoiceTax: faker.number.int({ min: 1, max: 1000 }),
        };
        const content = getNextChargeChurnContent(mockSubscriptionPageContent);
        expect(content.l10nId).toBe('next-charge-with-tax');
        expect(content.l10nVars).toEqual(
          expect.objectContaining(expectedTaxL10nVars)
        );
        expect(content.l10nVars).not.toHaveProperty('paymentMethod');
      });
    });

    describe('without tax - returns information', () => {
      it('returns next charge content - card', () => {
        const expectedWithLast4L10nVars = {
          ...expectedL10nVars,
          last4: expect.any(String),
        };
        const mockSubscriptionPageContent = {
          ...mockContent,
          defaultPaymentMethodType: SubPlatPaymentMethodType.Card,
          last4: faker.string.numeric({ length: 4 }),
        };
        const content = getNextChargeChurnContent(mockSubscriptionPageContent);
        expect(content.l10nId).toBe('next-charge-no-tax-card');
        expect(content.l10nVars).toEqual(
          expect.objectContaining(expectedWithLast4L10nVars)
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining({
            last4: expectedWithLast4L10nVars.last4,
          })
        );
      });

      it('returns next charge content - PayPal', () => {
        const mockSubscriptionPageContent = {
          ...mockContent,
          defaultPaymentMethodType: SubPlatPaymentMethodType.PayPal,
        };
        const content = getNextChargeChurnContent(mockSubscriptionPageContent);
        expect(content.l10nId).toBe('next-charge-no-tax-payment-method');
        expect(content.l10nVars).toEqual(
          expect.objectContaining(expectedL10nVars)
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining({
            paymentMethod: 'PayPal',
          })
        );
      });

      it('returns next charge content - Link', () => {
        const mockSubscriptionPageContent = {
          ...mockContent,
          defaultPaymentMethodType: SubPlatPaymentMethodType.Link,
        };
        const content = getNextChargeChurnContent(mockSubscriptionPageContent);
        expect(content.l10nId).toBe('next-charge-no-tax-payment-method');
        expect(content.l10nVars).toEqual(
          expect.objectContaining(expectedL10nVars)
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining({
            paymentMethod: 'Link',
          })
        );
      });

      it('returns next charge content - Apple Pay', () => {
        const mockSubscriptionPageContent = {
          ...mockContent,
          defaultPaymentMethodType: SubPlatPaymentMethodType.ApplePay,
        };
        const content = getNextChargeChurnContent(mockSubscriptionPageContent);
        expect(content.l10nId).toBe('next-charge-no-tax-payment-method');
        expect(content.l10nVars).toEqual(
          expect.objectContaining(expectedL10nVars)
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining({
            paymentMethod: 'Apple Pay',
          })
        );
      });

      it('returns next charge content - Google Pay', () => {
        const mockSubscriptionPageContent = {
          ...mockContent,
          defaultPaymentMethodType: SubPlatPaymentMethodType.GooglePay,
        };
        const content = getNextChargeChurnContent(mockSubscriptionPageContent);
        expect(content.l10nId).toBe('next-charge-no-tax-payment-method');
        expect(content.l10nVars).toEqual(
          expect.objectContaining(expectedL10nVars)
        );
        expect(content.l10nVars).toEqual(
          expect.objectContaining({
            paymentMethod: 'Google Pay',
          })
        );
      });

      it('returns default', () => {
        const mockSubscriptionPageContent = {
          ...mockContent,
        };
        const content = getNextChargeChurnContent(mockSubscriptionPageContent);
        expect(content.l10nId).toBe('next-charge-no-tax');
        expect(content.l10nVars).toEqual(
          expect.objectContaining(expectedL10nVars)
        );
        expect(content.l10nVars).not.toHaveProperty('paymentMethod');
      });
    });
  });
});
