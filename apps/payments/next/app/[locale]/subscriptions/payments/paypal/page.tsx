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
import { getPayPalBillingAgreementId } from '@fxa/payments/ui/actions';

export default async function PaypalPaymentManagementPage({
  params,
  searchParams,
}: {
  params: ManageParams;
  searchParams: Record<string, string | string[]> | undefined;
}) {
  const session = await auth();
  const { locale } = params;
  const nonce = headers().get('x-nonce') || undefined;
  if (!session?.user?.id) {
    redirect(`${config.paymentsNextHostedUrl}/${locale}/subscriptions/landing`);
  }
  const { paypalBillingAgreementId } = await getPayPalBillingAgreementId(
    session.user.id
  );

  return (
    <section
      className="px-4 tablet:px-8"
      data-testid="paypal-payment-management"
      aria-labelledby="paypal-payment-management"
    >
      <PaypalManagement
        paypalCspUrl={config.csp.paypalApi}
        sessionUid={session.user.id}
        paypalClientId={config.paypal.clientId}
        nonce={nonce}
        paypalBillingAgreementId={paypalBillingAgreementId}
      />
      {/* {paypalBillingAgreementId ? (
        <LinkExternal
          className={
            "flex items-center justify-center h-10 rounded-md p-4 z-10 cursor-pointer aria-disabled:relative aria-disabled:after:absolute aria-disabled:after:content-[''] aria-disabled:after:top-0 aria-disabled:after:left-0 aria-disabled:after:w-full aria-disabled:after:h-full aria-disabled:after:bg-white aria-disabled:after:opacity-50 aria-disabled:after:z-30 aria-disabled:border-none bg-grey-100 font-semibold hover:bg-grey-200 text-black"
          }
          href={`${config.csp.paypalApi}/myaccount/autopay/connect/${paypalBillingAgreementId}`}
          aria-label={l10n.getString(
            'subscription-management-button-change-payment-method-aria',
            'Change payment method'
          )}
        >
          <span>
            {l10n.getString(
              'subscription-management-button-change-payment-method',
              'Change'
            )}
          </span>
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
              session?.user?.id ?? '',
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
            console.error('oh no!')
          }}
        />
      )} */}
    </section>
  );
}

{
  /* <PayPalButtons
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
  createOrder={async () => getPayPalCheckoutToken(cart.currency)}
  onApprove={async (data: { orderID: string }) => {
    await checkoutCartWithPaypal(
      cart.id,
      cart.version,
      {
        locale,
        displayName: '',
      },
      getAttributionParams(searchParams),
      sessionUid,
      data.orderID
    );
    const queryParamString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : '';
    router.push('./processing' + queryParamString);
  }}
  onError={async () => {
    await finalizeCartWithError(
      cart.id,
      CartErrorReasonId.BASIC_ERROR
    );
    const queryParamString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : '';

    router.push('./error' + queryParamString);
  }}
  disabled={loading || !formEnabled}
/> */
}
