/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { auth } from 'apps/payments/next/auth';
import errorIcon from '@fxa/shared/assets/images/error.svg';
import checkIcon from '@fxa/shared/assets/images/check.svg';
import {
  getApp,
  CheckoutParams,
  SupportedPages,
  getErrorFtlInfo,
  buildPageMetadata,
} from '@fxa/payments/ui/server';
import { getCartOrRedirectAction } from '@fxa/payments/ui/actions';
import { config } from 'apps/payments/next/config';
import type { Metadata } from 'next';
import { CartErrorReasonId } from '@fxa/shared/db/mysql/account';
import { buildRedirectUrl } from '@fxa/payments/ui';
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
    pageType: 'checkout',
    acceptLanguage: (await headers()).get('accept-language'),
    baseUrl: config.paymentsNextHostedUrl,
    searchParams: resolvedSearchParams,
  });
}

export default async function CheckoutError({
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

  return (
    <>
      <section
        className="flex flex-col items-center text-center pb-8 mt-5 desktop:mt-2 h-[640px]"
        aria-labelledby="page-information-heading"
      >
        {
          // Once more conditionals are added, move this to a separate component
          cart.errorReasonId ===
          CartErrorReasonId.CART_ELIGIBILITY_STATUS_SAME ? (
            <Image
              src={checkIcon}
              alt=""
              aria-hidden="true"
              className="h-20 w-20 mt-16 mb-10"
            />
          ) : (
            <Image
              src={errorIcon}
              alt=""
              aria-hidden="true"
              className="h-20 w-20 mt-16 mb-10"
            />
          )
        }
        <h2
          id="page-information-heading"
          className="text-grey-400 max-w-sm text-sm leading-5 px-7 py-0 mb-4 "
        >
          {l10n.getString(errorReason.messageFtl, errorReason.message)}
        </h2>

        {errorReason.buttonUrl && (
          <Link
            className="flex items-center justify-center bg-blue-500 hover:bg-blue-700 font-semibold h-12 my-8 rounded-md text-white w-full"
            href={errorReason.buttonUrl}
          >
            {l10n.getString(errorReason.buttonFtl, errorReason.buttonLabel)}
          </Link>
        )}
      </section>
    </>
  );
}
