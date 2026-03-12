/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { Localized } from '@fluent/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { SubPlatPaymentMethodType } from '@fxa/payments/customer';
import { AlreadyCanceling } from '@fxa/payments/ui';
import { cancelSubscriptionAtPeriodEndAction } from '@fxa/payments/ui/actions';
import spinner from '@fxa/shared/assets/images/spinner.svg';
import type { Interval } from '@fxa/payments/metrics/client';
import { getLocalizedDateString } from '@fxa/shared/l10n';
import { LinkExternal } from '@fxa/shared/react';
import { BaseButton } from '../BaseButton';
import { useGleanMetrics } from '../../hooks/useGleanMetrics';

interface InterstitialOfferProps {
  uid: string;
  metricsEnabled: boolean;
  locale: string;
  subscriptionId: string;
  pageContent: {
    currentInterval: string;
    modalHeading1: string;
    modalMessage?: string[];
    upgradeButtonLabel: string;
    upgradeButtonUrl: string;
    webIcon: string;
    productName: string;
  } | null;
  cancelContent: {
    flowType: 'cancel';
    active: boolean;
    cancelAtPeriodEnd: boolean;
    currency: string;
    currentPeriodEnd: number;
    defaultPaymentMethodType?: SubPlatPaymentMethodType;
    last4?: string;
    nextInvoiceTax?: number;
    nextInvoiceTotal?: number;
    productName: string;
    supportUrl: string;
    webIcon: string;
  };
  searchParams?: URLSearchParams;
}

