/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { gql } from '@apollo/client';
import Avatar from '../Avatar';
import AlertBar from '../AlertBar';
import { useAccount } from '../../models';
import { clearSignedInAccountUid } from '../../lib/cache';
import { useClickOutsideEffect } from 'fxa-react/lib/hooks';
import { useEscKeydownEffect, useMutation, useAlertBar } from '../../lib/hooks';
import { ReactComponent as SignOut } from './sign-out.svg';
import { logViewEvent, settingsViewName } from 'fxa-settings/src/lib/metrics';
import { Localized, useLocalization } from '@fluent/react';

export const DESTROY_SESSION_MUTATION = gql`
  mutation destroySession($input: DestroySessionInput!) {
    destroySession(input: $input) {
      clientMutationId
    }
  }
`;

export const DropDownAvatarMenu = () => {
  const { displayName, primaryEmail } = useAccount();
  const [isRevealed, setRevealed] = useState(false);
  const toggleRevealed = () => setRevealed(!isRevealed);
  const avatarMenuInsideRef = useClickOutsideEffect<HTMLDivElement>(
    setRevealed
  );
  useEscKeydownEffect(setRevealed);
  const alertBar = useAlertBar();
  const dropDownId = 'drop-down-avatar-menu';
  const { l10n } = useLocalization();

  const [destroySession] = useMutation(DESTROY_SESSION_MUTATION, {
    onCompleted: () => {
      // cannot use a hook here since this callback is not called in a hook
      clearSignedInAccountUid();
      window.location.assign(`${window.location.origin}/signin`);
      logViewEvent(settingsViewName, 'signout.success');
    },
    onError: (error) => {
      alertBar.error(l10n.getString('drop-down-menu-sign-out-error'));
    },
  });

  const signOut = () => {
    destroySession({
      variables: { input: {} },
    });
  };

  return (
    <>
      {alertBar.visible && (
        <AlertBar onDismiss={alertBar.hide} type={alertBar.type}>
          <p data-testid="sign-out-error">{alertBar.content}</p>
        </AlertBar>
      )}
      <div className="relative" ref={avatarMenuInsideRef}>
        <button
          type="button"
          onClick={toggleRevealed}
          data-testid="drop-down-avatar-menu-toggle"
          title={l10n.getString('drop-down-menu-title')}
          aria-expanded={isRevealed}
          aria-controls={dropDownId}
          className="rounded-full border-2 border-transparent hover:border-purple-500 focus:border-purple-500 focus:outline-none active:border-purple-700 transition-standard"
        >
          <Avatar className="w-10 rounded-full" />
        </button>
        {isRevealed && (
          <div
            id={dropDownId}
            data-testid={dropDownId}
            className="drop-down-menu ltr:-left-52 rtl:-right-52"
          >
            <div className="flex flex-wrap">
              <div className="flex w-full p-4 items-center">
                <div className="ltr:mr-3 rtl:ml-3 flex-none">
                  <Avatar className="w-10" />
                </div>
                <Localized
                  id="drop-down-menu-signed-in-as"
                  vars={{ user: displayName || primaryEmail.email }}
                  elems={{
                    user: (
                      <span
                        className="font-bold block truncate"
                        data-testid="drop-down-name-or-email"
                      ></span>
                    ),
                    signin: <span className="text-grey-400 text-xs"></span>,
                  }}
                >
                  <p className="leading-5 max-w-full truncate">
                    <span className="text-grey-400 text-xs">Signed in as</span>
                    <span
                      className="font-bold block truncate"
                      data-testid="drop-down-name-or-email"
                    >
                      {displayName || primaryEmail.email}
                    </span>
                  </p>
                </Localized>
              </div>
              <div className="w-full">
                <div className="bg-gradient-to-r from-blue-500 via-pink-700 to-yellow-500 h-px" />
                <div className="px-4 py-5">
                  <button
                    className="pl-3 group"
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
