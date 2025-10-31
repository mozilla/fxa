/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { ManageParams } from '@fxa/payments/ui';
import { auth } from 'apps/payments/next/auth';
import { config } from 'apps/payments/next/config';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { PaypalManagement } from '@fxa/payments/ui';
import {
  determineCurrencyForCustomerAction,
  getPayPalBillingAgreementId,
} from '@fxa/payments/ui/actions';
import { getApp } from '@fxa/payments/ui/server';
import Image from 'next/image';
import errorIcon from '@fxa/shared/assets/images/error.svg';

export default async function PaypalPaymentManagementPage({
  params,
  searchParams,
}: {
  params: ManageParams;
  searchParams: Record<string, string | string[]> | undefined;
}) {
  const acceptLanguage = headers().get('accept-language');
  const l10n = getApp().getL10n(acceptLanguage);
  const session = await auth();
  const { locale } = params;

  const nonce = headers().get('x-nonce') || undefined;
  if (!session?.user?.id) {
    redirect(`${config.paymentsNextHostedUrl}/${locale}/subscriptions/landing`);
  }
  const sessionUid = session.user.id;
  const [paypalBillingAgreementId, currency] = await Promise.all([
    getPayPalBillingAgreementId(session.user.id),
    determineCurrencyForCustomerAction(session.user.id),
  ]);

  if (paypalBillingAgreementId || !currency) {
    redirect(`${config.paymentsNextHostedUrl}/${locale}/subscriptions/landing`);
  }

  return (
    <section
      className="w-full tablet:px-8 desktop:max-w-[1024px]"
      data-testid="paypal-payment-management"
      aria-labelledby="paypal-payment-management"
    >
      <h1
        className="font-bold leading-6 mt-8 px-4 pb-4 text-xl tablet:px-6"
        id="paypal-payment-management"
      >
        {l10n.getString(
          'manage-payment-methods-heading',
          'Manage payment methods'
        )}
      </h1>
      <div className="w-full py-6 text-grey-600 bg-white rounded-xl border border-grey-200 opacity-100 shadow-[0_0_16px_0_rgba(0,0,0,0.08)] tablet:px-6 tablet:py-8">
        <div className="flex flex-col items-center text-center">
          <Image
            src={errorIcon}
            alt=""
            className="h-10 w-10"
            aria-hidden="true"
          />
          <h2 className="font-semibold text-grey-600 text-xl my-5">
            {l10n.getString(
              'paypal-payment-management-page-invalid-header',
              'Invalid billing information'
            )}
          </h2>
          <span className="px-12 tablet:px-24 leading-6">
            {l10n.getString(
              'paypal-payment-management-page-invalid-description',
              'There seems to be an error with your PayPal account, we need you to take the necessary steps to resolve this payment issue.'
            )}
          </span>
          <div className="flex items-center w-2/3 py-5">
            <div
              className="border-b border-grey-100 my-6 grow"
              role="presentation"
              aria-hidden="true"
            ></div>
            <span className="flex-none px-4">
              {l10n.getString(
                'next-pay-with-heading-paypal',
                'Pay with PayPal'
              )}
            </span>
            <div
              className="border-b border-grey-100 my-6 grow"
              role="presentation"
              aria-hidden="true"
            ></div>
          </div>
          <PaypalManagement
            sessionUid={sessionUid}
            paypalClientId={'sb'}
            nonce={nonce}
            currency={currency}
          />
        </div>
      </div>
    </section>
  );
}
