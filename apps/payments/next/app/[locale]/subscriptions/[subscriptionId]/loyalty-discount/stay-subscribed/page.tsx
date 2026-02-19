/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { ChurnStaySubscribed, SubscriptionParams } from '@fxa/payments/ui';
import { determineStaySubscribedEligibilityAction } from '@fxa/payments/ui/actions';
import { auth } from 'apps/payments/next/auth';
import { config } from 'apps/payments/next/config';

export default async function LoyaltyDiscountStaySubscribedPage({
  params,
  searchParams,
}: {
  params: SubscriptionParams;
  searchParams: Record<string, string> | undefined;
}) {
  const { locale, subscriptionId } = params;

  if (!config.churnInterventionConfig.enabled) {
    redirect(`/${locale}/subscriptions/${subscriptionId}/stay-subscribed`);
  }

  const acceptLanguage = headers().get('accept-language');

  const session = await auth();
  if (!session?.user?.id) {
    const redirectToUrl = new URL(
      `${config.paymentsNextHostedUrl}/${locale}/subscriptions/landing`
    );
    redirectToUrl.search = new URLSearchParams(searchParams).toString();
    redirectToUrl.searchParams.set(
      'redirect_to',
      `/${locale}/subscriptions/${subscriptionId}/loyalty-discount/stay-subscribed`
    );
    redirect(redirectToUrl.href);
  }

  const uid = session.user.id;

  let pageContent;
  try {
    pageContent = await determineStaySubscribedEligibilityAction(
      uid,
      subscriptionId,
      acceptLanguage
    );
  } catch (error) {
    redirect(
      `/${locale}/subscriptions/${subscriptionId}/loyalty-discount/stay-subscribed/error`
    );
  }

  if (!pageContent) {
    redirect(
      `/${locale}/subscriptions/${subscriptionId}/loyalty-discount/stay-subscribed/error`
    );
  }

  const { churnStaySubscribedEligibility, staySubscribedContent } = pageContent;
  const { cmsOfferingContent, reason, cmsChurnInterventionEntry } =
    churnStaySubscribedEligibility;
  const reasonStr = typeof reason === 'string' ? reason : undefined;
  const isAllowedStayReason =
    reasonStr === 'eligible' ||
    reasonStr === 'no_churn_intervention_found' ||
    reasonStr === 'subscription_still_active';

  if (!isAllowedStayReason) {
    redirect(
      `/${locale}/subscriptions/${subscriptionId}/loyalty-discount/stay-subscribed/error`
    );
  }

  if (
    !staySubscribedContent ||
    staySubscribedContent.flowType !== 'stay_subscribed'
  ) {
    redirect(
      `/${locale}/subscriptions/${subscriptionId}/loyalty-discount/stay-subscribed/error`
    );
  }

  if (isAllowedStayReason) {
    return (
      <ChurnStaySubscribed
        uid={uid}
        subscriptionId={subscriptionId}
        locale={locale}
        reason={reason}
        cmsChurnInterventionEntry={cmsChurnInterventionEntry}
        cmsOfferingContent={cmsOfferingContent}
        staySubscribedContent={staySubscribedContent}
      />
    );
  }

  notFound();
}
