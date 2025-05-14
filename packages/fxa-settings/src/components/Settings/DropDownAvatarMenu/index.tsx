/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import Avatar from '../Avatar';
import { useAccount, useAlertBar, useSession } from '../../../models';
import { useClickOutsideEffect } from 'fxa-react/lib/hooks';
import { useEscKeydownEffect } from '../../../lib/hooks';
import { ReactComponent as SignOut } from './sign-out.svg';
import { logViewEvent, settingsViewName } from '../../../lib/metrics';
import { Localized, useLocalization } from '@fluent/react';
import firefox from '../../../lib/channels/firefox';
import { FtlMsg } from 'fxa-react/lib/utils';

export const DropDownAvatarMenu = () => {
  const { displayName, primaryEmail, avatar, uid } = useAccount();
  const session = useSession();
  const [isRevealed, setRevealed] = useState(false);
  const toggleRevealed = () => setRevealed(!isRevealed);
  const avatarMenuInsideRef =
    useClickOutsideEffect<HTMLDivElement>(setRevealed);
  useEscKeydownEffect(setRevealed);
  const alertBar = useAlertBar();
  const dropDownId = 'drop-down-avatar-menu';
  const { l10n } = useLocalization();
  const dropDownMenuTitle = l10n.getString(
    'drop-down-menu-title-2',
    null,
    'Mozilla account menu'
  );

  const signOut = async () => {
    if (session.destroy) {
      try {
        await session.destroy();

        // Send a logout event to Firefox even if the user is in a non-Sync flow.
        // If the user is signed into the browser, they need to drop the now
        // destroyed session token.
        firefox.fxaLogout({ uid });

        logViewEvent(settingsViewName, 'signout.success');
        window.location.assign(window.location.origin);
      } catch (e) {
        alertBar.error(
          l10n.getString(
            'drop-down-menu-sign-out-error-2',
            null,
            'Sorry, there was a problem signing you out'
          )
        );
      }
    }
  };

  return (
    <>
      <div className="relative" ref={avatarMenuInsideRef}>
        <button
          onClick={toggleRevealed}
          data-testid="drop-down-avatar-menu-toggle"
          title={dropDownMenuTitle}
          aria-label={dropDownMenuTitle}
          aria-expanded={!!isRevealed}
          aria-haspopup="menu"
          className="rounded-full border border-transparent hover:border-purple-500 active:border-purple-700 transition-standard focus-visible-default focus-visible:border-transparent"
        >
          <Avatar className="w-10 rounded-full" {...{ avatar }} />
        </button>
        {isRevealed && (
          <div
            id={dropDownId}
            data-testid={dropDownId}
            className="drop-down-menu ltr:-left-52 rtl:-right-52"
            role="menu"
          >
            <div className="flex flex-wrap">
              <div className="flex w-full p-4 items-center">
                <div className="ltr:mr-3 rtl:ml-3 flex-none">
                  <Avatar className="w-10" {...{ avatar }} />
                </div>
                <p className="leading-5 max-w-full truncate">
                  <FtlMsg id="drop-down-menu-signed-in-as-v2">
                    <span className="text-grey-400 text-xs">Signed in as</span>
                  </FtlMsg>
                  <span
                    className="font-bold block truncate"
                    data-testid="drop-down-name-or-email"
                  >
                    {displayName || primaryEmail.email}
                  </span>
                </p>
              </div>
              <div className="w-full">
                <div className="bg-gradient-to-r from-blue-500 via-pink-700 to-yellow-500 h-px" />
                <div className="px-4 py-5">
                  <button
                    className="ml-3 group rounded-sm focus-visible-default outline-offset-2"
                    onClick={signOut}
                    data-testid="avatar-menu-sign-out"
                  >
                    <SignOut
                      height="18"
                      width="18"
                      className="ltr:mr-3 rtl:ml-3 inline-block stroke-current align-middle transform rtl:-scale-x-1"
                    />
                    <Localized id="drop-down-menu-sign-out">
                      <span className="group-hover:underline">Sign out</span>
                    </Localized>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DropDownAvatarMenu;
