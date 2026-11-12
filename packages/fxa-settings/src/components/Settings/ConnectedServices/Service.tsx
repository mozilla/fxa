/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LinkExternal } from 'fxa-react/components/LinkExternal';
import { DeviceLocation } from '../../../models/Account';
import { OAUTH_NATIVE_CLIENT_IDS } from '@fxa/accounts/oauth';
import { ReactComponent as WebIcon } from './web.svg';
import { ReactComponent as DesktopIcon } from './desktop.svg';
import { ReactComponent as FPNIcon } from './fpn.svg';
import { ReactComponent as MobileIcon } from './mobile.svg';
import { ReactComponent as SyncIcon } from './sync.svg';
import { ReactComponent as TabletIcon } from './tablet.svg';
import { ReactComponent as MonitorIcon } from './monitor.svg';
import { ReactComponent as LockwiseIcon } from './lockwise.svg';
import { ReactComponent as RelayIcon } from './relay.svg';
import { ReactComponent as AddonIcon } from './addon.svg';
import { ReactComponent as MDNPlusIcon } from './mdnplus.svg';
import { ReactComponent as PontoonIcon } from './pontoon.svg';
import { ReactComponent as MailIcon } from './mail.svg';
import { Localized } from '@fluent/react';
import classNames from 'classnames';

const SCOPE_RELAY = 'https://identity.mozilla.com/apps/relay';
const SCOPE_VPN = 'https://identity.mozilla.com/apps/vpn';

interface ScopeService {
  name: string;
  icon: React.ReactNode;
  ftlId?: string;
}

function getScopeServices(scope: string[] | null): ScopeService[] {
  if (!scope) return [];
  const services: ScopeService[] = [];
  for (const individualScope of scope) {
    // TODO: We will add other `service=` flows here when they have
    // switched to refresh tokens and we will allow revoking
    // scope later. For now, just display Relay and VPN read-only.
    switch (individualScope) {
      case SCOPE_RELAY:
        services.push({
          name: 'Firefox Relay',
          icon: <RelayIcon data-testid="scope-relay-icon" />,
        });
        break;
      case SCOPE_VPN:
        services.push({
          name: 'Firefox’s built-in VPN',
          icon: <FPNIcon data-testid="scope-vpn-icon" />,
          ftlId: 'cs-scope-firefox-vpn',
        });
        break;
    }
  }
  return services;
}

const iconClasses =
  'flex w-10 justify-center items-center flex-0 text-grey-700 dark:text-grey-100 nova:text-default';
// Nova device row: icon tile, then name, meta and action 16px apart.
const novaIconTileClasses =
  'nova:w-10 nova:h-10 nova:shrink-0 nova:bg-canvas nova:rounded nova:px-0';

export function Service({
  name,
  deviceType,
  location,
  lastAccessTimeFormatted,
  clientId,
  scope,
  handleSignOut,
}: {
  name: string;
  deviceType: string | null;
  location: DeviceLocation;
  lastAccessTimeFormatted: string;
  clientId: string;
  scope: string[] | null;
  handleSignOut: () => void;
}) {
  const { city, stateCode, country } = location;
  const locationProvided = Boolean(city && stateCode && country);
  const isNativeClient = OAUTH_NATIVE_CLIENT_IDS.has(clientId);
  const scopeServices = isNativeClient ? getScopeServices(scope) : [];

  let serviceLink, Icon;

  switch (name) {
    case 'Add-ons':
      serviceLink = 'https://addons.mozilla.org/';
      Icon = <AddonIcon data-testid="addon-icon" />;
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
      className="my-1 nova:my-2"
      data-testid="settings-connected-service"
      data-name={name}
    >
      <div className="border-2 border-solid border-grey-100 dark:border-grey-700 rounded nova:border nova:border-deemphasized nova:rounded-xl nova:overflow-hidden">
        <div className="p-4 flex mobileLandscape:justify-around items-center flex-col mobileLandscape:flex-row nova:gap-4">
          <div className="flex flex-grow w-full mobileLandscape:flex-2 nova:gap-4">
            <span
              className={classNames(iconClasses, 'px-2', novaIconTileClasses)}
            >
              {Icon}
            </span>
            <div className="flex flex-col flex-5 mobileLandscape:items-center mobileLandscape:flex-row nova:gap-x-4">
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
                    className="text-xs text-deemphasized"
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
                className="cta-neutral cta-base cta-base-p disabled:cursor-wait whitespace-nowrap mobileLandscape:w-auto nova:py-1.5"
                data-testid="connected-service-sign-out"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </Localized>
          </div>
        </div>
        {scopeServices.map((scopeService, index) => (
          <div
            key={scopeService.name}
            className={classNames(
              'px-4 py-2 bg-grey-50 dark:bg-grey-600 nova:bg-transparent flex items-center',
              index > 0 &&
                'border-t border-grey-100 dark:border-grey-500 nova:border-divider'
            )}
            data-testid="scope-service"
          >
            <span className={classNames(iconClasses, 'px-3')}>
              {scopeService.icon}
            </span>
            {scopeService.ftlId ? (
              <Localized id={scopeService.ftlId}>
                <p className="text-sm text-grey-600 dark:text-grey-200 nova:text-deemphasized">
                  {scopeService.name}
                </p>
              </Localized>
            ) : (
              <p className="text-sm text-grey-600 dark:text-grey-200 nova:text-deemphasized">
                {scopeService.name}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Service;
