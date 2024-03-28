/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';

import { getBundle, getLocaleFromRequest } from '@fxa/shared/l10n';

import { getCartData } from '../../../../../../_lib/apiClient';
import errorIcon from '../../../../../../../images/error.svg';

// forces dynamic rendering
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
export const dynamic = 'force-dynamic';

// Temporary code for demo purposes only - Replaced as part of FXA-8822
const demoSupportedLanguages = ['en-US', 'fr-FR', 'es-ES', 'de-DE'];

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
  const headersList = headers();
  const locale = getLocaleFromRequest(
    params,
    headersList.get('accept-language'),
    demoSupportedLanguages
  );

  const cartData = getCartData(params.cartId);
  const [cart] = await Promise.all([cartData]);
  /* eslint-disable @typescript-eslint/no-unused-vars */
  // const cartService = await app.getCartService();

  const l10n = await getBundle([locale]);

  const getErrorReason = (reason: string) => {
    switch (reason) {
      case 'iap_upgrade_contact_support':
        return {
          buttonFtl: 'payment-error-manage-subscription-button',
          buttonLabel: 'Manage my subscription',
          message:
            'You can still get this product — please contact support so we can help you.',
          messageFtl: 'iap-upgrade-contact-support',
        };
      default:
        return {
          buttonFtl: 'payment-error-retry-button',
          buttonLabel: 'Try again',
          message: 'Something went wrong. Please try again later.',
          messageFtl: 'basic-error-message',
        };
    }
  };

  return (
    <>
      <section
        className="page-message-container h-[640px]"
        aria-label="Payment error"
      >
        <Image src={errorIcon} alt="" className="mt-16 mb-10" />
        <p className="page-message px-7 py-0 mb-4 ">
          {l10n
            .getMessage(getErrorReason(cart.errorReasonId).messageFtl)
            ?.value?.toString() || getErrorReason(cart.errorReasonId).message}
        </p>

        <Link
          className="page-button"
          href={`/${params.offeringId}/checkout?interval=monthly`}
        >
          {l10n
            .getMessage(getErrorReason(cart.errorReasonId).buttonFtl)
            ?.value?.toString() ||
            getErrorReason(cart.errorReasonId).buttonLabel}
        </Link>
      </section>
    </>
  );
}
