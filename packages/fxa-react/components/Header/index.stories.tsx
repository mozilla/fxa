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
