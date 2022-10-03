/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 import React  from 'react';
 import LinkExternal from 'fxa-react/components/LinkExternal';
 import { RouteComponentProps, Link } from '@reach/router';
 import { Localized } from '@fluent/react';

 import 'react-easy-crop/react-easy-crop.css';
import Logo from 'fxa-react/components/Logo';
import Illustration from 'fxa-react/components/Illustration';

 export const ConnectAnotherDevice = (_: RouteComponentProps) => {

   return (
     <Localized id="connect-another-device-title" attrs={{ title: true }}>
      <div
      className={`max-w-lg mx-auto p-6 pb-7 tablet:my-20 flex flex-col items-start bg-white shadow tablet:rounded-xl`}>
        <Logo className='self-center h-20 w-20 -mt-18'/>
        <div className="flex items-center flex-col w-full">
            <Illustration altText="two computers with hearts" testId="hearts" className="my-8"/>
            <p className="mb-4 text-sm text-center p-auto max-w-xs">
              Want to get your tabs, bookmarks, and passwords on another device? Now in React!!!!!!!
            </p>
            <Link
              className="cta-primary font-bold flex-1 text-base p-4 border-0 max-h-14 rounded-md w-full"
              to={''}
            >
              Connect another device
            </Link>
            <LinkExternal
            className="text-blue-500 underline text-sm mt-4"
            href="/settings">
              Not now
            </LinkExternal>
          </div>
        </div>
     </Localized>
   );
 };

 export default ConnectAnotherDevice;
