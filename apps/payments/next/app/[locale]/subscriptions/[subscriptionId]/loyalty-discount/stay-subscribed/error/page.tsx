/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

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
    redirectToUrl.searchParams.set(
      'redirect_to',
      `/${locale}/subscriptions/${subscriptionId}/loyalty-discount/stay-subscribed/error`
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

  const { churnStaySubscribedEligibility } = pageContent;
  if (churnStaySubscribedEligibility.isEligible) {
    redirect(
      `/${locale}/subscriptions/${subscriptionId}/loyalty-discount/stay-subscribed`
    );
  }

  const { cmsOfferingContent, reason } = churnStaySubscribedEligibility;

  return (
    <ChurnError
      cmsOfferingContent={cmsOfferingContent}
      locale={locale}
      reason={reason ?? 'general_error'}
      pageContent={pageContent.staySubscribedContent}
      subscriptionId={subscriptionId}
    />
  );
}
