import React from 'react';
import { storiesOf } from '@storybook/react';
import LinkExternal from './index';
import AppLocalizationProvider from '../../lib/AppLocalizationProvider';

storiesOf('Components/LinkExternal', module).add('basic', () => (
  <AppLocalizationProvider
    baseDir="./locales"
    userLocales={navigator.languages}
  >
    <LinkExternal href="https://mozilla.org">
      Keep the internet open and accessible to all.
    </LinkExternal>
  </AppLocalizationProvider>
));
