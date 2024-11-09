import React from 'react';
import LoadingSpinner, { SpinnerType } from './index';
import AppLocalizationProvider from '../../lib/AppLocalizationProvider';

export default { title: 'Components/LoadingSpinner' };
export const basic = () => (
  <AppLocalizationProvider
    baseDir="./locales"
    userLocales={navigator.languages}
  >
    <LoadingSpinner />
  </AppLocalizationProvider>
);
export const blue = () => (
  <AppLocalizationProvider
    baseDir="./locales"
    userLocales={navigator.languages}
  >
    <LoadingSpinner spinnerType={SpinnerType.Blue} />
  </AppLocalizationProvider>
);

export const white = () => (
  <AppLocalizationProvider
    baseDir="./locales"
    userLocales={navigator.languages}
  >
    <div className="bg-grey-700">
      <LoadingSpinner spinnerType={SpinnerType.White} />
    </div>
  </AppLocalizationProvider>
);
