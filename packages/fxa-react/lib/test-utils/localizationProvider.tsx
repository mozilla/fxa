import { render } from '@testing-library/react';
import AppLocalizationProvider from 'fxa-react/lib/AppLocalizationProvider';

export function renderWithLocalizationProvider(
  children: JSX.Element,
  messages = { en: ['testo: lol'] }
): ReturnType<typeof render> {
  // by default fluent warns about missing messages, but there's no way to
  // disable it right now.  see
  // https://github.com/projectfluent/fluent.js/issues/411
  return render(withLocalizationProvider(children, messages));
}

export function withLocalizationProvider(
  children: JSX.Element,
  messages = { en: ['testo: lol'] }
) {
  return (
    <AppLocalizationProvider messages={messages}>
      {children}
    </AppLocalizationProvider>
  );
}

export default { renderWithLocalizationProvider, withLocalizationProvider };
