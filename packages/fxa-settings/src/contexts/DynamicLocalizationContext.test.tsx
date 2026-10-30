/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DynamicLocalizationProvider,
  useDynamicLocalization,
} from './DynamicLocalizationContext';
import { detectBrowserDefaultLocale, LOCALE_STORAGE_KEY } from '../lib/locales';

jest.mock('fxa-react/lib/AppLocalizationProvider', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const html = document.documentElement;

const Controls = () => {
  const { switchLanguage, clearLanguagePreference } = useDynamicLocalization();
  return (
    <>
      <button onClick={() => switchLanguage('he')}>switch</button>
      <button onClick={() => clearLanguagePreference()}>clear</button>
    </>
  );
};

const renderProvider = () =>
  render(
    <DynamicLocalizationProvider baseDir="/locales">
      <Controls />
    </DynamicLocalizationProvider>
  );

describe('DynamicLocalizationProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    html.lang = 'en';
    html.dir = 'ltr';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sets lang and dir from a saved LTR locale on mount', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'de');
    renderProvider();
    expect(html.lang).toBe('de');
    expect(html.dir).toBe('ltr');
  });

  it('sets lang and dir from a saved RTL locale on mount', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'he');
    renderProvider();
    expect(html.lang).toBe('he');
    expect(html.dir).toBe('rtl');
  });

  it('keeps lang and dir on mount with no saved locale', () => {
    html.lang = 'zz';
    html.dir = 'rtl';
    renderProvider();
    expect(html.lang).toBe('zz');
    expect(html.dir).toBe('rtl');
  });

  it('keeps lang and dir on a StrictMode mount with no saved locale', () => {
    html.lang = 'zz';
    html.dir = 'rtl';
    render(
      <React.StrictMode>
        <DynamicLocalizationProvider baseDir="/locales">
          <Controls />
        </DynamicLocalizationProvider>
      </React.StrictMode>
    );
    expect(html.lang).toBe('zz');
    expect(html.dir).toBe('rtl');
  });

  it('updates lang and dir on switchLanguage', async () => {
    renderProvider();
    await userEvent.click(screen.getByRole('button', { name: 'switch' }));
    expect(html.lang).toBe('he');
    expect(html.dir).toBe('rtl');
  });

  it('updates lang and dir on clearLanguagePreference', async () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'he');
    renderProvider();
    await userEvent.click(screen.getByRole('button', { name: 'clear' }));
    expect(html.lang).toBe(detectBrowserDefaultLocale());
    expect(html.dir).toBe('ltr');
  });

  it('updates lang and dir on a storage event', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'de');
    renderProvider();
    localStorage.setItem(LOCALE_STORAGE_KEY, 'he');
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', { key: LOCALE_STORAGE_KEY })
      );
    });
    expect(html.lang).toBe('he');
    expect(html.dir).toBe('rtl');
  });

  it('ignores a storage event for another key', () => {
    jest.spyOn(navigator, 'language', 'get').mockReturnValue('en');
    html.lang = 'de';
    renderProvider();
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'other' }));
    });
    expect(html.lang).toBe('de');
    expect(html.dir).toBe('ltr');
  });

  it('uses the browser locale on a storage event that removes the preference', () => {
    jest.spyOn(navigator, 'language', 'get').mockReturnValue('en');
    localStorage.setItem(LOCALE_STORAGE_KEY, 'he');
    renderProvider();
    localStorage.removeItem(LOCALE_STORAGE_KEY);
    act(() => {
      window.dispatchEvent(new StorageEvent('storage'));
    });
    expect(html.lang).toBe('en');
    expect(html.dir).toBe('ltr');
  });
});
