/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { Header } from './index';
import { LogoLockup } from '../LogoLockup';
import AppLocalizationProvider from '../../lib/AppLocalizationProvider';

storiesOf('Components/Header', module)
  .add('basic', () => (
    <AppLocalizationProvider
      baseDir="./locales"
      userLocales={navigator.languages}
    >
      <Header left={<div>left content</div>} right={<div>right content</div>} />
    </AppLocalizationProvider>
  ))
  .add('with LogoLockup', () => (
    <AppLocalizationProvider
      baseDir="./locales"
      userLocales={navigator.languages}
    >
      <Header
        left={<LogoLockup>Some title</LogoLockup>}
        right={<div>right content</div>}
      />
    </AppLocalizationProvider>
  ));
