/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { SubscriptionParams } from '@fxa/payments/ui';
import { determineChurnCancelEligibilityAction } from '@fxa/payments/ui/actions';
import { ChurnError, getApp } from '@fxa/payments/ui/server';
import { getLocalizedDateString } from '@fxa/shared/l10n';
import { auth } from 'apps/payments/next/auth';
import { config } from 'apps/payments/next/config';

export default async function LoyaltyDiscountCancelErrorPage({
  params,
  searchParams,
}: {
  params: SubscriptionParams;
  searchParams: Record<string, string> | undefined;
}) {
  const { locale, subscriptionId } = params;

  if (!config.churnInterventionConfig.enabled) {
    redirect(`/${locale}/subscriptions/${subscriptionId}/cancel`);
  }

  const acceptLanguage = headers().get('accept-language');
  const l10n = getApp().getL10n(acceptLanguage, locale);

  const session = await auth();
  if (!session?.user?.id) {
    const redirectToUrl = new URL(
      `${config.paymentsNextHostedUrl}/${locale}/subscriptions/landing`
    );
    redirectToUrl.search = new URLSearchParams(searchParams).toString();
    redirectToUrl.searchParams.set(
      'redirect_to',
      `/${locale}/subscriptions/${subscriptionId}/loyalty-discount/cancel/error`
    );
    redirect(redirectToUrl.href);
  }

  const uid = session.user.id;

  let pageContent;
  try {
    pageContent = await determineChurnCancelEligibilityAction(
      uid,
      subscriptionId,
      acceptLanguage
    );
  } catch (error) {
    pageContent = null;
  }

  if (!pageContent) {
    return (
      <ChurnError
        cmsOfferingContent={undefined}
        locale={locale}
        reason="general_error"
        pageContent={{ flowType: 'not_found' }}
        subscriptionId={subscriptionId}
      />
    );
  }

  const { churnCancelContentEligibility } = pageContent;
  if (churnCancelContentEligibility.isEligible) {
    redirect(
      `/${locale}/subscriptions/${subscriptionId}/loyalty-discount/cancel`
    );
  }

  const { cmsOfferingContent, reason } = churnCancelContentEligibility;

  const cancelContent = pageContent.cancelContent;

  if (cancelContent.flowType !== 'cancel' || !cmsOfferingContent) {
    return (
      <ChurnError
        cmsOfferingContent={cmsOfferingContent}
        locale={locale}
        reason={reason ?? 'general_error'}
        pageContent={cancelContent}
        subscriptionId={subscriptionId}
      />
    );
  }

  if (reason === 'no_churn_intervention_found') {
    const { productName, webIcon } = cmsOfferingContent;
    return (
      <section
        className="flex justify-center min-h-[calc(100vh_-_4rem)] tablet:items-center tablet:min-h-[calc(100vh_-_5rem)]"
        aria-labelledby="churn-cancel-flow-error-heading"
      >
        <div className="max-w-[480px] p-10 text-grey-600 tablet:bg-white tablet:rounded-xl tablet:border tablet:border-grey-200 tablet:shadow-[0_0_16px_0_rgba(0,0,0,0.08)]">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Image src={webIcon} alt={productName} height={64} width={64} />

            <h1
              id="churn-cancel-flow-error-heading"
              className="font-bold leading-7 text-center text-xl"
            >
              {l10n.getString(
                'churn-cancel-flow-error-offer-expired-title',
                'This offer has expired'
              )}
            </h1>
            <div className="leading-6">
              <p className="my-2">
                {l10n.getString(
                  'churn-cancel-flow-error-offer-expired-message',
                  `There are currently no discounts available for this subscription. You can continue with cancellation if you’d like.`
                )}
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <Link
                href={`/${locale}/subscriptions/${subscriptionId}/cancel`}
                className="border box-border flex font-bold font-header h-12 items-center justify-center rounded text-center py-2 px-5 bg-blue-500 border-blue-600 hover:bg-blue-700 text-white"
              >
                {l10n.getString(
                  'churn-cancel-flow-error-button-continue-to-cancel',
                  'Continue to cancel'
                )}
              </Link>
              <Link
                href={`/${locale}/subscriptions/landing`}
                className="border box-border flex font-bold font-header h-12 items-center justify-center rounded text-center py-2 px-5 bg-grey-10 border-grey-200 hover:bg-grey-50"
              >
                {l10n.getString(
                  'churn-cancel-flow-error-page-button-back-to-subscriptions',
                  'Back to subscriptions'
                )}
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (reason === 'already_canceling_at_period_end') {
    const { productName, webIcon } = cmsOfferingContent;
    const { currentPeriodEnd } = cancelContent;
    const currentPeriodEndLongFallback = getLocalizedDateString(
      currentPeriodEnd,
      false,
      locale
    );
    return (
      <section
        className="flex justify-center min-h-[calc(100vh_-_4rem)] tablet:items-center tablet:min-h-[calc(100vh_-_5rem)]"
        aria-labelledby="error-already-canceling-heading"
      >
        <div className="max-w-[480px] p-10 text-grey-600 tablet:bg-white tablet:rounded-xl tablet:border tablet:border-grey-200 tablet:shadow-[0_0_16px_0_rgba(0,0,0,0.08)]">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Image src={webIcon} alt={productName} height={64} width={64} />

            <h1
              id="error-already-canceling-heading"
              className="font-bold leading-7 text-center text-xl"
            >
              {l10n.getString(
                'churn-cancel-flow-error-already-canceling-title',
                'Your subscription is set to end'
              )}
            </h1>
            <div className="leading-6">
              <p className="my-2">
                {l10n.getString(
                  'churn-cancel-flow-error-already-canceling-message',
                  {
                    productName,
                    currentPeriodEnd: currentPeriodEndLongFallback,
                  },
                  `You’ll continue to have access to ${productName} until ${currentPeriodEndLongFallback}.`
                )}
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <Link
                href={`/${locale}/subscriptions/landing`}
                className="border box-border flex font-bold font-header h-12 items-center justify-center rounded text-center py-2 px-5 bg-blue-500 border-blue-600 hover:bg-blue-700 text-white"
              >
                {l10n.getString(
                  'churn-cancel-flow-error-page-button-back-to-subscriptions',
                  'Back to subscriptions'
                )}
              </Link>
              <Link
                href={`/${locale}/subscriptions/${subscriptionId}/stay-subscribed`}
                className="border box-border flex font-bold font-header h-12 items-center justify-center rounded text-center py-2 px-5 bg-grey-10 border-grey-200 hover:bg-grey-50"
              >
                {l10n.getString(
                  'churn-cancel-flow-error-page-button-keep-subscription',
                  'Keep subscription'
                )}
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <ChurnError
      cmsOfferingContent={cmsOfferingContent}
      locale={locale}
      reason={reason ?? 'general_error'}
      pageContent={cancelContent}
      subscriptionId={subscriptionId}
    />
  );
}
