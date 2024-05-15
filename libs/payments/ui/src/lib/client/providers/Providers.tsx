/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { ConfigContextValues, ConfigProvider } from './ConfigProvider';
import { FluentLocalizationProvider } from './FluentLocalizationProvider';

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
  return (
    <ConfigProvider config={config}>
      <FluentLocalizationProvider fetchedMessages={fetchedMessages}>
        {children}
      </FluentLocalizationProvider>
    </ConfigProvider>
  );
}
