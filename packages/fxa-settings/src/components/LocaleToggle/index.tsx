/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { useLocaleManager } from '../../lib/hooks/useLocaleManager';
import { useFtlMsgResolver } from '../../models';
import { getBrowserDefaultLocaleInfo } from '../../lib/locales';

const BROWSER_DEFAULT_VALUE = 'browser-default';

/**
 * Locale selection dropdown component with browser default support
 * Handles locale switching and preference clearing
 */
export const LocaleToggle: React.FC = () => {
  const ftlMsgResolver = useFtlMsgResolver();
  const {
    currentLocale,
    availableLocales,
    switchLocale,
    clearLocalePreference,
    isUsingBrowserDefault,
    isLoading,
  } = useLocaleManager();

  // Handle locale selection
  const handleLocaleChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newLocale = event.target.value;

    if (newLocale === BROWSER_DEFAULT_VALUE) {
      // User selected browser default - clear the preference
      await clearLocalePreference();
    } else if (newLocale && newLocale !== currentLocale) {
      // User selected a specific locale
      await switchLocale(newLocale);
    }
  };

  const selectLabel = ftlMsgResolver.getMsg(
    'locale-toggle-select-label',
    'Select language'
  );

  const browserDefaultLabel = ftlMsgResolver.getMsg(
    'locale-toggle-browser-default',
    'Browser default'
  );

  // Get browser's default locale info for functionality (not display)
  const browserDefaultLocale = getBrowserDefaultLocaleInfo();

  // Determine the current value for the select
  // If using browser default, show the actual browser locale in the dropdown
  const currentValue = isUsingBrowserDefault
    ? browserDefaultLocale?.code || currentLocale
    : currentLocale;

  return (
    <div className="bg-grey-10 p-1 tablet:bg-transparent tablet:p-0 rounded-md border border-grey-50 tablet:border-none">
      <label htmlFor="locale-select" className="sr-only">
        {selectLabel}
      </label>
      <select
        id="locale-select"
        value={currentValue}
        onChange={handleLocaleChange}
        disabled={isLoading}
        className="text-xs text-grey-500 hover:text-grey-600 p-1 focus:outline-2 focus:outline-offset-1 focus:outline-blue-500 focus:text-grey-600 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent border-0 cursor-pointer appearance-none min-w-[8ch] w-auto"
        data-testid="locale-select"
        aria-label={selectLabel}
      >
        <option
          key={BROWSER_DEFAULT_VALUE}
          value={BROWSER_DEFAULT_VALUE}
          data-testid="locale-option-browser-default"
        >
          {browserDefaultLabel}
        </option>
        {availableLocales.map((locale) => (
          <option
            key={locale.code}
            value={locale.code}
            data-testid={`locale-option-${locale.code}`}
          >
            {locale.nativeName}
            {locale.nativeName !== locale.name && ` (${locale.name})`}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LocaleToggle;
