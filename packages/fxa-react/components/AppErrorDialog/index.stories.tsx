import React from 'react';
import AppErrorDialog from './index';
import AppLocalizationProvider from '../../lib/AppLocalizationProvider';

export default { title: 'Components/AppErrorDialog' };
export const basic = () => (
  <AppLocalizationProvider
    baseDir="./locales"
    userLocales={navigator.languages}
  >
    <AppErrorDialog error={new Error('Uh oh!')} />
  </AppLocalizationProvider>
);
