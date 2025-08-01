/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { ConfigContextValues, ConfigProvider } from './ConfigProvider';
import { FluentLocalizationProvider } from './FluentLocalizationProvider';
import { initSentryForNextjsClient } from '@fxa/shared/sentry/client';
import { getClient as sentryGetClient } from '@sentry/nextjs';
import { GENERIC_ERROR_MESSAGE } from '@fxa/shared/error/error';

interface ProvidersProps {
  config: ConfigContextValues;
  fetchedMessages: Record<string, string>;
  children: React.ReactNode;
}

export function Providers({
  config,
  fetchedMessages,
  children,
}: ProvidersProps) {
  //Only initialize Sentry if it hasn't been initialized yet
  if (!sentryGetClient()) {
    initSentryForNextjsClient({
      release: process.env.version,
      sentry: {
        ...config.sentry,
        dsn: config.sentry.clientDsn,
        ignoreErrors: [new RegExp(`^${GENERIC_ERROR_MESSAGE}$`)],
      },
    });
  }

  return (
    <ConfigProvider config={config}>
      <FluentLocalizationProvider fetchedMessages={fetchedMessages}>
        {children}
      </FluentLocalizationProvider>
    </ConfigProvider>
  );
}
