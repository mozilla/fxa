import React from 'react';
import { Header } from './index';
import { LogoLockup } from '../LogoLockup';
import AppLocalizationProvider from '../../lib/AppLocalizationProvider';

export default { title: 'Components/Header' };

export const basic = () => (
  <AppLocalizationProvider
    baseDir="./locales"
    userLocales={navigator.languages}
  >
    <Header left={<div>left content</div>} right={<div>right content</div>} />
  </AppLocalizationProvider>
);

export const withLogoLockup = () => (
  <AppLocalizationProvider
    baseDir="./locales"
    userLocales={navigator.languages}
  >
    <Header
      left={<LogoLockup>Some title</LogoLockup>}
      right={<div>right content</div>}
    />
  </AppLocalizationProvider>
);
