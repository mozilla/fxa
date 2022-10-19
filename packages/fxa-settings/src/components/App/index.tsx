import React from 'react';
 import {  RouteComponentProps, Router } from '@reach/router';
 import Head from 'fxa-react/components/Head';
 import { ScrollToTop } from '../../Settings/components/ScrollToTop';
 import AppSettings from '../../Settings/components/App';

 export const App = (props: RouteComponentProps) => {
   return (
       <>
         <Head />
         <Router basepath={'/'}>
           <ScrollToTop default>
             <AppSettings path="/settings/*" />
           </ScrollToTop>
         </Router>
       </>
   );
 };

 export default App;
