/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { useTheme } from '../../models';
import { useFtlMsgResolver } from '../../models';

/**
 * Dark mode toggle component for the footer
 * Dropdown to select between System, Light, and Dark themes
 */
export const DarkModeToggle: React.FC = () => {
  const { themePreference, setThemePreference } = useTheme();
  const ftlMsgResolver = useFtlMsgResolver();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setThemePreference(event.target.value as 'system' | 'light' | 'dark');
  };

  const selectLabel = ftlMsgResolver.getMsg(
    'dark-mode-toggle-label',
    'Toggle theme'
  );
  const systemLabel = ftlMsgResolver.getMsg(
    'dark-mode-toggle-system',
    'System'
  );
  const lightLabel = ftlMsgResolver.getMsg('dark-mode-toggle-light', 'Light');
  const darkLabel = ftlMsgResolver.getMsg('dark-mode-toggle-dark', 'Dark');
  const selectedLabel = {
    system: systemLabel,
    light: lightLabel,
    dark: darkLabel,
  }[themePreference];

  return (
    <div className="group relative bg-grey-10 dark:bg-grey-600 p-1 tablet:bg-transparent dark:tablet:bg-transparent tablet:p-0 rounded-md border border-grey-50 dark:border-grey-500 tablet:border-none dark:tablet:border-none focus-within:outline focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-blue-500">
      {/* A native select is as wide as its longest option, so it sits invisible over this label. */}
      <span
        aria-hidden="true"
        className="block whitespace-nowrap p-1 tablet:px-0 text-xs text-grey-500 dark:text-grey-200 group-hover:text-grey-600 dark:group-hover:text-grey-100"
      >
        {selectedLabel}
      </span>
      <select
        id="theme-select"
        value={themePreference}
        onChange={handleChange}
        className="absolute inset-0 w-full opacity-0 text-xs cursor-pointer"
        data-testid="dark-mode-toggle"
        aria-label={selectLabel}
      >
        <option value="system">{systemLabel}</option>
        <option value="light">{lightLabel}</option>
        <option value="dark">{darkLabel}</option>
      </select>
    </div>
  );
};

export default DarkModeToggle;
