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
} from '@fxa/payments/ui/server';
import {
  getCartOrRedirectAction,
  recordEmitterEventAction,
} from '@fxa/payments/ui/actions';
import { CartErrorReasonId } from '@fxa/shared/db/mysql/account';
import { config } from 'apps/payments/next/config';
import { Metadata } from 'next';

// forces dynamic rendering
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Error',
  description:
    'There was an error processing your upgrade. If this problem persists, please contact support.',
};

const getErrorReason = (
  reason: CartErrorReasonId | null,
  params: CheckoutParams
) => {
  switch (reason) {
    case 'cart_eligibility_status_downgrade':
      return {
        buttonFtl: 'checkout-error-contact-support-button',
        buttonLabel: 'Contact Support',
        buttonUrl: config.supportUrl,
        message: 'Please contact support so we can help you.',
        messageFtl: 'checkout-error-contact-support',
      };
    case 'cart_eligibility_status_invalid':
      return {
        buttonFtl: 'checkout-error-contact-support-button',
        buttonLabel: 'Contact Support',
        buttonUrl: config.supportUrl,
        message:
          'You are not eligible to subscribe to this product - please contact support so we can help you.',
        messageFtl: 'checkout-error-not-eligible',
      };
    case 'iap_upgrade_contact_support':
      return {
        buttonFtl: 'next-payment-error-manage-subscription-button',
        buttonLabel: 'Manage my subscription',
        buttonUrl: `${config.contentServerUrl}/subscriptions`,
        message:
          'You can still get this product — please contact support so we can help you.',
        messageFtl: 'next-iap-upgrade-contact-support',
      };
    default:
      return {
        buttonFtl: 'next-payment-error-retry-button',
        buttonLabel: 'Try again',
        buttonUrl: `/${params.locale}/${params.offeringId}/${params.interval}/landing`,
        message: 'Something went wrong. Please try again later.',
        messageFtl: 'next-basic-error-message',
      };
  }
};

export default async function UpgradeError({
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

  const errorReason = getErrorReason(cart.errorReasonId, params);

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
