/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PaymentInfo } from '@fxa/payments/cart';

/* eslint-disable-next-line */
export type GenericTermsListItem = {
  key: string;
  href: string;
  text: string;
  localizationId: string;
};

export type GenericTermItem = {
  key: string;
  title: string;
  titleLocalizationId: string;
  items: GenericTermsListItem[];
};

export const PaymentProviders = {
  stripe: 'card',
  paypal: 'external_paypal',
  google_iap: 'google_iap',
  apple_iap: 'apple_iap',
  link: 'link',
  amazon_pay: 'amazon_pay',
} as const;

export type PaymentProvidersType = typeof PaymentProviders;
export type PaymentProvider = PaymentProvidersType[keyof PaymentProvidersType];

export function buildPaymentTerms(
  provider?: PaymentInfo,
  hasActiveSubscriptions?: boolean
): GenericTermItem[] {
  let providerString = '';
  let titleLocalizationId = '';
  const providerType =
    hasActiveSubscriptions && provider ? provider.type : undefined;
  const items: GenericTermsListItem[] = [];
  switch (providerType) {
    case PaymentProviders.link:
    case PaymentProviders.amazon_pay:
    case PaymentProviders.stripe:
      providerString = 'Stripe';
      titleLocalizationId = 'terms-and-privacy-stripe-label';
      items.push({
        key: 'payment-provider-terms-1',
        href: 'https://stripe.com/privacy',
        text: 'Stripe privacy policy',
        localizationId: 'terms-and-privacy-stripe-link',
      });
      break;
    case PaymentProviders.paypal:
      providerString = 'PayPal';
      titleLocalizationId = 'terms-and-privacy-paypal-label';
      items.push({
        key: 'payment-provider-terms-2',
        href: 'https://www.paypal.com/webapps/mpp/ua/privacy-full',
        text: 'PayPal privacy policy',
        localizationId: 'terms-and-privacy-paypal-link',
      });
      break;
    case PaymentProviders.apple_iap:
    case PaymentProviders.google_iap:
    default:
      providerString = 'Stripe and PayPal';
      titleLocalizationId = 'terms-and-privacy-stripe-and-paypal-label';
      items.push(
        {
          key: 'payment-provider-terms-1',
          href: 'https://stripe.com/privacy',
          text: 'Stripe privacy policy',
          localizationId: 'terms-and-privacy-stripe-link',
        },
        {
          key: 'payment-provider-terms-2',
          href: 'https://www.paypal.com/webapps/mpp/ua/privacy-full',
          text: 'PayPal privacy policy',
          localizationId: 'terms-and-privacy-paypal-link',
        }
      );
      break;
  }

  return [
    {
      key: 'payment-provider-terms',
      title: `Mozilla uses ${providerString} for secure payment processing.`,
      titleLocalizationId,
      items,
    },
  ];
}

export function buildFirefoxAccountsTerms(
  showFxaLinks: boolean,
  contentServerURL?: string
): GenericTermItem[] {
  if (!showFxaLinks) {
    return [];
  }

  return [
    {
      key: 'fxa-terms',
      title: 'Mozilla Accounts',
      titleLocalizationId: 'next-subplat-mozilla-accounts-legal-heading',
      items: [
        {
          key: 'fxa-terms-1',
          href: `${contentServerURL}/legal/terms`,
          text: 'Terms of Service',
          localizationId: 'next-terms',
        },
        {
          key: 'fxa-terms-2',
          href: `${contentServerURL}/legal/privacy`,
          text: 'Privacy Notice',
          localizationId: 'next-privacy',
        },
      ],
    },
  ];
}

export function buildProductTerms(
  productName: string,
  termsOfService?: string,
  privacyNotice?: string,
  termsOfServiceDownload?: string
): GenericTermItem[] {
  const items: GenericTermsListItem[] = [];

  if (termsOfService) {
    items.push({
      key: 'product-terms-1',
      href: termsOfService,
      text: 'Terms of Service',
      localizationId: 'next-terms',
    });
  }

  if (privacyNotice) {
    items.push({
      key: 'product-terms-2',
      href: privacyNotice,
      text: 'Privacy Notice',
      localizationId: 'next-privacy',
    });
  }

  if (termsOfServiceDownload) {
    items.push({
      key: 'product-terms-3',
      href: termsOfServiceDownload,
      text: 'Download Terms',
      localizationId: 'next-terms-download',
    });
  }

  if (!items.length) {
    return [];
  }

  return [
    {
      key: 'product-terms',
      title: productName,
      titleLocalizationId: '',
      items,
    },
  ];
}

export async function getTermsCMS(offering: string) {}
