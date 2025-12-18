/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import {
  PayPalButtons,
  PayPalScriptProvider,
  ReactPayPalScriptOptions,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';
import {
  createPayPalBillingAgreementId,
  getPayPalCheckoutToken,
} from '@fxa/payments/ui/actions';
import { useParams, useRouter, useSearchParams, type ReadonlyURLSearchParams } from 'next/navigation';
import Image from 'next/image';
import spinnerImage from '@fxa/shared/assets/images/spinner.svg';
import { Localized } from '@fluent/react';
import * as Sentry from '@sentry/nextjs';

const paypalInitialOptions: ReactPayPalScriptOptions = {
  clientId: '',
  vault: true,
  commit: false,
  intent: 'capture',
  disableFunding: ['credit', 'card'],
};

interface PaypalManagementProps {
  nonce?: string;
  paypalClientId: string;
  sessionUid: string;
  currency: string;
}

export function PaypalManagement({
  nonce,
  paypalClientId,
  sessionUid,
  currency,
}: PaypalManagementProps) {
  const { locale } = useParams();
  const searchParams = useSearchParams();

  return (
    <PayPalScriptProvider
      options={{
        ...paypalInitialOptions,
        clientId: paypalClientId,
        dataCspNonce: nonce,
        dataNamespace: 'paypal_management',
        components: 'buttons',
      }}
    >
      <div className="flex justify-center items-center max-w-md w-full h-12">
        <ManagementPayPalButton
          currency={currency}
          locale={Array.isArray(locale) ? locale[0] : locale}
          sessionUid={sessionUid}
          searchParams={searchParams}
        />
      </div>
    </PayPalScriptProvider>
  );
}

interface ManagementPayPalButtonProps {
  currency: string;
  locale: string;
  sessionUid: string;
  searchParams: ReadonlyURLSearchParams;
}

function ManagementPayPalButton({
  currency,
  locale,
  sessionUid,
  searchParams,
}: ManagementPayPalButtonProps) {
  const router = useRouter();
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  const queryParamString = searchParams.toString()
    ? `?${searchParams.toString()}`
    : '';

  if (isPending) {
    return (
      <Image
        src={spinnerImage}
        alt=""
        className="absolute animate-spin h-8 w-8"
      />
    )
  }

  if (isRejected) {
    Sentry.captureMessage('PayPal script failed to load');
    return (
      <Localized id="paypal-unavailable-error">
        <div className="mt-6 flex justify-center w-full text-center text-sm">PayPal is currently unavailable. Please use another payment option or try again later.</div>
      </Localized>
    )
  }

  return (
    <PayPalButtons
      style={{
        layout: 'horizontal',
        color: 'gold',
        shape: 'rect',
        label: 'paypal',
        height: 48,
        borderRadius: 6,
        tagline: false,
      }}
      className="flex justify-center w-full"
      createOrder={async () =>
        getPayPalCheckoutToken(currency.toLowerCase())
      }
      onApprove={async (data: { orderID: string }) => {
        await createPayPalBillingAgreementId(sessionUid, data.orderID);
        router.push(`/${locale}/subscriptions/manage` + queryParamString);
      }}
      onError={(error) => {
        throw error;
      }}
    />
  )
}
