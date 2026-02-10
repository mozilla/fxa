/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { ChurnCancel, SubscriptionParams } from '@fxa/payments/ui';
import { determineChurnCancelEligibilityAction } from '@fxa/payments/ui/actions';
import { auth } from 'apps/payments/next/auth';
import { config } from 'apps/payments/next/config';

export default async function LoyaltyDiscountCancelPage({
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

  const session = await auth();
  if (!session?.user?.id) {
    const redirectToUrl = new URL(
      `${config.paymentsNextHostedUrl}/${locale}/subscriptions/landing`
    );
    redirectToUrl.search = new URLSearchParams(searchParams).toString();
    redirectToUrl.searchParams.set(
      'redirect_to',
      `/${locale}/subscriptions/${subscriptionId}/loyalty-discount/cancel`
    );
    redirect(redirectToUrl.href);
  }

  const uid = session.user.id;

  const pageContent = await determineChurnCancelEligibilityAction(
    uid,
    subscriptionId,
    acceptLanguage
  );

  if (!pageContent) notFound();

  const { churnCancelContentEligibility, cancelContent } = pageContent;
  const { cmsOfferingContent, reason, cmsChurnInterventionEntry } =
    churnCancelContentEligibility;
  const reasonStr = typeof reason === 'string' ? reason : undefined;
  const isAllowedCancelReason =
    reasonStr === 'eligible' || reasonStr === 'discount_already_applied';

  if (!isAllowedCancelReason) {
    redirect(
      `/${locale}/subscriptions/${subscriptionId}/loyalty-discount/cancel/error`
    );
  }

  if (!cancelContent || cancelContent.flowType !== 'cancel') {
    redirect(
      `/${locale}/subscriptions/${subscriptionId}/loyalty-discount/cancel/error`
    );
  }

  if (!cmsChurnInterventionEntry) {
    redirect(
      `/${locale}/subscriptions/${subscriptionId}/loyalty-discount/cancel/error`
    );
  }

  return (
    <ChurnCancel
      uid={uid}
      subscriptionId={subscriptionId}
      locale={locale}
      reason={reason}
      cmsChurnInterventionEntry={cmsChurnInterventionEntry}
      cmsOfferingContent={cmsOfferingContent}
      cancelContent={cancelContent}
    />
  );
}