export function InterstitialOffer({
  uid,
  metricsEnabled,
  locale,
  subscriptionId,
  pageContent,
  cancelContent,
  searchParams,
}: InterstitialOfferProps) {
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelSuccess, setShowCancelSuccess] = useState(false);
  const [showCancelActionError, setShowCancelActionError] = useState(false);
  const glean = useGleanMetrics(metricsEnabled);

  const {
    currentInterval,
    modalHeading1,
    modalMessage,
    upgradeButtonLabel,
    upgradeButtonUrl,
  } = pageContent || {};

  const { cancelAtPeriodEnd, currentPeriodEnd } = cancelContent;

  const interstitialOfferBase = {
    flowType: 'cancel' as const,
    eligibilityStatus: 'offer' as const,
    interval: currentInterval as Interval,
    utmSource: searchParams?.get('utm_source') ?? undefined,
    utmMedium: searchParams?.get('utm_medium') ?? undefined,
    utmCampaign: searchParams?.get('utm_campaign') ?? undefined,
    nimbusUserId: searchParams?.get('nimbus_user_id') ?? undefined,
  };

  useEffect(() => {
    glean.recordInterstitialOffer({
      ...interstitialOfferBase,
      step: 'view',
    });
  }, []); // eslint-disable-line

  const productName = pageContent?.productName ?? cancelContent.productName;
  const webIcon = pageContent?.webIcon ?? cancelContent.webIcon;
  const supportUrl = cancelContent.supportUrl;

  const upgradeHref = useMemo(() => {
    if (!upgradeButtonUrl) return '';
    const url = new URL(upgradeButtonUrl);

    const newSearchParams = new URLSearchParams(searchParams?.toString() ?? '');
    newSearchParams.set('entrypoint', 'subscription-management');

    newSearchParams.forEach((value, key) => url.searchParams.set(key, value));

    return url.toString();
  }, [upgradeButtonUrl, searchParams]);

  const getKeepCurrentSubscription = (interval?: string) => {
    switch (interval) {
      case 'daily':
        return {
          ftlId: 'interstitial-offer-button-keep-current-interval-daily',
          fallbackText: 'Keep daily subscription',
        };
      case 'weekly':
        return {
          ftlId: 'interstitial-offer-button-keep-current-interval-weekly',
          fallbackText: 'Keep weekly subscription',
        };
      case 'halfyearly':
        return {
          ftlId: 'interstitial-offer-button-keep-current-interval-halfyearly',
          fallbackText: 'Keep six-month subscription',
        };
      case 'monthly':
        return {
          ftlId: 'interstitial-offer-button-keep-current-interval-monthly',
          fallbackText: 'Keep monthly subscription',
        };
      default:
        return {
          ftlId: 'interstitial-offer-button-keep-subscription',
          fallbackText: 'Keep subscription',
        };
    }
  };

  const { ftlId, fallbackText } = getKeepCurrentSubscription(currentInterval);

  async function cancelSubscriptionAtPeriodEnd() {
    if (cancelLoading) return;

    glean.recordInterstitialOffer({
      ...interstitialOfferBase,
      step: 'engage',
      action: 'cancel_subscription',
    });

    setCancelLoading(true);
    setShowCancelActionError(false);

    glean.recordInterstitialOffer({
      ...interstitialOfferBase,
      step: 'submit',
      action: 'cancel_subscription',
    });

    try {
      const result = await cancelSubscriptionAtPeriodEndAction(
        uid,
        subscriptionId
      );

      if (result.ok) {
        glean.recordInterstitialOffer({
          ...interstitialOfferBase,
          step: 'result',
          action: 'cancel_subscription',
          outcome: 'customer_canceled',
        });
        // TODO: This is a workaround to match existing legacy behavior.
        // Fix as part of redesign
        setShowCancelSuccess(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else {
        glean.recordInterstitialOffer({
          ...interstitialOfferBase,
          step: 'result',
          action: 'cancel_subscription',
          outcome: 'error',
          errorReason: 'operation_denied',
        });
        setShowCancelActionError(true);
      }
    } catch {
      glean.recordInterstitialOffer({
        ...interstitialOfferBase,
        step: 'result',
        action: 'cancel_subscription',
        outcome: 'error',
        errorReason: 'unexpected_exception',
      });
      setShowCancelActionError(true);
    } finally {
      setCancelLoading(false);
    }
  }

  const currentPeriodEndLongFallback = getLocalizedDateString(
    currentPeriodEnd,
    false,
    locale
  );

  return (
    <section
      className="flex justify-center min-h-[calc(100vh_-_4rem)] tablet:items-center tablet:min-h-[calc(100vh_-_5rem)]"
      aria-labelledby="interstitial-offer-heading"
    >
      {showCancelSuccess ? (
        <div className="w-full max-w-[480px] flex flex-col justify-center items-center p-10 tablet:bg-white tablet:rounded-xl tablet:border tablet:border-grey-200 tablet:shadow-[0_0_16px_0_rgba(0,0,0,0.08)]">
          <div className="w-full flex flex-col items-center gap-6 text-center">
            <Image src={webIcon} alt={productName} height={64} width={64} />
            <Localized id="interstitial-offer-success-cancel-title">
              <h1
                id="interstitial-offer-heading"
                className="font-bold leading-7 text-center text-xl"
              >
                We’re sorry to see you go
              </h1>
            </Localized>

            <div className="leading-6 my-2 text-center">
              <Localized
                id="interstitial-offer-cancel-success-dialog-msg"
                vars={{
                  productName,
                  date: currentPeriodEndLongFallback,
                }}
              >
                <span>
                  Your {productName} subscription has been cancelled. You will
                  still have access to {productName} until{' '}
                  {currentPeriodEndLongFallback}.
                </span>
              </Localized>

              <Localized id="interstitial-offer-turn-back-on">
                <p className="my-2">
                  You can turn your subscription back on anytime before it ends.
                </p>
              </Localized>
              <Localized
                id="interstitial-offer-cancel-success-dialog-aside"
                vars={{ url: supportUrl }}
                elems={{
                  LinkExternal: (
                    <LinkExternal
                      href={supportUrl}
                      className="text-blue-500 underline"
                    >
                      Mozilla Support
                    </LinkExternal>
                  ),
                }}
              >
                <p className="my-2">
                  Have questions? Visit{' '}
                  <LinkExternal
                    href={supportUrl}
                    className="text-blue-500 underline"
                  >
                    Mozilla Support
                  </LinkExternal>
                  .
                </p>
              </Localized>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <Link
                className="border box-border flex font-bold font-header h-14 items-center justify-center rounded text-center py-2 px-5 bg-grey-10 border-grey-200 hover:bg-grey-50"
                href={`/${locale}/subscriptions/landing`}
              >
                <Localized id="interstitial-offer-button-back-to-subscriptions">
                  <span>Back to subscriptions</span>
                </Localized>
              </Link>
            </div>
          </div>
        </div>
      ) : cancelAtPeriodEnd ? (
        <AlreadyCanceling
          currentPeriodEnd={currentPeriodEnd}
          locale={locale}
          productName={productName}
          webIcon={webIcon}
        />
      ) : (
        <div className="w-full max-w-[480px] flex flex-col justify-center items-center p-10 tablet:bg-white tablet:rounded-xl tablet:border tablet:border-grey-200 tablet:shadow-[0_0_16px_0_rgba(0,0,0,0.08)]">
          <div className="w-full flex flex-col items-center gap-6 text-center">
            <Image src={webIcon} alt={productName} height={64} width={64} />
            <h1 className="font-bold self-stretch text-center font-header text-xl leading-8">
              {modalHeading1}
            </h1>
          </div>

          <div className="w-full self-stretch leading-7 text-lg text-grey-900">
            {modalMessage?.map((line, i) => (
              <p className="my-2" key={i}>
                {line}
              </p>
            ))}
          </div>

          {showCancelActionError && !cancelLoading && (
            <Localized id="interstitial-offer-action-error">
              <p
                className="mt-4 w-full text-alert-red font-normal text-start"
                role="alert"
              >
                An unexpected error occurred. Please try again.
              </p>
            </Localized>
          )}

          <div className="w-full flex flex-col gap-3 mt-12">
            <Link
              className="border box-border font-header h-14 items-center justify-center rounded-md text-white text-center font-bold py-4 px-6 bg-blue-500 hover:bg-blue-700 flex w-full"
              href={upgradeHref}
              onClick={() =>
                glean.recordInterstitialOffer({
                  ...interstitialOfferBase,
                  step: 'engage',
                  action: 'offer',
                })
              }
            >
              {upgradeButtonLabel}
            </Link>

            <Link
              className="border box-border font-header h-14 items-center justify-center rounded-md text-center font-bold py-4 px-6 bg-grey-10 border-grey-200 hover:bg-grey-50 flex w-full"
              href={`/${locale}/subscriptions/landing`}
              onClick={() =>
                glean.recordInterstitialOffer({
                  ...interstitialOfferBase,
                  step: 'engage',
                  action: 'keep_subscription',
                })
              }
            >
              <Localized id={ftlId}>
                <span>{fallbackText}</span>
              </Localized>
            </Link>

            <BaseButton
              type="button"
              onClick={cancelSubscriptionAtPeriodEnd}
              disabled={cancelLoading}
              className="border box-border font-header h-14 items-center justify-center rounded-md text-center font-bold py-4 px-6 bg-grey-10 border-grey-200 hover:bg-grey-50 flex w-full relative"
            >
              {cancelLoading ? (
                <Image
                  src={spinner}
                  alt=""
                  className="absolute animate-spin h-8 w-8"
                />
              ) : (
                <Localized id="interstitial-offer-cancel-subscription-button">
                  <span>Cancel subscription</span>
                </Localized>
              )}
            </BaseButton>
          </div>
        </div>
      )}
    </section>
  );
}
