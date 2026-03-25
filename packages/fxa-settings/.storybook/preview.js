/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import '../src/styles/tailwind.out.css';
import './design-guide/design-guide.css';
import { initializeRTL } from 'storybook-addon-rtl';
import React, { useEffect } from 'react';
import { ThemeProvider, useTheme } from '../src/models/contexts/ThemeContext';

initializeRTL();

const ThemeSync = ({ theme, children }) => {
  const { setThemePreference } = useTheme();
  useEffect(() => {
    setThemePreference(theme || 'light');
  }, [theme, setThemePreference]);
  return children;
};

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Theme for components',
    defaultValue: 'light',
    toolbar: {
      title: 'Set theme',
      items: [
        { value: 'light', icon: 'sun', title: 'Light' },
        { value: 'dark', icon: 'moon', title: 'Dark' },
        { value: 'system', icon: 'browser', title: 'System' },
      ],
      showName: true,
      dynamicTitle: true,
    },
  },
};

export const decorators = [
  (Story, context) => (
    <ThemeProvider>
      <ThemeSync theme={context.globals.theme}>
        <Story />
      </ThemeSync>
    </ThemeProvider>
  ),
];

export const parameters = {
  options: {
    storySort: {
      method: 'alphabetical',
    },
  },
};
