/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getApp } from '@fxa/payments/ui/server';
import { getInterstitialOfferContentAction } from '@fxa/payments/ui/actions';
import { LinkExternal } from '@fxa/shared/react';
import { auth } from 'apps/payments/next/auth';
import { config } from 'apps/payments/next/config';

export default async function InterstitialOfferErrorPage({
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
  const session = await auth();
  if (!session?.user?.id) {
    const redirectToUrl = new URL(
      `${config.paymentsNextHostedUrl}/${locale}/subscriptions/landing`
    );
    redirectToUrl.search = new URLSearchParams(searchParams).toString();
    redirectToUrl.searchParams.set(
      'redirect_to',
      `/${locale}/subscriptions/${subscriptionId}/offer/error`
    );
    redirect(redirectToUrl.href);
  }

  const uid = session.user.id;

  let interstitialOfferContent;
  let reason = 'general_error';
  try {
    interstitialOfferContent = await getInterstitialOfferContentAction(
      uid,
      subscriptionId,
      acceptLanguage,
      locale
    );
    reason = interstitialOfferContent?.reason ?? 'general_error';
  } catch (error) {
    interstitialOfferContent = null;
    reason = 'general_error';
  }

 const webIcon = interstitialOfferContent?.webIcon;
 const productName = interstitialOfferContent?.productName;

 if (webIcon && !productName) {
   console.error('Missing productName for interstitial offer icon');
   reason = 'general_error';
 }

 if (
   interstitialOfferContent?.isEligible &&
   interstitialOfferContent?.pageContent
 ) {
   redirect(`/${locale}/subscriptions/${subscriptionId}/offer`);
 }

  const l10n = getApp().getL10n(acceptLanguage, locale);

  const getErrorContent = (reason: string) => {
    switch (reason) {
      case 'subscription_not_active':
      case 'subscription_not_found':
        return {
          heading: l10n.getString(
            'interstitial-offer-error-subscription-not-found-heading',
            'We couldn’t find an active subscription'
          ),
          message: l10n.getString(
            'interstitial-offer-error-subscription-not-found-message',
            'It looks like this subscription may no longer be active.'
          ),
          primaryButton: {
            label: l10n.getString(
              'interstitial-offer-error-button-back-to-subscriptions',
              'Back to subscriptions'
            ),
            href: `/${locale}/subscriptions/landing`,
          },
          secondaryButton: null,
        };
      case 'customer_mismatch':
        return {
          heading: l10n.getString(
            'interstitial-offer-error-customer-mismatch-heading',
            'This subscription is not associated with your account'
          ),
          message: l10n.getString(
            'interstitial-offer-error-customer-mismatch-message',
            'Make sure you are signed in with the correct account, or contact Support if you need help.'
          ),
          primaryButton: {
            label: l10n.getString(
              'interstitial-offer-error-button-sign-in',
              'Sign in'
            ),
            href: `/${locale}/subscriptions/landing`,
          },
          secondaryButton: {
            label: l10n.getString(
              'interstitial-offer-error-button-contact-support',
              'Contact Support'
            ),
            href: 'https://support.mozilla.org/',
            isExternal: true,
          },
        };
      default:
        return {
          heading: l10n.getString(
            'interstitial-offer-error-general-heading',
            'Offer isn’t available'
          ),
          message: l10n.getString(
            'interstitial-offer-error-general-message',
            'It looks like this offer is not available at this time.'
          ),
          primaryButton: {
            label: l10n.getString(
              'interstitial-offer-error-button-back-to-subscriptions',
              'Back to subscriptions'
            ),
            href: `/${locale}/subscriptions/landing`,
          },
          secondaryButton: {
            label: l10n.getString(
              'interstitial-offer-error-button-cancel-subscription',
              'Continue to cancel'
            ),
            href: `/${locale}/subscriptions/${subscriptionId}/cancel`,
            isExternal: false,
          },
        };
    }
  };

  const { heading, message, primaryButton, secondaryButton } = getErrorContent(reason);

  return (
    <section
      className="flex justify-center min-h-[calc(100vh_-_4rem)] tablet:items-center tablet:min-h-[calc(100vh_-_5rem)]"
      aria-labelledby="error-heading"
    >
      <div className="w-full max-w-[480px] flex flex-col justify-center items-center p-10 tablet:bg-white tablet:rounded-xl tablet:border tablet:border-grey-200 tablet:shadow-[0_0_16px_0_rgba(0,0,0,0.08)]">
        <div className="w-full flex flex-col items-center gap-6 text-center">
          {webIcon && (
            <Image
              src={webIcon}
              alt={productName ?? ''}
              height={64}
              width={64}
            />
          )}
          <h1
            id="error-heading"
            className="font-bold self-stretch text-center font-header text-xl leading-8"
          >
            {heading}
          </h1>
          <p className="w-full self-stretch leading-7 text-lg text-grey-900 text-center tablet:text-start">
            {message}
          </p>
        </div>
        <div className="w-full flex flex-col gap-3 mt-10">
          <Link
            className="border box-border font-header h-14 items-center justify-center rounded-md text-white text-center font-bold py-4 px-6 bg-blue-500 hover:bg-blue-700 flex w-full"
            href={primaryButton.href}
          >
            {primaryButton.label}
          </Link>
          {secondaryButton && (
            secondaryButton.isExternal ? (
              <LinkExternal
                className="border box-border font-header h-14 items-center justify-center rounded-md text-center font-bold py-4 px-6 bg-grey-10 border-grey-200 hover:bg-grey-50 flex w-full"
                href={secondaryButton.href}
              >
                {secondaryButton.label}
              </LinkExternal>
            ) : (
              <Link
                className="border box-border font-header h-14 items-center justify-center rounded-md text-center font-bold py-4 px-6 bg-grey-10 border-grey-200 hover:bg-grey-50 flex w-full"
                href={secondaryButton.href}
              >
                <span>{secondaryButton.label}</span>
              </Link>
            )
          )}
        </div>
      </div>
    </section>
  );
}
