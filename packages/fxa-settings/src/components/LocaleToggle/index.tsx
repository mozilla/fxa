/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import classNames from 'classnames';
import { useLocaleManager } from '../../lib/hooks';
import { useFtlMsgResolver } from '../../models';
import { getBrowserDefaultLocaleInfo } from '../../lib/locales';

const BROWSER_DEFAULT_VALUE = 'browser-default';

const localeLabel = ({
  name,
  nativeName,
}: {
  name: string;
  nativeName: string;
}) => (nativeName === name ? nativeName : `${nativeName} (${name})`);

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

  // The select falls back to its first option when the value is not listed.
  const selectedLocale = availableLocales.find(
    (locale) => locale.code === currentValue
  );
  const selectedLabel = selectedLocale
    ? localeLabel(selectedLocale)
    : browserDefaultLabel;

  return (
    <div className="group relative bg-grey-10 dark:bg-grey-600 p-1 tablet:bg-transparent dark:tablet:bg-transparent tablet:p-0 rounded-md border border-grey-50 dark:border-grey-500 tablet:border-none dark:tablet:border-none focus-within:outline focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-blue-500">
      <label htmlFor="locale-select" className="sr-only">
        {selectLabel}
      </label>
      {/* A native select is as wide as its longest option, so it sits invisible over this label. */}
      <span
        aria-hidden="true"
        className={classNames(
          'block whitespace-nowrap p-1 tablet:px-0 text-xs text-grey-500 dark:text-grey-200 group-hover:text-grey-600 dark:group-hover:text-grey-100',
          isLoading && 'opacity-50'
        )}
      >
        {selectedLabel}
      </span>
      <select
        id="locale-select"
        value={currentValue}
        onChange={handleLocaleChange}
        disabled={isLoading}
        className="absolute inset-0 w-full opacity-0 text-xs cursor-pointer disabled:cursor-not-allowed"
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
            {localeLabel(locale)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LocaleToggle;
