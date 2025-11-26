/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import * as Form from '@radix-ui/react-form';
import { Localized } from '@fluent/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { SubPlatPaymentMethodType } from '@fxa/payments/customer';
import { ButtonVariant, SubmitButton } from '@fxa/payments/ui';
import { resubscribeSubscriptionAction } from '@fxa/payments/ui/actions';
import spinner from '@fxa/shared/assets/images/spinner.svg';
import {
  getLocalizedCurrencyString,
  getLocalizedDateString,
} from '@fxa/shared/l10n';

interface StaySubscribedProps {
  userId: string;
  subscriptionId: string;
  locale: string;
  pageContent: {
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
}

export function StaySubscribed({
  userId,
  subscriptionId,
  locale,
  pageContent,
}: StaySubscribedProps) {
  const {
    active,
    cancelAtPeriodEnd,
    currency,
    currentPeriodEnd,
    nextInvoiceTax,
    nextInvoiceTotal,
    productName,
    webIcon,
  } = pageContent;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showResubscribeActionError, setResubscribeActionError] =
    useState(false);

  async function resubscribe() {
    if (loading) {
      return;
    }

    setLoading(true);
    setResubscribeActionError(false);

    const result = await resubscribeSubscriptionAction(userId, subscriptionId);
    if (result.ok) {
      // TODO: This is a workaround to match existing legacy behavior.
      // Fix as part of redesign
      await new Promise((resolve) => setTimeout(resolve, 500));
    } else {
      setResubscribeActionError(true);
    }
    setLoading(false);
  }

  const getCurrencyFallbackText = (amount: number) => {
    return getLocalizedCurrencyString(amount, currency, locale);
  };

  const currentPeriodEndLongFallback = getLocalizedDateString(
    currentPeriodEnd,
    false,
    locale
  );

  return (
    <section
      className="flex items-center justify-center min-h-[calc(100vh_-_4rem)] tablet:min-h-[calc(100vh_-_5rem)]"
      aria-labelledby="stay-subscribed-heading"
    >
      {cancelAtPeriodEnd && active ? (
        <Form.Root
          action={resubscribe}
          className="max-w-[480px] p-10 text-grey-600 bg-white rounded-xl border border-grey-200 shadow-[0_0_16px_0_rgba(0,0,0,0.08)]"
        >
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Image src={webIcon} alt={productName} height={64} width={64} />
            <Localized id="resubscribe-dialog-title" vars={{ productName }}>
              <h1
                id="stay-subscribed-heading"
                className="font-bold leading-7 text-center text-lg"
              >
                Want to keep using {productName}?
              </h1>
            </Localized>

            {nextInvoiceTax ? (
              <div>
                <Localized
                  id="stay-subscribed-access-will-continue"
                  vars={{
                    productName,
                  }}
                >
                  <p className="leading-6 my-2">
                    Your access to {productName} will continue, and your billing
                    cycle and payment will stay the same.
                  </p>
                </Localized>
                <Localized
                  id="stay-subscribed-next-charge-with-tax"
                  vars={{
                    nextInvoiceTotal: getCurrencyFallbackText(
                      nextInvoiceTotal ?? 0
                    ),
                    currentPeriodEnd: currentPeriodEndLongFallback,
                    taxDue: getCurrencyFallbackText(nextInvoiceTax),
                  }}
                >
                  <p className="leading-6 my-2">
                    Your next charge will be{' '}
                    {getCurrencyFallbackText(nextInvoiceTotal ?? 0)} +{' '}
                    {getCurrencyFallbackText(nextInvoiceTax)} tax on{' '}
                    {currentPeriodEndLongFallback}.
                  </p>
                </Localized>
              </div>
            ) : (
              <div>
                <Localized
                  id="stay-subscribed-access-will-continue"
                  vars={{
                    productName,
                  }}
                >
                  <p className="leading-6 my-2">
                    Your access to {productName} will continue, and your billing
                    cycle and payment will stay the same.
                  </p>
                </Localized>
                <Localized
                  id="stay-subscribed-next-charge-no-tax"
                  vars={{
                    nextInvoiceTotal: getCurrencyFallbackText(
                      nextInvoiceTotal ?? 0
                    ),
                    currentPeriodEnd: currentPeriodEndLongFallback,
                  }}
                >
                  <p className="leading-6 my-2">
                    Your next charge will be{' '}
                    {getCurrencyFallbackText(nextInvoiceTotal ?? 0)} on{' '}
                    {currentPeriodEndLongFallback}.
                  </p>
                </Localized>
              </div>
            )}

            {showResubscribeActionError && (
              <Localized id="subscription-content-cancel-action-error">
                <p
                  className="mt-1 text-alert-red font-normal text-start"
                  role="alert"
                >
                  An unexpected error occurred. Please try again.
                </p>
              </Localized>
            )}

            <Form.Submit asChild>
              <SubmitButton
                className="flex h-14 items-center justify-center w-full"
                variant={ButtonVariant.Primary}
                aria-label={`Resubscribe to ${productName}`}
                disabled={loading}
              >
                <Localized
                  id="subscription-content-button-resubscribe"
                  vars={{ productName }}
                  attrs={{ 'aria-label': true }}
                >
                  Resubscribe
                </Localized>
              </SubmitButton>
            </Form.Submit>
          </div>
        </Form.Root>
      ) : (
        <Form.Root className="w-[480px] max-w-[480px] p-10 text-grey-600 bg-white rounded-xl border border-grey-200 shadow-[0_0_16px_0_rgba(0,0,0,0.08)]">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Image src={webIcon} alt={productName} height={64} width={64} />
            <Localized id="resubscribe-success-dialog-title">
              <h1 className="font-bold leading-7 text-lg">
                Thanks! You’re all set.
              </h1>
            </Localized>

            <Link
              className="border box-border font-bold font-header h-14 items-center justify-center rounded text-center py-2 px-5 bg-grey-10 border-grey-200 hover:bg-grey-50 flex w-full"
              href={`/${locale}/subscriptions/landing`}
              onClick={(e) => {
                e.preventDefault();
                setLoading(true);
                router.push(`/${locale}/subscriptions/landing`);
              }}
            >
              {loading ? (
                <Image
                  src={spinner}
                  alt=""
                  className="absolute animate-spin h-8 w-8"
                />
              ) : (
                <Localized id="button-back-to-subscriptions">
                  <span>Back to subscriptions</span>
                </Localized>
              )}
            </Link>
          </div>
        </Form.Root>
      )}
    </section>
  );
}
