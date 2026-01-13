/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../models';
import { useFtlMsgResolver } from '../../models';
import { THEMES, THEME_LABELS, ThemePreference } from '../../lib/theme-storage';

/**
 * Theme selector dropdown component
 * Allows users to choose between light, dark, cyberpunk, candy land, and system themes
 */
export const DarkModeToggle: React.FC = () => {
  const { themePreference, setThemePreference } = useTheme();
  const ftlMsgResolver = useFtlMsgResolver();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleLabel = ftlMsgResolver.getMsg(
    'dark-mode-toggle-label',
    'Theme'
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSelect = (theme: ThemePreference) => {
    setThemePreference(theme);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs text-grey-500 dark:text-grey-300 hover:text-grey-600 dark:hover:text-grey-200 p-1 px-2 focus:outline-2 focus:outline-offset-1 focus:outline-blue-500 bg-grey-10 dark:bg-grey-700 rounded-md border border-grey-200 dark:border-grey-600 cursor-pointer flex items-center gap-1"
        data-testid="theme-selector"
        aria-label={toggleLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{THEME_LABELS[themePreference]}</span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute bottom-full mb-1 start-0 bg-white dark:bg-grey-700 border border-grey-200 dark:border-grey-600 rounded-md shadow-lg py-1 min-w-[120px] z-50"
          role="listbox"
          aria-label="Theme options"
        >
          {THEMES.map((theme) => (
            <button
              key={theme}
              onClick={() => handleSelect(theme)}
              className={`w-full text-start px-3 py-1.5 text-xs hover:bg-grey-100 dark:hover:bg-grey-600 cursor-pointer ${
                themePreference === theme
                  ? 'text-blue-500 dark:text-blue-400 font-semibold'
                  : 'text-grey-600 dark:text-grey-200'
              }`}
              role="option"
              aria-selected={themePreference === theme}
              data-testid={`theme-option-${theme}`}
            >
              {THEME_LABELS[theme]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DarkModeToggle;
