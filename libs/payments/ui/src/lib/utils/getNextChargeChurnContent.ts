/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FluentVariable } from '@fluent/bundle';
import {
  getLocalizedCurrencyString,
  getLocalizedDateString,
} from '@fxa/shared/l10n';

export enum SubPlatPaymentMethodType {
  PayPal = 'external_paypal',
  Stripe = 'stripe',
  Card = 'card',
  ApplePay = 'apple_pay',
  GooglePay = 'google_pay',
  Link = 'link',
}

export function getNextChargeChurnContent({
  currency,
  currentPeriodEnd,
  locale,
  nextInvoiceTotal,
  defaultPaymentMethodType,
  discountAmount,
  last4,
  nextInvoiceTax,
}: {
  currency: string;
  currentPeriodEnd: number;
  locale: string;
  nextInvoiceTotal?: number;
  defaultPaymentMethodType?: SubPlatPaymentMethodType;
  discountAmount?: number;
  last4?: string;
  nextInvoiceTax?: number;
}) {
  const getCurrencyFallbackText = (amount: number) =>
    getLocalizedCurrencyString(amount, currency, locale);

  const currentPeriodEndLongFallback = getLocalizedDateString(
    currentPeriodEnd,
    false,
    locale
  );

  const hasDiscount = typeof discountAmount === 'number' && discountAmount > 0;
  const taxAmount =
    typeof nextInvoiceTax === 'number' && nextInvoiceTax > 0
      ? nextInvoiceTax
      : undefined;
  const hasTax = taxAmount !== undefined;
  const noTaxAmountProvided = !hasTax;

  const paymentMethod =
    defaultPaymentMethodType === SubPlatPaymentMethodType.PayPal
      ? 'PayPal'
      : defaultPaymentMethodType === SubPlatPaymentMethodType.Link
        ? 'Link'
        : defaultPaymentMethodType === SubPlatPaymentMethodType.ApplePay
          ? 'Apple Pay'
          : defaultPaymentMethodType === SubPlatPaymentMethodType.GooglePay
            ? 'Google Pay'
            : undefined;

  const totalText = getCurrencyFallbackText(nextInvoiceTotal ?? 0);
  const taxText = hasTax ? getCurrencyFallbackText(taxAmount) : undefined;

  const l10nVars: Record<string, FluentVariable> = {
    currentPeriodEnd: currentPeriodEndLongFallback,
    nextInvoiceTotal: getCurrencyFallbackText(nextInvoiceTotal ?? 0),
  };

  if (hasDiscount) {
    l10nVars.discountPercent = discountAmount;
  }

  if (hasTax) {
    l10nVars.taxDue = getCurrencyFallbackText(taxAmount);
  }

  if (last4) {
    l10nVars.last4 = last4;
  }

  if (paymentMethod) {
    l10nVars.paymentMethod = paymentMethod;
  }

  if (hasDiscount) {
    if (hasTax) {
      if (defaultPaymentMethodType === SubPlatPaymentMethodType.Card && last4) {
        return {
          l10nId: 'next-charge-with-discount-and-tax-card',
          l10nVars,
          fallback: `You will save ${discountAmount}% on your next charge of ${totalText} + ${taxText} tax to the card ending in ${last4} on ${currentPeriodEndLongFallback}.`,
        };
      } else if (paymentMethod) {
        return {
          l10nId: 'next-charge-with-discount-and-tax-payment-method',
          l10nVars,
          fallback: `You will save ${discountAmount}% on your next charge of ${totalText} + ${taxText} tax to your ${paymentMethod} payment method on ${currentPeriodEndLongFallback}.`,
        };
      } else {
        return {
          l10nId: 'next-charge-with-discount-and-tax',
          l10nVars,
          fallback: `You will save ${discountAmount}% on your next charge of ${totalText} + ${taxText} tax on ${currentPeriodEndLongFallback}.`,
        };
      }
    }

    if (noTaxAmountProvided) {
      if (defaultPaymentMethodType === SubPlatPaymentMethodType.Card && last4) {
        return {
          l10nId: 'next-charge-with-discount-no-tax-card',
          l10nVars,
          fallback: `You will save ${discountAmount}% on your next charge of ${totalText} to the card ending in ${last4} on ${currentPeriodEndLongFallback}.`,
        };
      } else if (paymentMethod) {
        return {
          l10nId: 'next-charge-with-discount-no-tax-payment-method',
          l10nVars,
          fallback: `You will save ${discountAmount}% on your next charge of ${totalText} to your ${paymentMethod} payment method on ${currentPeriodEndLongFallback}.`,
        };
      } else {
        return {
          l10nId: 'next-charge-with-discount-no-tax',
          l10nVars,
          fallback: `You will save ${discountAmount}% on your next charge of ${totalText} on ${currentPeriodEndLongFallback}.`,
        };
      }
    }
  }

  if (hasTax) {
    if (defaultPaymentMethodType === SubPlatPaymentMethodType.Card && last4) {
      return {
        l10nId: 'next-charge-with-tax-card',
        l10nVars,
        fallback: `Your next charge will be ${totalText} + ${taxText} tax to the card ending in ${last4} on ${currentPeriodEndLongFallback}.`,
      };
    } else if (paymentMethod) {
      return {
        l10nId: 'next-charge-with-tax-payment-method',
        l10nVars,
        fallback: `Your next charge will be ${totalText} + ${taxText} tax to your ${paymentMethod} payment method on ${currentPeriodEndLongFallback}.`,
      };
    } else {
      return {
        l10nId: 'next-charge-with-tax',
        l10nVars,
        fallback: `Your next charge will be ${totalText} + ${taxText} tax on ${currentPeriodEndLongFallback}.`,
      };
    }
  }

  if (noTaxAmountProvided) {
    if (defaultPaymentMethodType === SubPlatPaymentMethodType.Card && last4) {
      return {
        l10nId: 'next-charge-no-tax-card',
        l10nVars,
        fallback: `Your next charge will be ${totalText} to the card ending in ${last4} on ${currentPeriodEndLongFallback}.`,
      };
    } else if (paymentMethod) {
      return {
        l10nId: 'next-charge-no-tax-payment-method',
        l10nVars,
        fallback: `Your next charge will be ${totalText} to your ${paymentMethod} payment method on ${currentPeriodEndLongFallback}.`,
      };
    } else {
      return {
        l10nId: 'next-charge-no-tax',
        l10nVars,
        fallback: `Your next charge will be ${totalText} on ${currentPeriodEndLongFallback}.`,
      };
    }
  }

  return {
    l10nId: 'next-charge-no-tax',
    l10nVars,
    fallback: `Your next charge will be ${totalText} on ${currentPeriodEndLongFallback}.`,
  };
}
