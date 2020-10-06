/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LinkExternal } from 'fxa-react/components/LinkExternal';
import { DeviceLocation } from '../../models/Account';
import { ReactComponent as WebIcon } from './web.svg';
import { ReactComponent as DesktopIcon } from './desktop.svg';
import { ReactComponent as TabletIcon } from './tablet.svg';
import { ReactComponent as MobileIcon } from './mobile.svg';
import { ReactComponent as LockwiseIcon } from './lockwise.svg';
import { ReactComponent as PocketIcon } from './pocket.svg';
import { ReactComponent as MonitorIcon } from './monitor.svg';
import { ReactComponent as SyncIcon } from './sync.svg';
import { ReactComponent as FPNIcon } from './fpn.svg';

export function Service({
  name,
  deviceType,
  location,
  lastAccessTimeFormatted,
  canSignOut,
}: {
  name: string;
  deviceType: string;
  location: DeviceLocation;
  lastAccessTimeFormatted: string;
  canSignOut: boolean;
}) {
  const { city, stateCode, country } = location;
  const locationProvided = Boolean(city && stateCode && country);
  const isPocket = name === 'Pocket';
  const isMonitor = name === 'Firefox Monitor';
  const isLockwise = name === 'Firefox Lockwise';
  const isSync = name === 'Firefox Sync';
  const isFPN = name === 'Firefox Private Network';

  const renderLink = isPocket || isMonitor || isLockwise || isSync || isFPN;
  let serviceLink = '';
  let iconSvg = <WebIcon data-testid="web-icon" />;

  if (renderLink) {
    if (isPocket) {
      serviceLink = 'https://www.mozilla.org/en-US/firefox/pocket/';
      iconSvg = <PocketIcon data-testid="pocket-icon" />;
    } else if (isMonitor) {
      serviceLink = 'https://monitor.firefox.com/';
      iconSvg = <MonitorIcon data-testid="monitor-icon" />;
    } else if (isLockwise) {
      serviceLink = 'https://www.mozilla.org/en-US/firefox/lockwise/';
      iconSvg = <LockwiseIcon data-testid="lockwise-icon" />;
    } else if (isSync) {
      serviceLink =
        'https://support.mozilla.org/en-US/kb/how-do-i-set-sync-my-computer';
      iconSvg = <SyncIcon data-testid="sync-icon" />;
    } else if (isFPN) {
      serviceLink = 'https://vpn.mozilla.com/';
      iconSvg = <FPNIcon data-testid="fpn-icon" />;
    }
  } else {
    const lowerName = name.toLowerCase();
    if (deviceType === 'mobile') {
      iconSvg = <MobileIcon data-testid="mobile-icon" />;
    }
    if (lowerName.includes('ipad')) {
      iconSvg = <TabletIcon data-testid="tablet-icon" />;
    } else if (deviceType === 'desktop') {
      iconSvg = <DesktopIcon data-testid="desktop-icon" />;
    }
  }

  return (
    <div className="my-1" id="service" data-testid="settings-connected-service">
      <div className="p-4 border-2 border-solid border-grey-100 rounded flex mobileLandscape:justify-around items-center flex-col mobileLandscape:flex-row">
        <div className="flex flex-grow w-full mobileLandscape:flex-2">
          <span className="flex px-2 w-10 justify-center items-center flex-0">
            {iconSvg}
          </span>
          <div className="flex flex-col flex-5 mobileLandscape:items-center mobileLandscape:flex-row">
            <div className="flex flex-col mobileLandscape:flex-2">
              {renderLink ? (
                <LinkExternal
                  className="link-blue text-sm"
                  href={serviceLink}
                  data-testid="service-name"
                >
                  {name}
                </LinkExternal>
              ) : (
                <p className="text-xs" data-testid="service-name">
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
          {canSignOut && (
            <button
              className="cta-neutral cta-base disabled:cursor-wait whitespace-no-wrap"
              data-testid="connected-service-sign-out"
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Service;
