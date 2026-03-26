/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { InterstitialOffer } from '@fxa/payments/ui';
import { getInterstitialOfferContentAction } from '@fxa/payments/ui/actions';
import { auth } from 'apps/payments/next/auth';
import { config } from 'apps/payments/next/config';

export default async function InterstitialOfferPage({
  params,
  searchParams,
}: {
  params: Promise<{
    locale: string;
    subscriptionId: string;
  }>;
  searchParams: Promise<Record<string, string> | undefined>;
}) {
  const { locale, subscriptionId } = await params;
  const resolvedSearchParams = await searchParams;

  if (!config.churnInterventionConfig.enabled) {
    redirect(`/${locale}/subscriptions/landing`);
  }

  const acceptLanguage = (await headers()).get('accept-language');
  const session = await auth();
  if (!session?.user?.id) {
    const redirectToUrl = new URL(
      `${config.paymentsNextHostedUrl}/${locale}/subscriptions/landing`
    );
    redirectToUrl.search = new URLSearchParams(resolvedSearchParams).toString();
    redirectToUrl.searchParams.set(
      'redirect_to',
      `/${locale}/subscriptions/${subscriptionId}/offer`
    );
    redirect(redirectToUrl.href);
  }

  const uid = session.user.id;

  let interstitialOfferContent;
  try {
    interstitialOfferContent = await getInterstitialOfferContentAction(
      uid,
      subscriptionId,
      acceptLanguage,
      locale
    );
  } catch (error) {
    redirect(`/${locale}/subscriptions/${subscriptionId}/offer/error`);
  }

  if (interstitialOfferContent.cancelContent.flowType === 'not_found') {
    redirect(`/${locale}/subscriptions/${subscriptionId}/offer/error`);
  }

  const hasOffer = !!interstitialOfferContent.pageContent;
  const cancelAtPeriodEnd =
    !!interstitialOfferContent.cancelContent.cancelAtPeriodEnd;

  if (!hasOffer && !cancelAtPeriodEnd) {
    redirect(`/${locale}/subscriptions/${subscriptionId}/offer/error`);
  }

  const searchParamsObj = {
    ...resolvedSearchParams,
    entrypoint: 'subscription-management',
  };

  return (
    <InterstitialOffer
      uid={uid}
      metricsEnabled={session?.user?.metricsEnabled ?? true}
      locale={locale}
      subscriptionId={subscriptionId}
      pageContent={interstitialOfferContent.pageContent}
      cancelContent={interstitialOfferContent.cancelContent}
      searchParams={searchParamsObj}
    />
  );
}
