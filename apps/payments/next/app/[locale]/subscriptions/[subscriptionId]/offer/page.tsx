/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getApp } from '@fxa/payments/ui/server';
import { getInterstitialOfferContentAction } from '@fxa/payments/ui/actions';
import { auth } from 'apps/payments/next/auth';
import { config } from 'apps/payments/next/config';
import Image from 'next/image';
import Link from 'next/link';

export default async function InterstitialOfferPage({
  params,
  searchParams,
}: {
  params: {
    locale: string;
    subscriptionId: string;
  };
  searchParams: Record<string, string> | undefined;
}) {
  const { locale, subscriptionId } = params;

  if (!config.churnInterventionConfig.enabled) {
    redirect(`/${locale}/subscriptions/landing`);
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

  if (!interstitialOfferContent.isEligible || !interstitialOfferContent.pageContent) {
    redirect(`/${locale}/subscriptions/${subscriptionId}/offer/error`);
  }

  const {
    currentInterval,
    modalHeading1,
    modalMessage,
    upgradeButtonLabel,
    upgradeButtonUrl,
    webIcon,
    productName,
  } = interstitialOfferContent.pageContent;

  const getKeepCurrentSubscriptionFtlIds = (interval: string) => {
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
      default:
        return {
          ftlId: 'interstitial-offer-button-keep-current-interval-monthly',
          fallbackText: 'Keep monthly subscription',
        };
    }
  };

  const { ftlId, fallbackText } = getKeepCurrentSubscriptionFtlIds(currentInterval);
  const keepCurrentSubscriptionButtonText = l10n.getString(ftlId, fallbackText);

  return (
    <section
      className="flex justify-center min-h-[calc(100vh_-_4rem)] tablet:items-center tablet:min-h-[calc(100vh_-_5rem)]"
    >
        <div className="w-full max-w-[480px] flex flex-col justify-center items-center p-10 tablet:bg-white tablet:rounded-xl tablet:border tablet:border-grey-200 tablet:shadow-[0_0_16px_0_rgba(0,0,0,0.08)]">
          <div className="w-full flex flex-col items-center gap-6 text-center">
            <Image
              src={webIcon}
              alt={productName}
              height={64}
              width={64}
            />
            <h1 className="font-bold self-stretch text-center font-header text-xl leading-8 ">
              {modalHeading1}
            </h1>
          </div>
            <p className="w-full self-stretch leading-7 text-lg text-grey-900">
              {modalMessage &&
                modalMessage.map((line, i) => (
                  <p className="my-2" key={i}>
                    {line}
                  </p>
                ))}
            </p>

          <div className="w-full flex flex-col gap-3 mt-12">
            <Link
              className="border box-border font-header h-14 items-center justify-center rounded-md text-white text-center font-bold py-4 px-6 bg-blue-500 hover:bg-blue-700 flex w-full"
              href={upgradeButtonUrl}
            >
              {upgradeButtonLabel}
            </Link>
            <Link
              className="border box-border font-header h-14 items-center justify-center rounded-md text-center font-bold py-4 px-6 bg-grey-10 border-grey-200 hover:bg-grey-50 flex w-full"
              href={`/${locale}/subscriptions/landing`}
            >
              <span>{keepCurrentSubscriptionButtonText}</span>
            </Link>
            <Link
              className="border box-border font-header h-14 items-center justify-center rounded-md text-center font-bold py-4 px-6 bg-grey-10 border-grey-200 hover:bg-grey-50 flex w-full"
              href={`/${locale}/subscriptions/${subscriptionId}/cancel`}
            >
              <span>{l10n.getString(
                'interstitial-offer-button-cancel-subscription',
                'Continue to cancel'
              )}</span>
            </Link>
          </div>
        </div>
    </section>
  );
}
