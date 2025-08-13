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
      className="px-4 tablet:px-8"
      data-testid="paypal-payment-management"
      aria-labelledby="paypal-payment-management"
    >
      <div className="flex flex-col items-center text-center pb-8 mt-5 desktop:mt-2 h-[640px]">
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
        <span className={'px-24 leading-6'}>
          {l10n.getString(
            'paypal-payment-management-page-invalid-description',
            'There seems to be an error with your PayPal account, we need you to take the necessary steps to resolve this payment issue.'
          )}
        </span>
        <div className="flex items-center w-2/3 py-10">
          <hr
            className="border-b border-grey-100 my-6 grow"
            aria-hidden="true"
          />
          <span className="flex-none px-4">
            {l10n.getString('next-pay-with-heading-paypal', 'Pay with PayPal')}
          </span>
          <hr
            className="border-b border-grey-100 my-6 grow"
            aria-hidden="true"
          />
        </div>
        <PaypalManagement
          sessionUid={sessionUid}
          paypalClientId={'sb'}
          nonce={nonce}
          currency={currency}
        />
      </div>
    </section>
  );
}
