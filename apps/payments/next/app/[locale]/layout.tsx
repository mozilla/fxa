/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { getApp } from '@fxa/payments/ui/server';
import { headers } from 'next/headers';
import { Providers } from '@fxa/payments/ui';
import { config } from 'apps/payments/next/config';

export default async function RootProviderLayout({
  params,
  children,
}: {
  params: {
    locale: string;
  };
  children: React.ReactNode;
}) {
  const acceptLanguage = headers().get('accept-language');
  const nonce = headers().get('x-nonce') || undefined;
  const fetchedMessages = getApp().getFetchedMessages(
    acceptLanguage,
    params.locale
  );

  return (
    <Providers
      config={{
        stripePublicApiKey: config.stripePublicApiKey,
        paypalClientId: config.paypal.clientId,
        sentry: {
          ...config.sentry, //spread to make sure its a POJO
        },
      }}
      fetchedMessages={fetchedMessages}
      nonce={nonce}
    >
      {children}
    </Providers>
  );
}
