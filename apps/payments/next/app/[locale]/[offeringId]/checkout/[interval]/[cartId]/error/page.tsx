/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';

import { DEFAULT_LOCALE } from '@fxa/shared/l10n';

import errorIcon from '@fxa/shared/assets/images/error.svg';
import {
  SupportedPages,
  app,
  getCartOrRedirectAction,
} from '@fxa/payments/ui/server';
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

interface CheckoutParams {
  cartId: string;
  locale: string;
  interval: string;
  offeringId: string;
}

export default async function CheckoutError({
  params,
}: {
  params: CheckoutParams;
}) {
  // Temporarily defaulting to `accept-language`
  // This to be updated in FXA-9404
  //const locale = getLocaleFromRequest(
  //  params,
  //  headers().get('accept-language')
  //);
  const locale = headers().get('accept-language') || DEFAULT_LOCALE;

  const cartPromise = getCartOrRedirectAction(
    params.cartId,
    SupportedPages.ERROR
  );
  const l10nPromise = app.getL10n(locale);
  const [cart, l10n] = await Promise.all([cartPromise, l10nPromise]);

  const errorReason = getErrorReason(cart.errorReasonId);

  return (
    <>
      <section
        className="page-message-container h-[640px]"
        aria-label="Payment error"
      >
        <Image src={errorIcon} alt="" className="mt-16 mb-10" />
        <p className="page-message px-7 py-0 mb-4 ">
          {l10n.getString(errorReason.messageFtl, errorReason.message)}
        </p>

        <Link
          className="page-button"
          href={`/${params.offeringId}/checkout?interval=monthly`}
        >
          {l10n.getString(errorReason.buttonFtl, errorReason.buttonLabel)}
        </Link>
      </section>
    </>
  );
}
