/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Footer from 'fxa-react/components/Footer';
import React from 'react';
import { useConfig } from '../../../models/hooks';
import { LocaleToggle } from '../../LocaleToggle';
import { AlertBar } from '../AlertBar';
import ContentSkip from '../ContentSkip';
import HeaderLockup from '../HeaderLockup';

type SettingsLayoutProps = {
  children: React.ReactNode;
};

export const SettingsLayout = ({ children }: SettingsLayoutProps) => {
  const config = useConfig();

  return (
    <div
      className="flex flex-col justify-between min-h-screen"
      data-testid="app"
    >
      <ContentSkip />
      <div id="body-top" className="hidden mobileLandscape:block" />
      <HeaderLockup />
      <div className="max-w-screen-desktopXl flex-1 w-full mx-auto tablet:px-20 desktop:px-12">
        <main id="main" data-testid="main" className="w-full">
          <AlertBar />
          {children}
        </main>
      </div>
      <Footer
        showLocaleToggle={config.featureFlags?.showLocaleToggle}
        localeToggleComponent={LocaleToggle}
      />
      <div id="body-bottom" className="block mobileLandscape:hidden" />
    </div>
  );
};

export default SettingsLayout;
