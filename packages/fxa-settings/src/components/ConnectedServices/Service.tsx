/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';

import { LinkExternal } from 'fxa-react/components/LinkExternal';
import { useBooleanState } from 'fxa-react/lib/hooks';

import { Checkbox } from '../Checkbox';
import { DeviceLocation } from '../../models/Account';
import { Icon } from './Icon';
import { Modal } from '../Modal';
import { useAlertBar } from '../../lib/hooks';
import { VerifiedSessionGuard } from '../VerifiedSessionGuard';

export function Service({
  name,
  deviceType,
  location,
  lastAccessTimeFormatted,
  canSignOut,
}: {
  name: string;
  deviceType: string | null;
  location: DeviceLocation;
  lastAccessTimeFormatted: string;
  canSignOut: boolean;
}) {
  const alertBar = useAlertBar();
  const { city, stateCode, country } = location;
  const locationProvided = Boolean(city && stateCode && country);
  let serviceLink, iconName;
  const [modalRevealed, revealModal, hideModal] = useBooleanState();

  switch (name) {
    case 'Pocket':
      serviceLink = 'https://www.mozilla.org/en-US/firefox/pocket/';
      iconName = 'pocket';
      break;
    case 'Firefox Monitor':
      serviceLink = 'https://monitor.firefox.com/';
      iconName = 'monitor';
      break;
    case 'Firefox Lockwise':
      serviceLink = 'https://www.mozilla.org/en-US/firefox/lockwise/';
      iconName = 'lockwise';
      break;
    case 'Firefox Private Network':
      serviceLink = 'https://vpn.mozilla.com/';
      iconName = 'fpn';
      break;
    case 'Firefox Sync':
      serviceLink =
        'https://support.mozilla.org/en-US/kb/how-do-i-set-sync-my-computer';
      iconName = 'sync';
      break;
    default:
      if (name.toLowerCase().includes('ipad')) {
        iconName = 'tablet';
      } else if (deviceType === 'mobile') {
        iconName = 'mobile';
      } else if (deviceType === 'desktop') {
        iconName = 'desktop';
      } else {
        iconName = 'web';
      }
  }

  return (
    <div className="my-1" id="service" data-testid="settings-connected-service">
      <div className="p-4 border-2 border-solid border-grey-100 rounded flex mobileLandscape:justify-around items-center flex-col mobileLandscape:flex-row">
        <div className="flex flex-grow w-full mobileLandscape:flex-2">
          <span className="flex px-2 w-10 justify-center items-center flex-0">
            <Icon name={iconName} />
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
              onClick={revealModal}
            >
              Sign out
            </button>
          )}
        </div>
        {modalRevealed && (
          <VerifiedSessionGuard
            onDismiss={hideModal}
            onError={(error) => {
              hideModal();
              alertBar.error(
                'Sorry, there was a problem verifying your session',
                error
              );
            }}
          >
            <Modal
              onDismiss={hideModal}
              onConfirm={hideModal} /* to be implemented in a later issue */
              confirmBtnClassName="cta-primary"
              confirmText="Sign Out"
              headerId="connected-services-sign-out-header"
              descId="connected-services-sign-out-description"
            >
              <h2
                id="connected-services-sign-out-header"
                className="font-bold text-xl text-center mb-2"
                data-testid="connected-services-modal-header"
              >
                Disconnect from Sync
              </h2>

              <p id="sign-out-desc" className="my-4 text-center">
                Your browsing data will remain on your device ({name}), but it
                will no longer sync with your account.
              </p>

              <p className="my-4 text-center">
                What's the main reason for disconnecting this device?
              </p>

              <ul className="my-4 ltr:text-left rtl:text-right">
                The device is:
                <li className="my-2">
                  <Checkbox {...{ label: 'Suspicious' }} />
                </li>
                <li className="my-2">
                  <Checkbox {...{ label: 'Lost or Stolen' }} />
                </li>
                <li className="my-2">
                  <Checkbox {...{ label: 'Old or replaced' }} />
                </li>
                <li className="my-2">
                  <Checkbox {...{ label: 'Duplicate' }} />
                </li>
                <li className="my-2">
                  <Checkbox {...{ label: 'Rather not say' }} />
                </li>
              </ul>
            </Modal>
          </VerifiedSessionGuard>
        )}
      </div>
    </div>
  );
}

export default Service;
