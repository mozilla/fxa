/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { getApp } from '@fxa/payments/ui/server';
import { headers } from 'next/headers';
import { DEFAULT_LOCALE } from '@fxa/shared/l10n';
import { Providers } from '@fxa/payments/ui';
import { config } from 'apps/payments/next/config';

export default async function RootProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Temporarily defaulting to `accept-language`
  // This to be updated in FXA-9404
  //const locale = getLocaleFromRequest(
  //  params,
  //  headers().get('accept-language')
  //);
  const locale = headers().get('accept-language') || DEFAULT_LOCALE;
  const nonce = headers().get('x-nonce') || undefined;
  const fetchedMessages = getApp().getFetchedMessages(locale);

  return (
    <Providers
      config={{
        stripePublicApiKey: config.stripePublicApiKey,
        paypalClientId: config.paypal.clientId,
      }}
      fetchedMessages={fetchedMessages}
      nonce={nonce}
    >
      {children}
    </Providers>
  );
}
