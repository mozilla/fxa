/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';

import errorIcon from '@fxa/shared/assets/images/error.svg';
import checkIcon from '@fxa/shared/assets/images/check.svg';
import {
  getApp,
  CheckoutParams,
  SupportedPages,
  getErrorFtlInfo,
} from '@fxa/payments/ui/server';
import {
  getCartOrRedirectAction,
  recordEmitterEventAction,
} from '@fxa/payments/ui/actions';
import { config } from 'apps/payments/next/config';
import type { Metadata } from 'next';
import { CartErrorReasonId } from '@fxa/shared/db/mysql/account';

// forces dynamic rendering
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Error',
  description:
    'There was an error processing your subscription. If this problem persists, please contact support.',
};

export default async function CheckoutError({
  params,
  searchParams,
}: {
  params: CheckoutParams;
  searchParams: Record<string, string>;
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
        aria-label="Payment error"
      >
        {
          // Once more conditionals are added, move this to a separate component
          cart.errorReasonId === CartErrorReasonId.CartEligibilityStatusSame ? (
            <Image
              src={checkIcon}
              alt="check-icon"
              className="h-20 w-20 mt-16 mb-10"
            />
          ) : (
            <Image
              src={errorIcon}
              alt="error-icon"
              className="h-20 w-20 mt-16 mb-10"
            />
          )
        }
        <p className="text-grey-400 max-w-sm text-sm px-7 py-0 mb-4 ">
          {l10n.getString(errorReason.messageFtl, errorReason.message)}
        </p>

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
