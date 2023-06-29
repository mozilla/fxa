/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import Head from './index';
import AppLocalizationProvider from '../../lib/AppLocalizationProvider';

storiesOf('Components/Head', module)
  .add('basic', () => (
    <AppLocalizationProvider
      baseDir="./locales"
      userLocales={navigator.languages}
    >
      <Head />
    </AppLocalizationProvider>
  ))
  .add('with title', () => (
    <AppLocalizationProvider
      baseDir="./locales"
      userLocales={navigator.languages}
    >
      <Head title="neat feature" />
    </AppLocalizationProvider>
  ));
