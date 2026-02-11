/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { createContext } from 'react';

export interface ConfigContextValues {
  stripePublicApiKey: string;
  paypalClientId: string;
  sentry: {
    dsn?: string;
    clientDsn?: string;
    env: string;
    clientName: string;
    ignoreErrors?: (string | RegExp)[];
    sampleRate: number;
    tracesSampleRate: number;
  };
}

export const ConfigContext = createContext<ConfigContextValues>({
  stripePublicApiKey: '',
  paypalClientId: '',
  sentry: {
    dsn: '',
    clientDsn: '',
    env: '',
    clientName: '',
    ignoreErrors: [],
    sampleRate: 1,
    tracesSampleRate: 1,
  },
});

export function ConfigProvider({
  config,
  children,
}: {
  config: ConfigContextValues;
  children: React.ReactNode;
}) {
  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
}
