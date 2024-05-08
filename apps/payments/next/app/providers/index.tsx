/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import React, { useState, useEffect } from 'react';
import { ReactLocalization, LocalizationProvider } from '@fluent/react';
import {
  LocalizerClient,
  LocalizerBindingsClient,
} from '@fxa/shared/l10n/client';

export function Providers({ children }: { children: React.ReactNode }) {
  const [l10n, setL10n] = useState<ReactLocalization>();

  useEffect(() => {
    const setLocalization = async () => {
      const locale = navigator.language;
      const bindings = new LocalizerBindingsClient();
      const localizerClient = new LocalizerClient(bindings);
      const { l10n } = await localizerClient.setupReactLocalization(locale);

      setL10n(l10n);
    };

    setLocalization();
  }, []);

  return (
    <>
      {l10n && (
        <LocalizationProvider l10n={l10n}>{children}</LocalizationProvider>
      )}
    </>
  );
}
