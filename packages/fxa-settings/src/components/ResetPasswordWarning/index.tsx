/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';

import { ReactComponent as WarnIcon } from './icon-warn.svg';
import { ReactComponent as IconNonSyncDevice } from './icon-non-sync-device.svg';
import { ReactComponent as IconSyncDevice } from './icon-sync-device.svg';
import { ReactComponent as Chevron } from './chevron.svg';

import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../models';

const ResetPasswordWarning = () => {
  const ftlMsgResolver = useFtlMsgResolver();
  // component is expanded by default on desktop
  // and collapsed by default on mobile
  const defaultOpenState = window.innerWidth > 480;
  const [expanded, setExpanded] = useState(defaultOpenState);

  return (
    <details
      className="p-4 bg-orange-50 rounded-lg text-sm text-start border border-transparent"
      data-testid="warning-message-container"
      open={defaultOpenState}
      onToggle={(e) =>
        setExpanded((e.currentTarget as HTMLDetailsElement).open)
      }
    >
      {/* Arbitrary varaite [&::-webkit-details-marker]:hidden removes the list arrow on webkit based browsers */}
      <summary className="flex items-center cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <WarnIcon
          role="img"
          className="flex-initial me-4"
          aria-label={ftlMsgResolver.getMsg(
            'reset-password-warning-icon',
            'Warning'
          )}
        />
        <p className="flex-1 font-semibold">
          <FtlMsg id="password-reset-data-may-not-be-recovered">
            Your browser data may not be recovered
          </FtlMsg>
        </p>
        <Chevron
          role="img"
          className={`ms-2 ${expanded ? '-rotate-180' : ''}`}
          aria-label={expanded ? 'Collapse warning' : 'Expand warning'}
        />
      </summary>
      <div className="flex flex-col ps-8 pt-4 pb-2 gap-4">
        <div className="flex items-start gap-2">
          <IconSyncDevice
            role="img"
            className="flex-initial"
            aria-hidden={true}
          />
          <div className="flex flex-col flex-1 -mt-1 gap-1">
            <FtlMsg id="password-reset-previously-signed-in-device">
              <p className="font-semibold">
                Have a device where you previously signed in?
              </p>
            </FtlMsg>
            <p className="text-grey-500 text-xs">
              <FtlMsg id="password-reset-data-may-be-saved-locally">
                Your browser data may be locally saved on that device. Sign in
                there with your new password to restore and sync.
              </FtlMsg>
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <IconNonSyncDevice role="img" aria-hidden={true} />
          <div className="flex flex-col flex-1 -mt-1 gap-1">
            <FtlMsg id="password-reset-no-old-device">
              <p className="font-semibold">
                Have a new device but don’t have your old one?
              </p>
            </FtlMsg>
            <FtlMsg id="password-reset-encrypted-data-cannot-be-recovered">
              <p className="text-grey-500 text-xs">
                We’re sorry, but your encrypted browser data on Firefox servers
                can’t be recovered. However, you can still access your local
                data on any device where you have previously signed in.
              </p>
            </FtlMsg>
            <FtlMsg id="password-reset-learn-about-restoring-account-data">
              <a
                href="https://support.mozilla.org/kb/how-reset-your-password-without-account-recovery-keys-access-data"
                className="link-blue"
              >
                Learn more about restoring account data
              </a>
            </FtlMsg>
          </div>
        </div>
      </div>
    </details>
  );
};

export default ResetPasswordWarning;
