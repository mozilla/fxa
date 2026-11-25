/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Footer } from './index';

const mockSwitchLocale = jest.fn();
const mockClearLocalePreference = jest.fn();

jest.mock('../../lib/hooks/useLocaleManager', () => ({
  useLocaleManager: () => ({
    currentLocale: 'es',
    availableLocales: [
      { code: 'en', name: 'English', nativeName: 'English', rtl: false },
      { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false },
      { code: 'he', name: 'Hebrew', nativeName: 'עברית', rtl: true },
    ],
    switchLocale: mockSwitchLocale,
    clearLocalePreference: mockClearLocalePreference,
    isUsingBrowserDefault: false,
    isLoading: false,
  }),
}));

const mockSetThemePreference = jest.fn();
const mockUseConfig = jest.fn();

jest.mock('../../models', () => ({
  useConfig: () => mockUseConfig(),
  useTheme: () => ({
    themePreference: 'light',
    setThemePreference: mockSetThemePreference,
  }),
  useFtlMsgResolver: () => ({
    getMsg: (_id: string, fallback: string) => fallback,
  }),
}));

const setFlags = (showLocaleToggle: boolean, darkMode: boolean) =>
  mockUseConfig.mockReturnValue({
    featureFlags: { showLocaleToggle },
    darkMode: { enabled: darkMode },
  });

const openPanel = async () => {
  await userEvent.click(
    screen.getByRole('button', { name: /^(Language|Theme)/ })
  );
  return screen.getByTestId('footer-preferences-panel');
};

describe('Footer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setFlags(true, true);
  });

  it('renders a contentinfo landmark with a named nav of three links', () => {
    renderWithLocalizationProvider(<Footer />);

    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveAttribute('data-testid', 'footer');
    expect(
      within(footer).getByRole('link', { name: /Mozilla logo/ })
    ).toHaveAttribute(
      'href',
      'https://www.mozilla.org/about/?utm_source=firefox-accounts&utm_medium=Referral'
    );

    const nav = within(footer).getByRole('navigation', { name: 'Footer' });
    const links = within(nav).getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      'https://www.mozilla.org/privacy/websites/',
      'https://www.mozilla.org/about/legal/terms/services/',
      'https://support.mozilla.org/products/mozilla-account',
    ]);
  });

  it('marks each footer link as opening in a new window', () => {
    renderWithLocalizationProvider(<Footer />);

    const nav = screen.getByRole('navigation', { name: 'Footer' });
    expect(
      within(nav)
        .getAllByRole('link')
        .map((link) => link.textContent)
    ).toEqual([
      'Website Privacy NoticeOpens in new window',
      'Terms of ServiceOpens in new window',
      'HelpOpens in new window',
    ]);
  });

  it('has no preferences button when both toggle flags are off', () => {
    setFlags(false, false);
    renderWithLocalizationProvider(<Footer />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('names the button with the hidden text, the language and the theme', () => {
    renderWithLocalizationProvider(<Footer />);

    const button = screen.getByRole('button', {
      name: 'Language and theme Español Light',
    });
    expect(within(button).getByText('Español')).toHaveAttribute('lang', 'es');
  });

  it('opens the panel and points aria-controls at it', async () => {
    renderWithLocalizationProvider(<Footer />);
    const button = screen.getByRole('button', { name: /Language and theme/ });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();

    const panel = await openPanel();

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('aria-controls', panel.id);
  });

  it('closes on Escape and moves focus to the button', async () => {
    renderWithLocalizationProvider(<Footer />);
    await openPanel();
    await userEvent.tab();

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Language and theme/ })
    ).toHaveFocus();
  });

  it('closes on a click outside', async () => {
    renderWithLocalizationProvider(
      <>
        <p>Outside</p>
        <Footer />
      </>
    );
    await openPanel();

    await userEvent.click(screen.getByText('Outside'));

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('labels the language select only through its label', async () => {
    renderWithLocalizationProvider(<Footer />);
    await openPanel();

    const select = screen.getByRole('combobox', { name: 'Select language' });
    expect(select).not.toHaveAttribute('aria-label');
    expect(select).toHaveValue('es');
    expect(
      screen.getByRole('option', { name: 'Browser default' })
    ).not.toHaveAttribute('lang');
    expect(
      screen.getByRole('option', { name: 'עברית (Hebrew)' })
    ).toHaveAttribute('lang', 'he');
    expect(screen.getByRole('option', { name: 'English' })).toHaveAttribute(
      'lang',
      'en'
    );
  });

  it('switches to the chosen locale', async () => {
    renderWithLocalizationProvider(<Footer />);
    await openPanel();

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Select language' }),
      'he'
    );

    expect(mockSwitchLocale).toHaveBeenCalledWith('he');
  });

  it('clears the locale preference for the browser default', async () => {
    renderWithLocalizationProvider(<Footer />);
    await openPanel();

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Select language' }),
      'browser-default'
    );

    expect(mockClearLocalePreference).toHaveBeenCalledTimes(1);
  });

  const switchAndRemount = async (value: string) => {
    const { unmount } = renderWithLocalizationProvider(<Footer />);
    await openPanel();
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Select language' }),
      value
    );
    // The real switch remounts the app through a key change.
    unmount();
    return renderWithLocalizationProvider(<Footer />);
  };

  it.each(['he', 'browser-default'])(
    'focuses the preferences button after the remount for %s',
    async (value) => {
      await switchAndRemount(value);
      expect(
        screen.getByRole('button', { name: /^Language and theme/ })
      ).toHaveFocus();
    }
  );

  it('does not take focus on a later mount', async () => {
    const { unmount } = await switchAndRemount('he');
    unmount();
    renderWithLocalizationProvider(<Footer />);
    expect(document.body).toHaveFocus();
  });

  it('shows a Theme radio group that sets the preference', async () => {
    renderWithLocalizationProvider(<Footer />);
    await openPanel();

    const group = screen.getByRole('group', { name: 'Theme' });
    expect(within(group).getAllByRole('radio')).toHaveLength(3);
    expect(within(group).getByRole('radio', { name: 'Light' })).toBeChecked();

    await userEvent.click(within(group).getByRole('radio', { name: 'Dark' }));
    expect(mockSetThemePreference).toHaveBeenCalledWith('dark');
  });

  it('shows only the theme group when only dark mode is on', async () => {
    setFlags(false, true);
    renderWithLocalizationProvider(<Footer />);

    expect(
      screen.getByRole('button', { name: 'Theme Light' })
    ).toBeInTheDocument();
    await openPanel();

    expect(screen.getByRole('group', { name: 'Theme' })).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('shows only the language select when only the locale toggle is on', async () => {
    setFlags(true, false);
    renderWithLocalizationProvider(<Footer />);

    expect(
      screen.getByRole('button', { name: 'Language Español' })
    ).toBeInTheDocument();
    await openPanel();

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
  });
});
