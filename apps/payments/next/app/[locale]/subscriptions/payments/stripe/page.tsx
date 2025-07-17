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
import { getApp } from '@fxa/payments/ui/server';
import { revalidatePath } from 'next/cache';
import { config } from 'apps/payments/next/config';
import { redirect } from 'next/navigation';

export default async function Manage({
  params,
  searchParams,
}: {
  params: ManageParams;
  searchParams: Record<string, string | string[]> | undefined;
}) {
  const session = await auth();
  const { locale } = params;
  if (!session?.user?.id) {
    redirect(`${config.paymentsNextHostedUrl}/${locale}/subscriptions/landing`);
  }
  const clientSession = await getApp()
    .getActionsService()
    .getStripeClientSession({ uid: session.user.id });
  return (
    <section
      className="p-8"
      data-testid="stripe-payment-management"
      aria-labelledby="stripe-payment-management"
    >
      <div className="pb-6">Manage payment methods</div>
      <StripeManagementWrapper
        locale={locale}
        currency={'usd'}
        sessionSecret={clientSession.clientSecret}
      >
        <PaymentMethodManagement
          onSubmit={async (confirmationTokenId: string) => {
            'use server';

            await getApp()
              .getActionsService()
              .updateStripePaymentMethods({
                uid: session?.user?.id ?? '',
                confirmationTokenId,
              });
            revalidatePath(`/${locale}/subscriptions/payments/stripe`);
          }}
        />
      </StripeManagementWrapper>
    </section>
  );
}
