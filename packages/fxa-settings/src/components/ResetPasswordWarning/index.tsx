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
import { Link } from '@reach/router';
import { CompleteResetPasswordLocationState } from '../../pages/ResetPassword/CompleteResetPassword/interfaces';
import GleanMetrics from '../../lib/glean';

const ResetPasswordWarning = ({
  locationState,
  searchParams,
}: {
  locationState: CompleteResetPasswordLocationState;
  searchParams?: string;
}) => {
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
      {/* Arbitrary variant [&::-webkit-details-marker]:hidden removes the list arrow on webkit based browsers */}
      <summary className="flex items-center cursor-pointer list-none [&::-webkit-details-marker]:hidden rounded-sm focus-visible-default outline-offset-2">
        <WarnIcon
          role="img"
          className="me-4"
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
      <div className="flex flex-col pt-4 pb-2 gap-4 text-xs leading-snug">
        {locationState.recoveryKeyExists !== false && (
          <div className="flex">
            <IconSyncDevice
              role="img"
              className="me-4 mt-[2px]"
              aria-hidden={true}
            />
            <div className="flex flex-col flex-1 gap-1">
              <FtlMsg id="password-reset-warning-have-key">
                <p className="font-semibold text-sm">
                  Have an account recovery key?
                </p>
              </FtlMsg>
              <div>
                <FtlMsg id="password-reset-warning-use-key-link">
                  <Link
                    to={`/account_recovery_confirm_key${searchParams || ''}`}
                    state={locationState}
                    className="link-blue"
                    onClick={() =>
                      GleanMetrics.passwordReset.createNewRecoveryKeyMessageClick()
                    }
                  >
                    Use it now to reset your password and keep your data
                  </Link>
                </FtlMsg>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-start gap-4">
          <IconSyncDevice role="img" className="mt-[2px]" aria-hidden={true} />
          <div className="flex flex-col flex-1 gap-1">
            <FtlMsg id="password-reset-previously-signed-in-device-2">
              <p className="font-semibold text-sm">
                Have any device where you previously signed in?
              </p>
            </FtlMsg>
            <FtlMsg id="password-reset-data-may-be-saved-locally-2">
              <p className="text-grey-500">
                Your browser data might be saved on that device. Reset your
                password, then sign in there to restore and sync your data.
              </p>
            </FtlMsg>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <IconNonSyncDevice
            role="img"
            className="mt-[2px]"
            aria-hidden={true}
          />
          <div className="flex flex-col flex-1 gap-1">
            <FtlMsg id="password-reset-no-old-device-2">
              <p className="font-semibold text-sm">
                Have a new device but don’t have access to any of your previous
                ones?
              </p>
            </FtlMsg>
            <FtlMsg id="password-reset-encrypted-data-cannot-be-recovered-2">
              <p className="text-grey-500">
                We’re sorry, but your encrypted browser data on Firefox servers
                can’t be recovered.
              </p>
            </FtlMsg>
            <div>
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
      </div>
    </details>
  );
};

export default ResetPasswordWarning;
