/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { LocaleToggle } from './index';

// Mock the useLocaleManager hook
const mockSwitchLocale = jest.fn();
const mockClearLocalePreference = jest.fn();

const mockUseLocaleManager = jest.fn(() => ({
  currentLocale: 'en',
  availableLocales: [
    { code: 'en', name: 'English', nativeName: 'English', rtl: false },
    { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false },
    { code: 'fr', name: 'French', nativeName: 'Français', rtl: false },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית', rtl: true },
  ],
  switchLocale: mockSwitchLocale,
  clearLocalePreference: mockClearLocalePreference,
  isUsingBrowserDefault: false,
  isLoading: false,
}));

jest.mock('../../lib/hooks/useLocaleManager', () => ({
  useLocaleManager: () => mockUseLocaleManager(),
}));

// Mock getBrowserDefaultLocaleInfo
jest.mock('../../lib/locales', () => ({
  ...jest.requireActual('../../lib/locales'),
  getBrowserDefaultLocaleInfo: () => ({
    code: 'en',
    name: 'English',
    nativeName: 'English',
    rtl: false,
  }),
}));

// Mock the useFtlMsgResolver hook
jest.mock('../../models', () => ({
  useFtlMsgResolver: () => ({
    getMsg: (_id: string, fallback: string) => fallback,
  }),
}));

