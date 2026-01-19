/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { SubscriptionParams } from '@fxa/payments/ui';
import { determineStaySubscribedEligibilityAction } from '@fxa/payments/ui/actions';
import { ChurnError } from '@fxa/payments/ui/server';
import { auth } from 'apps/payments/next/auth';
import { config } from 'apps/payments/next/config';

export default async function LoyaltyDiscountStaySubscribedErrorPage({
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
    redirect(redirectToUrl.href);
  }

  const uid = session.user.id;

  const pageContent = await determineStaySubscribedEligibilityAction(
    uid,
    subscriptionId,
    acceptLanguage
  );

  if (!pageContent) {
    notFound();
  }

  const { cmsOfferingContent, reason } = pageContent;

  if (!cmsOfferingContent) {
    notFound();
  }

  const staySubscribedContent = pageContent.staySubscribedContent;

  if (staySubscribedContent.flowType !== 'stay_subscribed') {
    notFound();
  }

  return (
    <ChurnError
      cmsOfferingContent={cmsOfferingContent}
      locale={locale}
      reason={reason}
      pageContent={staySubscribedContent}
      subscriptionId={subscriptionId}
    />
  );
}
