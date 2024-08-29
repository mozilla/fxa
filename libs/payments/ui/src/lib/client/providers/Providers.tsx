/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { ConfigContextValues, ConfigProvider } from './ConfigProvider';
import { FluentLocalizationProvider } from './FluentLocalizationProvider';
import {
  PayPalScriptProvider,
  ReactPayPalScriptOptions,
} from '@paypal/react-paypal-js';

interface ProvidersProps {
  config: ConfigContextValues;
  fetchedMessages: Record<string, string>;
  nonce?: string;
  children: React.ReactNode;
}

const paypalInitialOptions: ReactPayPalScriptOptions = {
  clientId: '',
  vault: true,
  commit: false,
  intent: 'capture',
  disableFunding: ['credit', 'card'],
};

export function Providers({
  config,
  fetchedMessages,
  nonce,
  children,
}: ProvidersProps) {
  return (
    <ConfigProvider config={config}>
      <FluentLocalizationProvider fetchedMessages={fetchedMessages}>
        <PayPalScriptProvider
          options={{
            ...paypalInitialOptions,
            clientId: config.paypalClientId,
            dataCspNonce: nonce,
          }}
        >
          {children}
        </PayPalScriptProvider>
      </FluentLocalizationProvider>
    </ConfigProvider>
  );
}
