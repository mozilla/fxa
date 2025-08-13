/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import {
  PayPalButtons,
  PayPalScriptProvider,
  ReactPayPalScriptOptions,
} from '@paypal/react-paypal-js';
import {
  createPayPalBillingAgreementId,
  getPayPalCheckoutToken,
} from '@fxa/payments/ui/actions';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import spinnerImage from '@fxa/shared/assets/images/spinner.svg';

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
  const router = useRouter();
  const { locale } = useParams();
  const searchParams = useSearchParams();
  const queryParamString = searchParams.toString()
    ? `?${searchParams.toString()}`
    : '';

  const [isLoading, setLoading] = useState<boolean>(true);

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
      <div className="flex justify-center w-full">
        {isLoading && (
          <Image
            src={spinnerImage}
            alt=""
            className="absolute animate-spin h-8 w-8"
          />
        )}
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
          onInit={() => setLoading(false)}
        />
      </div>
    </PayPalScriptProvider>
  );
}