describe('LocaleToggle', () => {
  beforeEach(() => {
    mockSwitchLocale.mockClear();
    mockClearLocalePreference.mockClear();
    // Reset to default mock
    mockUseLocaleManager.mockReturnValue({
      currentLocale: 'en',
      availableLocales: [
        { code: 'en', name: 'English', nativeName: 'English', rtl: false },
        { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false },
        { code: 'fr', name: 'French', nativeName: 'Français', rtl: false },
        { code: 'he', name: 'Hebrew', nativeName: 'עברית', rtl: true },
      ],
      switchLocale: mockSwitchLocale,
      clearLocalePreference: mockClearLocalePreference,
      isUsingBrowserDefault: false,
      isLoading: false,
    });
  });

  it('renders correctly with all required elements and attributes', () => {
    renderWithLocalizationProvider(<LocaleToggle />);

    const select = screen.getByRole('combobox', { name: 'Select language' });
    expect(select).toBeInTheDocument();
    expect(select).toHaveAttribute('aria-label', 'Select language');
    expect(select).toHaveAttribute('id', 'locale-select');
    expect(select).toHaveValue('en');

    // Check that all locales are rendered
    expect(select).toHaveTextContent('English');
    expect(select).toHaveTextContent('Español');
    expect(select).toHaveTextContent('Français');
    expect(select).toHaveTextContent('עברית');
  });

  it('displays locale names correctly with proper formatting', () => {
    renderWithLocalizationProvider(<LocaleToggle />);

    const select = screen.getByRole('combobox', { name: 'Select language' });
    // English shows only native name
    expect(select).toHaveTextContent('English');
    // Non-English locales show both native and English names
    expect(select).toHaveTextContent('Español (Spanish)');
    expect(select).toHaveTextContent('Français (French)');
    expect(select).toHaveTextContent('עברית (Hebrew)');
  });

  it('calls switchLocale when a different locale is selected', async () => {
    const user = userEvent.setup();
    renderWithLocalizationProvider(<LocaleToggle />);

    const select = screen.getByRole('combobox', { name: 'Select language' });
    await user.selectOptions(select, 'es');

    await waitFor(() => {
      expect(mockSwitchLocale).toHaveBeenCalledWith('es');
    });
  });

  it('does not call switchLocale when the same locale is selected', async () => {
    const user = userEvent.setup();
    renderWithLocalizationProvider(<LocaleToggle />);

    const select = screen.getByRole('combobox', { name: 'Select language' });
    await user.selectOptions(select, 'en');

    await waitFor(() => {
      expect(mockSwitchLocale).not.toHaveBeenCalled();
    });
  });

  it('is disabled when loading', () => {
    mockUseLocaleManager.mockReturnValue({
      currentLocale: 'en',
      availableLocales: [
        { code: 'en', name: 'English', nativeName: 'English', rtl: false },
      ],
      switchLocale: mockSwitchLocale,
      clearLocalePreference: mockClearLocalePreference,
      isUsingBrowserDefault: false,
      isLoading: true,
    });

    renderWithLocalizationProvider(<LocaleToggle />);

    const select = screen.getByRole('combobox', { name: 'Select language' });
    expect(select).toBeDisabled();
  });

  it('has proper accessibility attributes and labeling', () => {
    renderWithLocalizationProvider(<LocaleToggle />);

    const select = screen.getByRole('combobox', { name: 'Select language' });
    expect(select).toHaveAttribute('id', 'locale-select');
    expect(select).toHaveAttribute('aria-label', 'Select language');

    const label = screen.getByText('Select language');
    expect(label).toHaveAttribute('for', 'locale-select');
    expect(label).toHaveClass('sr-only');
  });

  it('handles edge cases gracefully', () => {
    // Test empty availableLocales
    mockUseLocaleManager.mockReturnValue({
      currentLocale: 'en',
      availableLocales: [],
      switchLocale: mockSwitchLocale,
      clearLocalePreference: mockClearLocalePreference,
      isUsingBrowserDefault: false,
      isLoading: false,
    });

    const { rerender } = renderWithLocalizationProvider(<LocaleToggle />);

    let select = screen.getByRole('combobox', { name: 'Select language' });
    expect(select).toBeInTheDocument();
    expect(select.children).toHaveLength(1);
    expect(screen.getByText('Browser default')).toBeInTheDocument();

    // Test locales with missing or duplicate properties
    mockUseLocaleManager.mockReturnValue({
      currentLocale: 'en',
      availableLocales: [
        { code: 'en', name: 'English', nativeName: 'English', rtl: false },
        { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false },
        { code: 'fr', name: 'French', nativeName: 'French', rtl: false }, // Same as nativeName
      ],
      switchLocale: mockSwitchLocale,
      clearLocalePreference: mockClearLocalePreference,
      isUsingBrowserDefault: false,
      isLoading: false,
    });

    rerender(<LocaleToggle />);

    select = screen.getByRole('combobox', { name: 'Select language' });
    expect(select).toHaveTextContent('English');
    expect(select).toHaveTextContent('Español (Spanish)');
    expect(select).toHaveTextContent('French'); // Should not show duplicate
  });

  it('shows browser default option and handles selection correctly', () => {
    renderWithLocalizationProvider(<LocaleToggle />);

    const select = screen.getByRole('combobox', { name: 'Select language' });

    // Browser default option should be present
    expect(screen.getByText('Browser default')).toBeInTheDocument();

    // Should have browser default + 4 language options
    expect(select.children).toHaveLength(5);
  });

  it('handles browser default selection', async () => {
    const user = userEvent.setup();
    renderWithLocalizationProvider(<LocaleToggle />);

    const select = screen.getByRole('combobox', { name: 'Select language' });

    // Select browser default
    await user.selectOptions(select, 'browser-default');

    await waitFor(() => {
      expect(mockClearLocalePreference).toHaveBeenCalledTimes(1);
      expect(mockSwitchLocale).not.toHaveBeenCalled();
    });
  });

  it('shows browser default as selected when using browser default', () => {
    mockUseLocaleManager.mockReturnValue({
      currentLocale: 'fr',
      availableLocales: [
        { code: 'en', name: 'English', nativeName: 'English', rtl: false },
        { code: 'fr', name: 'French', nativeName: 'Français', rtl: false },
      ],
      switchLocale: mockSwitchLocale,
      clearLocalePreference: mockClearLocalePreference,
      isUsingBrowserDefault: true,
      isLoading: false,
    });

    renderWithLocalizationProvider(<LocaleToggle />);

    const select = screen.getByRole('combobox', {
      name: 'Select language',
    }) as HTMLSelectElement;

    // Should show the actual browser language (English) when using browser default
    expect(select.value).toBe('en'); // Browser default locale from mock
  });
});
