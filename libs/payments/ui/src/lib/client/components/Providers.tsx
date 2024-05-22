/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { FluentLocalizationProvider } from '../providers/FluentLocalizationProvider';

export function Providers({
  fetchedMessages,
  children,
}: {
  fetchedMessages: Record<string, string>;
  children: React.ReactNode;
}) {
  return (
    <FluentLocalizationProvider fetchedMessages={fetchedMessages}>
      {children}
    </FluentLocalizationProvider>
  );
}
