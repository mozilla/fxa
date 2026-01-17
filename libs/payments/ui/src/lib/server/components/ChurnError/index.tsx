/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';

import {
  getNextChargeChurnContent,
  SubPlatPaymentMethodType,
} from '@fxa/payments/ui';
import { LinkExternal } from '@fxa/shared/react';
import { getApp } from '@fxa/payments/ui/server';

type ChurnErrorProps = {
  cmsOfferingContent: any;
  locale: string;
  reason: string;
  pageContent: {
    flowType: 'cancel' | 'stay_subscribed';
    active: boolean;
    cancelAtPeriodEnd: boolean;
    currency: string;
    currentPeriodEnd: number;
    defaultPaymentMethodType?: SubPlatPaymentMethodType;
    last4?: string;
    nextInvoiceTax?: number;
    nextInvoiceTotal?: number;
    productName: string;
    webIcon: string;
  };
  subscriptionId: string;
};

export async function ChurnError({
  cmsOfferingContent,
  locale,
  reason,
  pageContent,
  subscriptionId,
}: ChurnErrorProps) {
  const acceptLanguage = headers().get('accept-language');
  const l10n = getApp().getL10n(acceptLanguage);

  const { productName, successActionButtonUrl, supportUrl, webIcon } =
    cmsOfferingContent;

  switch (reason) {
    case 'discount_already_applied':
    case 'redemption_limit_exceeded':
      return (
        <section
          className="flex justify-center min-h-[calc(100vh_-_4rem)] tablet:items-center tablet:min-h-[calc(100vh_-_5rem)]"
          aria-labelledby="error-discount-already-applied-heading"
        >
          <div className="w-[480px] p-10 text-grey-600 tablet:bg-white tablet:rounded-xl tablet:border tablet:border-grey-200 tablet:shadow-[0_0_16px_0_rgba(0,0,0,0.08)]">
            <div className="flex flex-col items-center justify-center gap-6 text-center">
              <Image src={webIcon} alt={productName} height={64} width={64} />
              <h1
                id="error-discount-already-applied-heading"
                className="font-bold leading-7 text-center text-xl"
              >
                {l10n.getString(
                  'churn-error-page-title-discount-already-applied',
                  'Discount code already applied'
                )}
              </h1>
              <div className="leading-6">
                <p className="my-2">
                  {l10n.getString(
                    'churn-error-page-message-discount-already-applied',
                    { productName },
                    `This discount was applied to a ${productName} subscription for your account. If you still need help, please contact our Support team.`
                  )}
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <Link
                  href={`/${locale}/subscriptions/landing`}
                  className="border box-border flex font-bold font-header h-12 items-center justify-center rounded text-center py-2 px-5 bg-blue-500 border-blue-600 hover:bg-blue-700 text-white"
                >
                  {l10n.getString(
                    'churn-error-page-button-manage-subscriptions',
                    'Manage subscriptions'
                  )}
                </Link>
                <LinkExternal
                  href={supportUrl}
                  className="box-border flex font-bold font-header h-12 items-center justify-center rounded text-center py-2 px-5 border-2 border-blue-600 hover:bg-grey-50 text-blue-600"
                >
                  {l10n.getString(
                    'churn-error-page-button-contact-support',
                    'Contact Support'
                  )}
                </LinkExternal>
              </div>
            </div>
          </div>
        </section>
      );
    case 'subscription_not_active':
      return (
        <section
          className="flex justify-center min-h-[calc(100vh_-_4rem)] tablet:items-center tablet:min-h-[calc(100vh_-_5rem)]"
          aria-labelledby="error-subscription-not-active-heading"
        >
          <div className="w-[480px] p-10 text-grey-600 tablet:bg-white tablet:rounded-xl tablet:border tablet:border-grey-200 tablet:shadow-[0_0_16px_0_rgba(0,0,0,0.08)]">
            <div className="flex flex-col items-center justify-center gap-6 text-center">
              <Image src={webIcon} alt={productName} height={64} width={64} />
              <h1
                id="error-subscription-not-active-heading"
                className="font-bold leading-7 text-center text-xl"
              >
                {l10n.getString(
                  'churn-error-page-title-subscription-not-active',
                  { productName },
                  `This discount is only available to current ${productName}
                    subscribers`
                )}
              </h1>
              <div className="w-full">
                <LinkExternal
                  href={successActionButtonUrl}
                  className="border box-border flex font-bold font-header h-12 items-center justify-center rounded text-center py-2 px-5 bg-blue-500 border-blue-600 hover:bg-blue-700 text-white"
                >
                  {l10n.getString(
                    'churn-error-page-button-go-to-product-page',
                    { productName },
                    `Go to ${productName}`
                  )}
                </LinkExternal>
              </div>
            </div>
          </div>
        </section>
      );
    case 'subscription_still_active':
      if (!pageContent) {
        // Re-render as general error section below
        break;
      }

      const nextChargeChurnContent = getNextChargeChurnContent({
        currency: pageContent.currency,
        currentPeriodEnd: pageContent.currentPeriodEnd,
        locale,
        defaultPaymentMethodType: pageContent.defaultPaymentMethodType,
        last4: pageContent.last4,
        nextInvoiceTotal: pageContent.nextInvoiceTotal,
        nextInvoiceTax: pageContent.nextInvoiceTax,
      });

      return (
        <section
          className="flex justify-center min-h-[calc(100vh_-_4rem)] tablet:items-center tablet:min-h-[calc(100vh_-_5rem)]"
          aria-labelledby="error-subscription-still-active-heading"
        >
          <div className="w-[480px] p-10 text-grey-600 tablet:bg-white tablet:rounded-xl tablet:border tablet:border-grey-200 tablet:shadow-[0_0_16px_0_rgba(0,0,0,0.08)]">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <Image src={webIcon} alt={productName} height={64} width={64} />

              <h1
                id="error-subscription-still-active-heading"
                className="font-bold leading-7 text-center text-xl"
              >
                {l10n.getString(
                  'churn-error-page-title-subscription-still-active',
                  { productName },
                  `Your ${productName} subscription is still active`
                )}
              </h1>
              <div className="leading-6">
                <p className="my-2">
                  {l10n.getString(
                    nextChargeChurnContent.l10nId,
                    nextChargeChurnContent.l10nVars,
                    nextChargeChurnContent.fallback
                  )}
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <LinkExternal
                  href={successActionButtonUrl}
                  className="border box-border flex font-bold font-header h-12 items-center justify-center rounded text-center py-2 px-5 bg-grey-10 border-grey-200 hover:bg-grey-50"
                >
                  {l10n.getString(
                    'churn-error-page-button-go-to-product-page',
                    { productName },
                    `Go to ${productName}`
                  )}
                </LinkExternal>
                <Link
                  href={`/${locale}/subscriptions/landing`}
                  className="border box-border flex font-bold font-header h-12 items-center justify-center rounded text-center py-2 px-5 bg-grey-10 border-grey-200 hover:bg-grey-50"
                >
                  {l10n.getString(
                    'churn-error-page-button-manage-subscriptions',
                    'Manage subscriptions'
                  )}
                </Link>
              </div>
            </div>
          </div>
        </section>
      );
    case 'general_error':
    default:
      break;
  }
  return (
    <section
      className="flex justify-center min-h-[calc(100vh_-_4rem)] tablet:items-center tablet:min-h-[calc(100vh_-_5rem)]"
      aria-labelledby="general-error-heading"
    >
      <div className="w-[480px] p-10 text-grey-600 tablet:bg-white tablet:rounded-xl tablet:border tablet:border-grey-200 tablet:shadow-[0_0_16px_0_rgba(0,0,0,0.08)]">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <h1
            id="general-error-heading"
            className="font-bold leading-7 text-center text-xl"
          >
            {l10n.getString(
              'churn-error-page-title-general-error',
              'There was an issue with renewing your subscription'
            )}
          </h1>
          <div className="leading-6">
            {l10n.getString(
              'churn-error-page-message-general-error',
              'Contact support or try again.'
            )}
          </div>
          <div className="flex flex-col gap-3 w-full">
            <LinkExternal
              href={'https://support.mozilla.org/'}
              className="border box-border flex font-bold font-header h-12 items-center justify-center rounded text-center py-2 px-5 bg-blue-500 border-blue-600 hover:bg-blue-700 text-white"
            >
              {l10n.getString(
                'churn-error-page-button-contact-support',
                'Contact Support'
              )}
            </LinkExternal>
            <Link
              href={`/${locale}/subscriptions/${subscriptionId}/loyalty-discount/stay-subscribed`}
              className="border-2 box-border flex font-bold font-header h-12 items-center justify-center rounded text-center py-2 px-5 border-blue-600 hover:bg-grey-50 text-blue-600"
            >
              {l10n.getString('churn-error-page-button-try-again', 'Try again')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
