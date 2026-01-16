/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import {
  ManageParams,
  StripeManagementWrapper,
  PaymentMethodManagement,
} from '@fxa/payments/ui';
import { auth } from 'apps/payments/next/auth';
import { config } from 'apps/payments/next/config';
import { redirect } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { getStripeClientSession } from '@fxa/payments/ui/actions';

export default async function StripePaymentManagementPage({
  params,
}: {
  params: ManageParams;
}) {
  const session = await auth();
  const { locale } = params;
  if (!session?.user?.id) {
    redirect(`${config.paymentsNextHostedUrl}/${locale}/subscriptions/landing`);
  }

  let stripeClientSession;
  try {
    stripeClientSession = await getStripeClientSession(session.user.id);
  } catch (error) {
    if (error.name === 'AccountCustomerNotFoundError') {
      // TODO: replace with redirect to collect tax location data and create customer / accountCustomer
      redirect(
        `${config.paymentsNextHostedUrl}/${locale}/subscriptions/landing`
      );
    } else {
      throw error;
    }
  }
  const { clientSecret, defaultPaymentMethod, currency } =
    stripeClientSession;

  // Only change the instanceKey, thereby remounting the StripeManagementWrapper, when the defaultPaymentMethod changes.
  const instanceKey = defaultPaymentMethod ? `${defaultPaymentMethod.type}-${defaultPaymentMethod.id}` : uuidv4();

  return (
    <section
      className="w-full tablet:px-8 desktop:max-w-[1024px]"
      data-testid="stripe-payment-management"
      aria-labelledby="stripe-payment-management"
    >
      <StripeManagementWrapper
        locale={locale}
        currency={currency}
        sessionSecret={clientSecret}
        instanceKey={instanceKey}
      >
        <PaymentMethodManagement
          uid={session?.user?.id}
          defaultPaymentMethod={defaultPaymentMethod}
          sessionEmail={session?.user?.email ?? undefined}
        />
      </StripeManagementWrapper>
    </section>
  );
}
