import React from 'react';
import LinkExternal from './index';
import AppLocalizationProvider from '../../lib/AppLocalizationProvider';

export default { title: 'Components/LinkExternal' };
export const basic = () => (
  <AppLocalizationProvider
    baseDir="./locales"
    userLocales={navigator.languages}
  >
    <LinkExternal href="https://mozilla.org">
      Keep the internet open and accessible to all.
    </LinkExternal>
  </AppLocalizationProvider>
);
