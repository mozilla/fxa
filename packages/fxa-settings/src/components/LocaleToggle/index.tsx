/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { useLocaleManager } from '../../lib/hooks/useLocaleManager';
import { useFtlMsgResolver } from '../../models';

interface LocaleToggleProps {
  className?: string;
  placement?: 'footer' | 'header';
}

export const LocaleToggle: React.FC<LocaleToggleProps> = ({
  className = '',
  placement = 'footer'
}) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const { currentLocale, availableLocales, switchLocale, isLoading } = useLocaleManager();

  // Handle locale selection
  const handleLocaleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = event.target.value;
    if (newLocale && newLocale !== currentLocale) {
      await switchLocale(newLocale);
    }
  };

  const selectLabel = ftlMsgResolver.getMsg(
    'locale-toggle-select-label',
    'Select language'
  );

  return (
    <div className={`relative ${className}`}>
      <label htmlFor="locale-select" className="sr-only">
        {selectLabel}
      </label>
      <select
        id="locale-select"
        value={currentLocale}
        onChange={handleLocaleChange}
        disabled={isLoading}
        className="text-xs text-grey-500 hover:text-grey-600 focus:outline-none focus:text-grey-600 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent border-0 cursor-pointer appearance-none min-w-[8ch] w-auto"
        data-testid="locale-select"
        aria-label={selectLabel}
      >
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
