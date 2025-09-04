/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { LocaleToggle } from './index';

// Mock the useLocaleManager hook
const mockSwitchLocale = jest.fn();

const mockUseLocaleManager = jest.fn(() => ({
  currentLocale: 'en',
  availableLocales: [
    { code: 'en', name: 'English', nativeName: 'English', rtl: false },
    { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false },
    { code: 'fr', name: 'French', nativeName: 'Français', rtl: false },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית', rtl: true },
  ],
  switchLocale: mockSwitchLocale,
  isLoading: false,
}));

jest.mock('../../lib/hooks/useLocaleManager', () => ({
  useLocaleManager: () => mockUseLocaleManager(),
}));

// Mock the useFtlMsgResolver hook
jest.mock('../../models', () => ({
  useFtlMsgResolver: () => ({
    getMsg: (id: string, fallback: string) => fallback,
  }),
}));

describe('LocaleToggle', () => {
  beforeEach(() => {
    mockSwitchLocale.mockClear();
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
      isLoading: false,
    });
  });

  it('renders correctly with all required elements and attributes', () => {
    renderWithLocalizationProvider(<LocaleToggle />);

    const select = screen.getByTestId('locale-select');
    expect(select).toBeInTheDocument();
    expect(select).toHaveAttribute('aria-label', 'Select language');
    expect(select).toHaveAttribute('id', 'locale-select');
    expect(select).toHaveValue('en');

    // Check that all locales are rendered
    expect(screen.getByTestId('locale-option-en')).toBeInTheDocument();
    expect(screen.getByTestId('locale-option-es')).toBeInTheDocument();
    expect(screen.getByTestId('locale-option-fr')).toBeInTheDocument();
    expect(screen.getByTestId('locale-option-he')).toBeInTheDocument();
  });

  it('displays locale names correctly with proper formatting', () => {
    renderWithLocalizationProvider(<LocaleToggle />);

    const select = screen.getByTestId('locale-select');
    // English shows only native name
    expect(select).toHaveTextContent('English');
    // Non-English locales show both native and English names
    expect(select).toHaveTextContent('Español (Spanish)');
    expect(select).toHaveTextContent('Français (French)');
    expect(select).toHaveTextContent('עברית (Hebrew)');
  });

  it('calls switchLocale when a different locale is selected', async () => {
    renderWithLocalizationProvider(<LocaleToggle />);

    const select = screen.getByTestId('locale-select');
    fireEvent.change(select, { target: { value: 'es' } });

    await waitFor(() => {
      expect(mockSwitchLocale).toHaveBeenCalledWith('es');
    });
  });

  it('does not call switchLocale when the same locale is selected', async () => {
    renderWithLocalizationProvider(<LocaleToggle />);

    const select = screen.getByTestId('locale-select');
    fireEvent.change(select, { target: { value: 'en' } });

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
      isLoading: true,
    });

    renderWithLocalizationProvider(<LocaleToggle />);

    const select = screen.getByTestId('locale-select');
    expect(select).toBeDisabled();
  });

  it('applies custom className', () => {
    renderWithLocalizationProvider(<LocaleToggle className="custom-class" />);

    const container = screen.getByTestId('locale-select').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes and labeling', () => {
    renderWithLocalizationProvider(<LocaleToggle />);

    const select = screen.getByTestId('locale-select');
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
      isLoading: false,
    });

    const { rerender } = renderWithLocalizationProvider(<LocaleToggle />);

    let select = screen.getByTestId('locale-select');
    expect(select).toBeInTheDocument();
    expect(select.children).toHaveLength(0);

    // Test locales with missing or duplicate properties
    mockUseLocaleManager.mockReturnValue({
      currentLocale: 'en',
      availableLocales: [
        { code: 'en', name: 'English', nativeName: 'English', rtl: false },
        { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false },
        { code: 'fr', name: 'French', nativeName: 'French', rtl: false }, // Same as nativeName
      ],
      switchLocale: mockSwitchLocale,
      isLoading: false,
    });

    rerender(<LocaleToggle />);

    select = screen.getByTestId('locale-select');
    expect(select).toHaveTextContent('English');
    expect(select).toHaveTextContent('Español (Spanish)');
    expect(select).toHaveTextContent('French'); // Should not show duplicate
  });
});
