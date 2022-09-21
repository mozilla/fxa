/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 import React  from 'react';
 import { RouteComponentProps } from '@reach/router';
 import { Localized } from '@fluent/react';

 import 'react-easy-crop/react-easy-crop.css';
 import FlowContainer from '../FlowContainer';

 export const PageExampleTestTwo = (_: RouteComponentProps) => {

   return (
     <Localized id="example-test-page-two-title" attrs={{ title: true }}>
       <FlowContainer title="Example Test Page Two">
        <h1>Testing testing, route 2</h1>
       </FlowContainer>
     </Localized>
   );
 };

 export default PageExampleTestTwo;
