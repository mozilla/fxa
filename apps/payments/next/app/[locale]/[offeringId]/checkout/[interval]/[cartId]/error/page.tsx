/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';

import { DEFAULT_LOCALE } from '@fxa/shared/l10n';

import errorIcon from '@fxa/shared/assets/images/error.svg';
import {
  getApp,
  CheckoutParams,
  SupportedPages,
} from '@fxa/payments/ui/server';
import {
  getCartOrRedirectAction,
  recordEmitterEventAction,
} from '@fxa/payments/ui/actions';
import { CartErrorReasonId } from '@fxa/shared/db/mysql/account';

// forces dynamic rendering
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
export const dynamic = 'force-dynamic';

const getErrorReason = (reason: CartErrorReasonId | null) => {
  switch (reason) {
    case 'iap_upgrade_contact_support':
      return {
        buttonFtl: 'next-payment-error-manage-subscription-button',
        buttonLabel: 'Manage my subscription',
        message:
          'You can still get this product — please contact support so we can help you.',
        messageFtl: 'next-iap-upgrade-contact-support',
      };
    default:
      return {
        buttonFtl: 'next-payment-error-retry-button',
        buttonLabel: 'Try again',
        message: 'Something went wrong. Please try again later.',
        messageFtl: 'next-basic-error-message',
      };
  }
};

export default async function CheckoutError(props: {
  params: Promise<CheckoutParams>;
  searchParams: Promise<Record<string, string>>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  // Temporarily defaulting to `accept-language`
  // This to be updated in FXA-9404
  //const locale = getLocaleFromRequest(
  //  params,
  //  headers().get('accept-language')
  //);
  const locale = (await headers()).get('accept-language') || DEFAULT_LOCALE;

  const cartPromise = getCartOrRedirectAction(
    params.cartId,
    SupportedPages.ERROR
  );
  const l10n = getApp().getL10n(locale);
  const [cart] = await Promise.all([cartPromise]);

  recordEmitterEventAction(
    'checkoutFail',
    { ...params },
    searchParams,
    'stripe'
  );

  const errorReason = getErrorReason(cart.errorReasonId);

  return (
    <>
      <section
        className="flex flex-col items-center text-center pb-8 mt-5 desktop:mt-2 h-[640px]"
        aria-label="Payment error"
      >
        <Image src={errorIcon} alt="" className="mt-16 mb-10" />
        <p className="text-grey-400 max-w-sm text-sm px-7 py-0 mb-4 ">
          {l10n.getString(errorReason.messageFtl, errorReason.message)}
        </p>

        <Link
          className="flex items-center justify-center bg-blue-500 hover:bg-blue-700 font-semibold h-12 my-8 rounded-md text-white w-full"
          href={`/${params.offeringId}/checkout?interval=monthly`}
        >
          {l10n.getString(errorReason.buttonFtl, errorReason.buttonLabel)}
        </Link>
      </section>
    </>
  );
}
