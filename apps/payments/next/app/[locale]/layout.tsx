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
  params: Promise<{
    locale: string;
  }>;
  children: React.ReactNode;
}) {
  const { locale } = await params;
  const acceptLanguage = (await headers()).get('accept-language');
  const fetchedMessages = getApp().getFetchedMessages(
    acceptLanguage,
    locale
  );

  return (
    <Providers
      config={{
        stripePublicApiKey: config.stripePublicApiKey,
        paypalClientId: config.paypal.clientId,
        glean: {
          enabled: config.gleanClientConfig.enabled,
          applicationId: config.gleanClientConfig.applicationId,
          uploadEnabled: config.gleanClientConfig.uploadEnabled,
          version: config.gleanClientConfig.version,
          channel: config.gleanClientConfig.channel,
          serverEndpoint: config.gleanClientConfig.serverEndpoint,
          logPings: config.gleanClientConfig.logPings,
          debugViewTag: config.gleanClientConfig.debugViewTag,
        },
        sentry: {
          ...config.sentry, //spread to make sure its a POJO
        },
      }}
      fetchedMessages={fetchedMessages}
    >
      {children}
    </Providers>
  );
}
