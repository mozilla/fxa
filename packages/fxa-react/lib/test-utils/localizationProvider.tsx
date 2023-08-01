import React from 'react';
import { render } from '@testing-library/react';
import AppLocalizationProvider from 'fxa-react/lib/AppLocalizationProvider';

const reportError = () => {};

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

export default { renderWithLocalizationProvider, withLocalizationProvider };
