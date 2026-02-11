/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { CardLoadingSpinner } from './';
import { SpinnerType } from 'fxa-react/components/LoadingSpinner';
import AppLocalizationProvider from 'fxa-react/lib/AppLocalizationProvider';

storiesOf('Components/CardLoadingSpinner', module)
  .addDecorator((story) => (
    <AppLocalizationProvider baseDir="." userLocales={navigator.languages}>
      {story()}
    </AppLocalizationProvider>
  ))
  .add('default', () => (
    <div className="min-h-screen bg-grey-20 flex items-center justify-center">
      <CardLoadingSpinner />
    </div>
  ))
  .add('white spinner on dark background', () => (
    <div className="min-h-screen bg-grey-700 flex items-center justify-center">
      <CardLoadingSpinner spinnerType={SpinnerType.White} />
    </div>
  ))
  .add('large spinner', () => (
    <div className="min-h-screen bg-grey-20 flex items-center justify-center">
      <CardLoadingSpinner spinnerSize="w-16 h-16" />
    </div>
  ))
  .add('with CMS background simulation', () => (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <CardLoadingSpinner />
    </div>
  ));
