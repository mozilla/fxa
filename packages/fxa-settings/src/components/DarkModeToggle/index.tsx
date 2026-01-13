/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { useTheme } from '../../models';
import { useFtlMsgResolver } from '../../models';

/**
 * Dark mode toggle component for the footer
 * Simple button to switch between light and dark themes
 */
export const DarkModeToggle: React.FC = () => {
  const { effectiveTheme, setThemePreference } = useTheme();
  const ftlMsgResolver = useFtlMsgResolver();

  const isDarkMode = effectiveTheme === 'dark';

  const handleToggle = () => {
    setThemePreference(isDarkMode ? 'light' : 'dark');
  };

  const lightModeLabel = ftlMsgResolver.getMsg('dark-mode-toggle-light', 'Light');
  const darkModeLabel = ftlMsgResolver.getMsg('dark-mode-toggle-dark', 'Dark');
  const toggleLabel = ftlMsgResolver.getMsg(
    'dark-mode-toggle-label',
    'Toggle dark mode'
  );

  return (
    <div className="bg-grey-10 dark:bg-grey-700 p-1 tablet:bg-transparent tablet:p-0 rounded-md border border-grey-50 dark:border-grey-600 tablet:border-none">
      <button
        onClick={handleToggle}
        className="text-xs text-grey-500 dark:text-grey-300 hover:text-grey-600 dark:hover:text-grey-200 p-1 focus:outline-2 focus:outline-offset-1 focus:outline-blue-500 focus:text-grey-600 bg-transparent border-0 cursor-pointer"
        data-testid="dark-mode-toggle"
        aria-label={toggleLabel}
        title={toggleLabel}
      >
        {isDarkMode ? lightModeLabel : darkModeLabel}
      </button>
    </div>
  );
};

export default DarkModeToggle;
