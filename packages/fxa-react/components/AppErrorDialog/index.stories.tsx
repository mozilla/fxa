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
      <AppErrorDialog errorType="general" errors={['Some general error']} />
    </AppLocalizationProvider>
  ))
  .add('invalid query parameters', () => (
    <AppLocalizationProvider
      baseDir="./locales"
      userLocales={navigator.languages}
    >
      <AppErrorDialog
        errorType="query-parameter-violation"
        errors={[
          `Query parameter 'service' must be provided`,
          `Query parameter 'client_id' must be provided`,
        ]}
      />
    </AppLocalizationProvider>
  ));
