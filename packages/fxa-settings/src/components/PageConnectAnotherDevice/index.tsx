/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 import React  from 'react';
 import { RouteComponentProps } from '@reach/router';
 import { Localized } from '@fluent/react';

 import 'react-easy-crop/react-easy-crop.css';
 import FlowContainer from '../FlowContainer';

 export const ConnectAnotherDevice = (_: RouteComponentProps) => {

   return (
     <Localized id="connect-another-device-title" attrs={{ title: true }}>
       <FlowContainer title="Connect Another Device">
        <h1>Connect Another Device</h1>
       </FlowContainer>
     </Localized>
   );
 };

 export default ConnectAnotherDevice;
