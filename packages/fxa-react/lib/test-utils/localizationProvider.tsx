/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, act } from '@testing-library/react';
import AppLocalizationProvider from 'fxa-react/lib/AppLocalizationProvider';

const reportError = () => {};

/**
 * Does the same as {@link renderWithLocalizationProvider} but uses `act` to ensure
 * that all effects are flushed before returning.
 * This is useful when the component being rendered has effects that may not be tested directly but should
 * still be flushed before assertions are made.
 * @param children
 * @param messages
 * @returns
 */
export async function renderWithLocalizationProviderAct(
  children: JSX.Element,
  messages = { en: ['testo: lol'] }
): Promise<ReturnType<typeof render>> {
  return await act(() => render(
    <AppLocalizationProvider {...{ messages, reportError }}>
      {children}
    </AppLocalizationProvider>
  ));
}

export function renderWithLocalizationProvider(
  children: JSX.Element,
  messages = { en: ['testo: lol'] }
): ReturnType<typeof render> {
  return render(
    <AppLocalizationProvider {...{ messages, reportError }}>
      {children}
    </AppLocalizationProvider>
  );
}

export function withLocalizationProvider(
  children: JSX.Element,
  baseDir = '/locales',
  userLocales = navigator.languages || ['en']
) {
  return (
    <AppLocalizationProvider {...{ baseDir, userLocales, reportError }}>
      {children}
    </AppLocalizationProvider>
  );
}

export default { renderWithLocalizationProvider, withLocalizationProvider, renderWithLocalizationProviderAct };
