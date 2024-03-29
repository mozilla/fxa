import React from 'react';
import { storiesOf } from '@storybook/react';
import LoadingSpinner, { SpinnerType } from './index';
import AppLocalizationProvider from '../../lib/AppLocalizationProvider';

storiesOf('Components/LoadingSpinner', module)
  .add('default', () => (
    <AppLocalizationProvider
      baseDir="./locales"
      userLocales={navigator.languages}
    >
      <LoadingSpinner />
    </AppLocalizationProvider>
  ))
  .add('blue', () => (
    <AppLocalizationProvider
      baseDir="./locales"
      userLocales={navigator.languages}
    >
      <LoadingSpinner spinnerType={SpinnerType.Blue} />
    </AppLocalizationProvider>
  ))
  .add('white', () => (
    <AppLocalizationProvider
      baseDir="./locales"
      userLocales={navigator.languages}
    >
      <div className="bg-grey-700">
        <LoadingSpinner spinnerType={SpinnerType.White} />
      </div>
    </AppLocalizationProvider>
  ));
