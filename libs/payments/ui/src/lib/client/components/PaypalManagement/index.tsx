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
import { LinkExternal } from '@fxa/shared/react';
import { Localized } from '@fluent/react';

const paypalInitialOptions: ReactPayPalScriptOptions = {
  clientId: '',
  vault: true,
  commit: false,
  intent: 'capture',
  disableFunding: ['credit', 'card'],
};

interface PaypalManagementProps {
  paypalCspUrl: string;
  nonce?: string;
  paypalClientId: string;
  sessionUid: string;
  paypalBillingAgreementId?: string;
}

export function PaypalManagement({
  paypalCspUrl,
  nonce,
  paypalClientId,
  sessionUid,
  paypalBillingAgreementId
}: PaypalManagementProps) {

  console.log('paypalBillingAgreementId', paypalBillingAgreementId)
  return (
    <PayPalScriptProvider
      options={{
        ...paypalInitialOptions,
        clientId: paypalClientId,
        dataCspNonce: nonce,
      }}
    >
      {paypalBillingAgreementId ? (
        <LinkExternal
          className={
            "flex items-center justify-center h-10 rounded-md p-4 z-10 cursor-pointer aria-disabled:relative aria-disabled:after:absolute aria-disabled:after:content-[''] aria-disabled:after:top-0 aria-disabled:after:left-0 aria-disabled:after:w-full aria-disabled:after:h-full aria-disabled:after:bg-white aria-disabled:after:opacity-50 aria-disabled:after:z-30 aria-disabled:border-none bg-grey-100 font-semibold hover:bg-grey-200 text-black"
          }
          // href={`${config.csp.paypalApi}/myaccount/autopay/connect/${paypalBillingAgreementId}`}
          href={`${paypalCspUrl}/myaccount/autopay/connect/${paypalBillingAgreementId}`}
        >
          <Localized id="subscription-management-button-change-payment-method">
            Change
          </Localized>
        </LinkExternal>
      ) : (
        <PayPalButtons
          style={{
            layout: 'horizontal',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 48,
            borderRadius: 6, // This should match 0.375rem
            tagline: false,
          }}
          className="mt-6 flex justify-center w-full"
          createOrder={async () => getPayPalCheckoutToken('usd')}
          onApprove={async (data: { orderID: string }) => {
            createPayPalBillingAgreementId(
              sessionUid,
              data.orderID
            );
            // await checkoutCartWithPaypal(
            //   cart.id,
            //   cart.version,
            //   {
            //     locale,
            //     displayName: '',
            //   },
            //   getAttributionParams(searchParams),
            //   sessionUid,
            //   data.orderID
            // );
            // const queryParamString = searchParams.toString()
            //   ? `?${searchParams.toString()}`
            //   : '';
            // router.push('./processing' + queryParamString);
          }}
          onError={async () => {
            console.error('oh no!');
          }}
        />
      )}
    </PayPalScriptProvider>
  );
}
