import React from 'react';
import { render } from '@testing-library/react';
import AppLocalizationProvider from 'fxa-react/lib/AppLocalizationProvider';

export function renderWithLocalizationProvider(
  children: JSX.Element,
  messages = { en: ['testo: lol'] }
): ReturnType<typeof render> {
  // by default fluent warns about missing messages, but there's no way to
  // disable it right now.  see
  // https://github.com/projectfluent/fluent.js/issues/411
  return render(
    <AppLocalizationProvider {...{ messages }}>
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
    <AppLocalizationProvider {...{ baseDir, userLocales }}>
      {children}
    </AppLocalizationProvider>
  );
}

export default { renderWithLocalizationProvider, withLocalizationProvider };
