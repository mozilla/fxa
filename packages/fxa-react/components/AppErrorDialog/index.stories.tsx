import React from 'react';
import { storiesOf } from '@storybook/react';
import AppErrorDialog from './index';
import AppLocalizationProvider from '../../lib/AppLocalizationProvider';

storiesOf('Components/AppErrorDialog', module).add('basic', () => (
  <AppLocalizationProvider
    baseDir="./locales"
    userLocales={navigator.languages}
  >
    <AppErrorDialog />
  </AppLocalizationProvider>
));
