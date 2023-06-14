/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AppLayout from '../../components/AppLayout';
import { RouteComponentProps } from '@reach/router';
import { usePageViewEvent } from '../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../constants';
import { ReactComponent as FirefoxBrowserIcon } from './browser.svg';
import { ReactComponent as MonitorIcon } from './monitor.svg';
import { ReactComponent as RelayIcon } from './relay.svg';
import { ReactComponent as VpnIcon } from './vpn.svg';
import { ReactComponent as PocketIcon } from './pocket.svg';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { FtlMsg } from 'fxa-react/lib/utils';

export const viewName = 'about';

const About = (_: RouteComponentProps) => {
 usePageViewEvent(viewName, REACT_ENTRYPOINT);

 return (
  <AppLayout>
   <FtlMsg id='about-header'>
    <div className='text-xl font-bold m-5'>Sign in to your Firefox Account to unlock</div>
   </FtlMsg>

   <ul className='text-left'>
    <LinkExternal href='https://www.mozilla.org/firefox/browsers/'>
     <li className='mt-8'><FirefoxBrowserIcon /></li>
    </LinkExternal>

    <FtlMsg id='about-firefox-browser-send-tab'>
     <li className='text-sm ml-12 list-disc'>Send a tab to a different device</li>
    </FtlMsg>
    <LinkExternal
     className='link-blue'
     href='https://www.mozilla.org/firefox/features/password-manager/'
    >
     <li className='text-sm ml-12 list-disc'>
      <FtlMsg id='about-firefox-browser-save-and-sync-passwords'>Save and sync passwords</FtlMsg>
     </li>
    </LinkExternal>

    <LinkExternal href='https://monitor.firefox.com/'>
     <li className='mt-8'><MonitorIcon /></li>
    </LinkExternal>

    <FtlMsg id='about-monitor-description'>
     <li className='text-sm ml-12 list-disc'>Get email alerts when your info appears in a known data breach</li>
    </FtlMsg>

    <LinkExternal href='https://relay.firefox.com/'>
     <li className='mt-8'><RelayIcon /></li>
    </LinkExternal>

    <FtlMsg id='about-relay-description'>
     <li className='text-sm ml-12 list-disc'>Protect your identity with secure phone and email masking</li>
    </FtlMsg>
    <FtlMsg id='about-relay-description-2'>
     <li className='text-sm ml-12 list-disc'>We never log, track, or share your network data</li>
    </FtlMsg>

    <LinkExternal href='https://vpn.mozilla.org/'>
     <li className='mt-8'><VpnIcon /></li>
    </LinkExternal>

    <FtlMsg id='about-vpn-description'>
     <li className='text-sm ml-12 list-disc'>Encrypt your network activity and hide your IP address</li>
    </FtlMsg>
    <FtlMsg id='about-vpn-description-2'>
     <li className='text-sm ml-12 list-disc'>We never log, track, or share your network data</li>
    </FtlMsg>

    <LinkExternal href='https://getpocket.com/'>
     <li className='mt-8'><PocketIcon /></li>
    </LinkExternal>

    <FtlMsg id='about-pocket-description'>
     <li className='text-sm ml-12 list-disc'>Save articles from across the web</li>
    </FtlMsg>

    <FtlMsg id='about-pocket-description-2'>
     <li className='text-sm ml-12 list-disc'>Read in a quiet, private space</li>
    </FtlMsg>
   </ul>

   <FtlMsg id='about-footer'>
    <div className='text-m mt-8'>Get it all on every device, without feeling trapped in a single operating system.</div>
   </FtlMsg>

   <FtlMsg id='about-sign-in'>
    <LinkExternal href='/signin' className='button cta-primary cta-xl w-full my-4'>
     Sign in
    </LinkExternal>
   </FtlMsg>

  </AppLayout>
 );
};

export default About;
