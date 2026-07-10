/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { DarkModeToggle } from './index';

const mockSetThemePreference = jest.fn();

jest.mock('../../models', () => ({
  useTheme: () => ({
    themePreference: 'light',
    setThemePreference: mockSetThemePreference,
  }),
  useFtlMsgResolver: () => ({
    getMsg: (_id: string, fallback: string) => fallback,
  }),
}));

describe('DarkModeToggle', () => {
  beforeEach(() => {
    mockSetThemePreference.mockClear();
  });

  it('renders a select with all three theme options', () => {
    renderWithLocalizationProvider(<DarkModeToggle />);

    const select = screen.getByRole('combobox', { name: 'Toggle theme' });
    expect(select).toBeInTheDocument();
    expect(select).toHaveAttribute('aria-label', 'Toggle theme');

    expect(screen.getByRole('option', { name: 'System' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Light' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Dark' })).toBeInTheDocument();
  });

  it('reflects the current theme preference as the selected value', () => {
    renderWithLocalizationProvider(<DarkModeToggle />);

    const select = screen.getByRole('combobox', { name: 'Toggle theme' });
    expect(select).toHaveValue('light');
  });

  it('calls setThemePreference with the selected value on change', async () => {
    const user = userEvent.setup();
    renderWithLocalizationProvider(<DarkModeToggle />);

    const select = screen.getByRole('combobox', { name: 'Toggle theme' });
    await user.selectOptions(select, 'dark');

    expect(mockSetThemePreference).toHaveBeenCalledWith('dark');
  });

  it('calls setThemePreference with "system" when system option is selected', async () => {
    const user = userEvent.setup();
    renderWithLocalizationProvider(<DarkModeToggle />);

    const select = screen.getByRole('combobox', { name: 'Toggle theme' });
    await user.selectOptions(select, 'system');

    expect(mockSetThemePreference).toHaveBeenCalledWith('system');
  });
});
