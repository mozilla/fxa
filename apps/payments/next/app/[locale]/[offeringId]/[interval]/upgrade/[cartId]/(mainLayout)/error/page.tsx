/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { auth } from 'apps/payments/next/auth';
import errorIcon from '@fxa/shared/assets/images/error.svg';
import {
  getApp,
  CheckoutParams,
  SupportedPages,
  getErrorFtlInfo,
  buildPageMetadata,
} from '@fxa/payments/ui/server';
import { getCartOrRedirectAction } from '@fxa/payments/ui/actions';
import { config } from 'apps/payments/next/config';
import { Metadata } from 'next';
import { buildRedirectUrl, GleanRetentionResult } from '@fxa/payments/ui';
import { redirect } from 'next/navigation';

// forces dynamic rendering
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<CheckoutParams>;
  searchParams: Promise<Record<string, string | string[]> | undefined>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  return buildPageMetadata({
    params: resolvedParams,
    page: 'error',
    pageType: 'upgrade',
    acceptLanguage: (await headers()).get('accept-language'),
    baseUrl: config.paymentsNextHostedUrl,
    searchParams: resolvedSearchParams,
  });
}

export default async function UpgradeError({
  params,
  searchParams,
}: {
  params: Promise<CheckoutParams>;
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { locale } = resolvedParams;
  const acceptLanguage = (await headers()).get('accept-language');

  const sessionPromise = auth();
  const cartPromise = getCartOrRedirectAction(
    resolvedParams.cartId,
    SupportedPages.ERROR,
    resolvedSearchParams
  );
  const l10n = getApp().getL10n(acceptLanguage, locale);
  const [cart, session] = await Promise.all([cartPromise, sessionPromise]);

  const errorReason = getErrorFtlInfo(
    cart.errorReasonId,
    resolvedParams,
    config,
    resolvedSearchParams
  );

  if (cart.id && cart.uid !== session?.user?.id) {
    const redirectSearchParams: Record<string, string | string[]> =
      resolvedSearchParams || {};
    delete redirectSearchParams.cartId;
    delete redirectSearchParams.cartVersion;
    const redirectTo = buildRedirectUrl(
      resolvedParams.offeringId,
      resolvedParams.interval,
      'new',
      'checkout',
      {
        baseUrl: config.paymentsNextHostedUrl,
        locale,
        searchParams: redirectSearchParams,
      }
    );
    redirect(redirectTo);
  }

  const isCancelInterstitialOffer =
    resolvedSearchParams?.['entrypoint'] === 'subscription-management';

  return (
    <>
      {isCancelInterstitialOffer && (
        <GleanRetentionResult
          metricsEnabled={session?.user?.metricsEnabled ?? true}
          eventType="interstitial_offer"
          flowType="cancel"
          eligibilityStatus="offer"
          outcome="error"
          action="upgrade"
          errorReason={cart.errorReasonId ?? 'general_error'}
          offeringId={resolvedParams.offeringId}
          interval={resolvedParams.interval}
        />
      )}
      <section
        className="flex flex-col items-center text-center pb-8 mt-5 desktop:mt-2 h-[640px]"
        aria-labelledby="page-information-heading"
      >
        <Image src={errorIcon} alt="" className="mt-16 mb-10" />
        <h2
          id="page-information-heading"
          className="text-grey-400 max-w-sm text-sm leading-5 px-7 py-0 mb-4 "
        >
          {l10n.getString(errorReason.messageFtl, errorReason.message)}
        </h2>

        {errorReason.buttonUrl && (
          <Link
            className="min-w-[300px] flex items-center justify-center bg-blue-500 hover:bg-blue-700 font-semibold h-12 my-8 rounded-md text-white"
            href={errorReason.buttonUrl}
          >
            {l10n.getString(errorReason.buttonFtl, errorReason.buttonLabel)}
          </Link>
        )}
      </section>
    </>
  );
}
