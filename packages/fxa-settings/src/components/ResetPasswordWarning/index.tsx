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
import { Link } from 'react-router';
import { CompleteResetPasswordLocationState } from '../../pages/ResetPassword/CompleteResetPassword/interfaces';
import GleanMetrics from '../../lib/glean';

const ResetPasswordWarning = ({
  locationState,
  searchParams,
  defaultClosed = false,
}: {
  locationState: CompleteResetPasswordLocationState;
  searchParams?: string;
  defaultClosed?: boolean;
}) => {
  const ftlMsgResolver = useFtlMsgResolver();
  // component is expanded by default on desktop
  // and collapsed by default on mobile
  const defaultOpenState = !defaultClosed && window.innerWidth > 480;
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
            'password-reset-warning-icon',
            'Warning'
          )}
        />
        <p className="flex-1 font-semibold">
          <FtlMsg id="password-reset-warning-review-sign-in-options">
            Review sign-in options to keep browser data
          </FtlMsg>
        </p>
        <Chevron
          role="img"
          className={`ms-2 ${expanded ? '-rotate-180' : ''}`}
          aria-label={
            expanded
              ? ftlMsgResolver.getMsg(
                  'password-reset-chevron-expanded',
                  'Collapse warning'
                )
              : ftlMsgResolver.getMsg(
                  'password-reset-chevron-collapsed',
                  'Expand warning'
                )
          }
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
                <FtlMsg id="password-reset-warning-use-key-link-v2">
                  <Link
                    to={`/account_recovery_confirm_key${searchParams || ''}`}
                    state={locationState}
                    className="link-blue"
                    onClick={() =>
                      GleanMetrics.passwordReset.createNewRecoveryKeyMessageClick()
                    }
                  >
                    Use it to reset your password and keep your browser data
                  </Link>
                </FtlMsg>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-start gap-4">
          <IconSyncDevice role="img" className="mt-[2px]" aria-hidden={true} />
          <div className="flex flex-col flex-1 gap-1">
            <FtlMsg id="password-reset-warning-signed-in-device">
              <p className="font-semibold text-sm">
                Still signed in on another device?
              </p>
            </FtlMsg>
            <FtlMsg id="password-reset-warning-signed-in-device-description">
              <p className="text-grey-500 dark:text-grey-200">
                Your browser data may be available. Reset your password, then
                sign in on that device to restore and sync your data.
              </p>
            </FtlMsg>
            <div>
              <FtlMsg id="password-reset-warning-restore-data-link">
                <a
                  href="https://support.mozilla.org/en-US/kb/how-change-or-reset-your-mozilla-account-password"
                  className="link-blue"
                  data-glean-id="password_reset_warning_restore_data_link"
                >
                  Learn how to restore browser data from a signed-in device
                </a>
              </FtlMsg>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <IconNonSyncDevice
            role="img"
            className="mt-[2px]"
            aria-hidden={true}
          />
          <div className="flex flex-col flex-1 gap-1">
            <FtlMsg id="password-reset-warning-new-device">
              <p className="font-semibold text-sm">
                Using a new device but can’t access your old ones?
              </p>
            </FtlMsg>
            <FtlMsg id="password-reset-warning-new-device-description">
              <p className="text-grey-500 dark:text-grey-200">
                After you reset your password, encrypted browser data on Firefox
                servers won’t be available on this device.
              </p>
            </FtlMsg>
          </div>
        </div>
      </div>
    </details>
  );
};

export default ResetPasswordWarning;
