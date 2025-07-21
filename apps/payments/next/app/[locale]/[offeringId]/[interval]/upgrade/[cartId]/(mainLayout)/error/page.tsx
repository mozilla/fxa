/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';

import errorIcon from '@fxa/shared/assets/images/error.svg';
import {
  getApp,
  CheckoutParams,
  SupportedPages,
  getErrorFtlInfo,
  buildPageMetadata,
} from '@fxa/payments/ui/server';
import {
  getCartOrRedirectAction,
  recordEmitterEventAction,
} from '@fxa/payments/ui/actions';
import { config } from 'apps/payments/next/config';
import { Metadata } from 'next';

// forces dynamic rendering
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: CheckoutParams;
  searchParams: Record<string, string | string[]> | undefined;
}): Promise<Metadata> {
  return buildPageMetadata({
    params,
    page: 'error',
    pageType: 'upgrade',
    acceptLanguage: headers().get('accept-language'),
    baseUrl: config.paymentsNextHostedUrl,
    searchParams,
  });
}

export default async function UpgradeError({
  params,
  searchParams,
}: {
  params: CheckoutParams;
  searchParams: Record<string, string | string[]>;
}) {
  const { locale } = params;
  const acceptLanguage = headers().get('accept-language');

  const cartPromise = getCartOrRedirectAction(
    params.cartId,
    SupportedPages.ERROR,
    searchParams
  );
  const l10n = getApp().getL10n(acceptLanguage, locale);
  const [cart] = await Promise.all([cartPromise]);

  recordEmitterEventAction(
    'checkoutFail',
    { ...params },
    searchParams,
    cart.paymentInfo?.type
  );

  const errorReason = getErrorFtlInfo(cart.errorReasonId, params, config);

  return (
    <>
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
