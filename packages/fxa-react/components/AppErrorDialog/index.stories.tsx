/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import AppErrorDialog from './index';
import AppLocalizationProvider from '../../lib/AppLocalizationProvider';

storiesOf('Components/AppErrorDialog', module)
  .add('basic', () => (
    <AppLocalizationProvider
      baseDir="./locales"
      userLocales={navigator.languages}
    >
      <AppErrorDialog />
    </AppLocalizationProvider>
  ))
  .add('general with errors', () => (
    <AppLocalizationProvider
      baseDir="./locales"
      userLocales={navigator.languages}
    >
      <AppErrorDialog errorType="general" />
    </AppLocalizationProvider>
  ))
  .add('invalid query parameters', () => (
    <AppLocalizationProvider
      baseDir="./locales"
      userLocales={navigator.languages}
    >
      <AppErrorDialog errorType="query-parameter-violation" />
    </AppLocalizationProvider>
  ));
