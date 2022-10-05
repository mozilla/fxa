/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import {  Router } from '@reach/router';
import Head from 'fxa-react/components/Head';
import { ExampleApp } from "../ExampleApp";
import { ScrollToTop } from '../ScrollToTop';
import AppLocalizationProvider from 'fxa-react/lib/AppLocalizationProvider';
import { FlowContext } from '../../models/FlowContext';
import SettingsApp from '../SettingsApp';

type AppProps = {
  flowQueryParams: FlowQueryParams;
  navigatorLanguages: readonly string[];
};

export const App = ({ flowQueryParams, navigatorLanguages }: AppProps) => {
  console.log("flowQueryParams: ", flowQueryParams);
  return (
    <AppLocalizationProvider
      baseDir="/settings/locales"
      bundles={['settings']}
      userLocales={navigatorLanguages}
    >
      <>
        <FlowContext.Provider value={flowQueryParams}/>
        <Head />
        <Router basepath={'/'}>
          <ScrollToTop default>
            <ExampleApp path="/test/*" />
            <SettingsApp path="/settings/*" />
          </ScrollToTop>
        </Router>
      </>
    </AppLocalizationProvider>
  );
};

export default App;
