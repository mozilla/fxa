/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LinkExternal } from 'fxa-react/components/LinkExternal';
import { DeviceLocation } from '../../../models/Account';
import { ReactComponent as WebIcon } from './web.svg';
import { ReactComponent as DesktopIcon } from './desktop.svg';
import { ReactComponent as FPNIcon } from './fpn.svg';
import { ReactComponent as MobileIcon } from './mobile.svg';
import { ReactComponent as SyncIcon } from './sync.svg';
import { ReactComponent as TabletIcon } from './tablet.svg';
import { ReactComponent as MonitorIcon } from './monitor.svg';
import { ReactComponent as PocketIcon } from '@fxa/shared/assets/images/pocket.svg';
import { ReactComponent as LockwiseIcon } from './lockwise.svg';
import { ReactComponent as RelayIcon } from './relay.svg';
import { ReactComponent as AddonIcon } from './addon.svg';
import { ReactComponent as MDNPlusIcon } from './mdnplus.svg';
import { ReactComponent as PontoonIcon } from './pontoon.svg';
import { ReactComponent as MailIcon } from './mail.svg';
import { Localized } from '@fluent/react';

export function Service({
  name,
  deviceType,
  location,
  lastAccessTimeFormatted,
  handleSignOut,
}: {
  name: string;
  deviceType: string | null;
  location: DeviceLocation;
  lastAccessTimeFormatted: string;
  handleSignOut: () => void;
}) {
  const { city, stateCode, country } = location;
  const locationProvided = Boolean(city && stateCode && country);
  let serviceLink, Icon;

  switch (name) {
    case 'Add-ons':
      serviceLink = 'https://addons.mozilla.org/';
      Icon = <AddonIcon data-testid="addon-icon" />;
      break;
    case 'Pocket':
      serviceLink = 'https://getpocket.com/';
      Icon = <PocketIcon data-testid="pocket-icon" />;
      break;
    case 'Firefox Monitor':
    case 'Mozilla Monitor':
      serviceLink = 'https://monitor.mozilla.org/';
      Icon = <MonitorIcon data-testid="monitor-icon" />;
      break;
    case 'Firefox Lockwise':
      serviceLink = 'https://www.mozilla.org/firefox/lockwise/';
      Icon = <LockwiseIcon data-testid="lockwise-icon" />;
      break;
    case 'Firefox Private Network':
      serviceLink = 'https://vpn.mozilla.org/';
      Icon = <FPNIcon data-testid="fpn-icon" />;
      break;
    case 'Firefox Relay':
    case 'Mozilla Relay':
      serviceLink = 'https://relay.firefox.com/';
      Icon = <RelayIcon data-testid="relay-icon" />;
      break;
    case 'Firefox Sync':
      serviceLink =
        'https://support.mozilla.org/kb/how-do-i-set-sync-my-computer';
      Icon = <SyncIcon data-testid="sync-icon" />;
      break;
    case 'MDN Plus':
      serviceLink = 'https://developer.mozilla.org/';
      Icon = <MDNPlusIcon data-testid="mdnplus-icon" />;
      break;
    case 'Mozilla email preferences':
      serviceLink = 'https://basket.mozilla.org/fxa/';
      Icon = <MailIcon data-testid="mail-icon" />;
      break;
    case 'Pontoon':
      serviceLink = 'https://pontoon.mozilla.org/';
      Icon = <PontoonIcon data-testid="pontoon-icon" />;
      break;
    default:
      if (name.toLowerCase().includes('ipad')) {
        Icon = <TabletIcon data-testid="tablet-icon" />;
      } else if (deviceType === 'mobile') {
        Icon = <MobileIcon data-testid="mobile-icon" />;
      } else if (deviceType === 'desktop') {
        Icon = <DesktopIcon data-testid="desktop-icon" />;
      } else {
        Icon = <WebIcon data-testid="web-icon" />;
      }
  }

  return (
    <div
      className="my-1"
      data-testid="settings-connected-service"
      data-name={name}
    >
      <div className="p-4 border-2 border-solid border-grey-100 rounded flex mobileLandscape:justify-around items-center flex-col mobileLandscape:flex-row">
        <div className="flex flex-grow w-full mobileLandscape:flex-2">
          <span className="flex px-2 w-10 justify-center items-center flex-0">
            {Icon}
          </span>
          <div className="flex flex-col flex-5 mobileLandscape:items-center mobileLandscape:flex-row">
            <div className="flex flex-col mobileLandscape:flex-2">
              {serviceLink ? (
                <LinkExternal
                  className="link-blue text-sm"
                  href={serviceLink}
                  data-testid="service-name"
                >
                  {name}
                </LinkExternal>
              ) : (
                <p className="text-sm break-word" data-testid="service-name">
                  {name}
                </p>
              )}
              {locationProvided && (
                <p
                  className="text-xs text-grey-400"
                  data-testid="service-location"
                >
                  {city}, {stateCode}, {country}
                </p>
              )}
            </div>
            <div className="flex flex-start mobileLandscape:justify-center mobileLandscape:flex-1">
              <p className="text-sm" data-testid="service-last-access">
                {lastAccessTimeFormatted}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-grow w-full mobileLandscape:justify-end mobileLandscape:flex-1">
          <Localized id="cs-sign-out-button">
            <button
              className="cta-neutral cta-base cta-base-p disabled:cursor-wait whitespace-nowrap mobileLandscape:w-auto"
              data-testid="connected-service-sign-out"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </Localized>
        </div>
      </div>
    </div>
  );
}

export default Service;
