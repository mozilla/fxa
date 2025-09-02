/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Decorator } from '@storybook/react';
import AppLocalizationProvider from './AppLocalizationProvider';
import {
  createHistory,
  createMemorySource,
  LocationProvider,
} from '@reach/router';

// This decorator makes the localization bundles available in the stories.
// If a localized string is available, that will be rendered in the storybook,
// otherwise the fallback strings will be displayed.
export const withLocalization: Decorator = (Story) => (
  <AppLocalizationProvider
    baseDir="./locales"
    userLocales={navigator.languages}
  >
    <Story />
  </AppLocalizationProvider>
);

export const withLocation: (location?: string) => Decorator =
  (location) => (Story) => {
    if (location === undefined) {
      return (
        <LocationProvider>
          <Story />
        </LocationProvider>
      );
    }
    const source = createMemorySource(location);
    const history = createHistory(source);

    return (
      <LocationProvider history={history}>
        <Story />
      </LocationProvider>
    );
  };
