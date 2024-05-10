/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { FluentLocalizationProvider } from './FluentLocalizationProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return <FluentLocalizationProvider>{children}</FluentLocalizationProvider>;
}
