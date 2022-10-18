/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 import React from 'react';
 import {  Router } from '@reach/router';
 import Head from 'fxa-react/components/Head';
 import { ScrollToTop } from '../settings/ScrollToTop';
 import AppLocalizationProvider from 'fxa-react/lib/AppLocalizationProvider';
 import { FlowContext } from '../../models/FlowContext';
 import AppSettings from '../settings/App';

 type AppProps = {
   flowQueryParams: FlowQueryParams;
   navigatorLanguages: readonly string[];
 };

 export const App = ({ flowQueryParams, navigatorLanguages }: AppProps) => {
   return (
     <AppLocalizationProvider
       baseDir="/client/locales"
       bundles={['client']}
       userLocales={navigatorLanguages}
     >
       <>
         <FlowContext.Provider value={flowQueryParams}/>
         <Head />
         <Router basepath={'/'}>
           <ScrollToTop default>
             <AppSettings path="/settings/*" />
           </ScrollToTop>
         </Router>
       </>
     </AppLocalizationProvider>
   );
 };

 export default App;
