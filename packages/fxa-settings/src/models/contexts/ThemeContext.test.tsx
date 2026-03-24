/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';
import * as themeStorage from '../../lib/theme-storage';

jest.mock('../../lib/theme-storage', () => ({
  getStoredTheme: jest.fn(() => 'light'),
  setStoredTheme: jest.fn(),
  getEffectiveTheme: jest.fn((pref: string) =>
    pref === 'system' ? 'light' : pref
  ),
  getSystemTheme: jest.fn(() => 'light'),
}));

// jsdom does not implement matchMedia; provide a minimal stub
const makeMatchMedia = (matches = false) => ({
  matches,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
});

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn(() => makeMatchMedia()),
  });
});

const wrapper =
  (enabled?: boolean) =>
  ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider enabled={enabled}>{children}</ThemeProvider>
  );

describe('useTheme', () => {
  it('throws when used outside ThemeProvider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme must be used within a ThemeProvider'
    );
  });
});

describe('ThemeProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (themeStorage.getStoredTheme as jest.Mock).mockReturnValue('light');
    (themeStorage.getEffectiveTheme as jest.Mock).mockImplementation(
      (pref: string) => (pref === 'system' ? 'light' : pref)
    );
    (themeStorage.getSystemTheme as jest.Mock).mockReturnValue('light');
    document.documentElement.classList.remove('dark');
  });

  it('provides light theme by default', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: wrapper() });
    expect(result.current.themePreference).toBe('light');
    expect(result.current.effectiveTheme).toBe('light');
  });

  it('reads initial preference from storage', () => {
    (themeStorage.getStoredTheme as jest.Mock).mockReturnValue('dark');
    (themeStorage.getEffectiveTheme as jest.Mock).mockReturnValue('dark');
    const { result } = renderHook(() => useTheme(), { wrapper: wrapper() });
    expect(result.current.themePreference).toBe('dark');
    expect(result.current.effectiveTheme).toBe('dark');
  });

  it('applies dark class to documentElement when effective theme is dark', () => {
    (themeStorage.getStoredTheme as jest.Mock).mockReturnValue('dark');
    (themeStorage.getEffectiveTheme as jest.Mock).mockReturnValue('dark');
    renderHook(() => useTheme(), { wrapper: wrapper() });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark class from documentElement when effective theme is light', () => {
    document.documentElement.classList.add('dark');
    renderHook(() => useTheme(), { wrapper: wrapper() });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('updates themePreference and effectiveTheme on setThemePreference', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: wrapper() });
    act(() => {
      result.current.setThemePreference('dark');
    });
    expect(result.current.themePreference).toBe('dark');
    expect(result.current.effectiveTheme).toBe('dark');
    expect(themeStorage.setStoredTheme).toHaveBeenCalledWith('dark');
  });

  it('resolves system preference via getEffectiveTheme', () => {
    (themeStorage.getEffectiveTheme as jest.Mock).mockReturnValue('dark');
    const { result } = renderHook(() => useTheme(), { wrapper: wrapper() });
    act(() => {
      result.current.setThemePreference('system');
    });
    expect(result.current.effectiveTheme).toBe('dark');
  });

  describe('when disabled', () => {
    it('always provides light theme regardless of stored preference', () => {
      (themeStorage.getStoredTheme as jest.Mock).mockReturnValue('dark');
      const { result } = renderHook(() => useTheme(), {
        wrapper: wrapper(false),
      });
      expect(result.current.effectiveTheme).toBe('light');
    });

    it('ignores setThemePreference calls', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: wrapper(false),
      });
      act(() => {
        result.current.setThemePreference('dark');
      });
      expect(themeStorage.setStoredTheme).not.toHaveBeenCalled();
      expect(result.current.themePreference).toBe('light');
    });

    it('never adds dark class to documentElement', () => {
      (themeStorage.getStoredTheme as jest.Mock).mockReturnValue('dark');
      renderHook(() => useTheme(), { wrapper: wrapper(false) });
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('removes dark class if it was already present', () => {
      document.documentElement.classList.add('dark');
      renderHook(() => useTheme(), { wrapper: wrapper(false) });
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('system preference listener', () => {
    it('registers a matchMedia listener when preference is system', () => {
      const mediaQuery = makeMatchMedia();
      (window.matchMedia as jest.Mock).mockReturnValue(mediaQuery);

      const { result, unmount } = renderHook(() => useTheme(), {
        wrapper: wrapper(),
      });
      act(() => {
        result.current.setThemePreference('system');
      });

      expect(mediaQuery.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
      unmount();
      expect(mediaQuery.removeEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });

    it('does not register a listener for non-system preferences', () => {
      const mediaQuery = makeMatchMedia();
      (window.matchMedia as jest.Mock).mockReturnValue(mediaQuery);

      renderHook(() => useTheme(), { wrapper: wrapper() });
      expect(mediaQuery.addEventListener).not.toHaveBeenCalled();
    });
  });
});
