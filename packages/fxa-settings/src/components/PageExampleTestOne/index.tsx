/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 import React  from 'react';
 import { RouteComponentProps, Link } from '@reach/router';
 import { Localized } from '@fluent/react';

 import 'react-easy-crop/react-easy-crop.css';
 import FlowContainer from '../FlowContainer';

 export const PageExampleTestOne = (_: RouteComponentProps) => {

   return (
     <Localized id="example-test-page-one-title" attrs={{ title: true }}>
       <FlowContainer title="Example Test Page One">
        <h1>Testing testing, route 1</h1>
        <Link to="/settings">click on this text to go back to the Settings app</Link><br/>
        <Link to="/test/two">click on this text to see another example page with a subroute</Link>
       </FlowContainer>
     </Localized>
   );
 };

 export default PageExampleTestOne;
