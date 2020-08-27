/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import Avatar from '../Avatar';
import AlertBar from '../AlertBar';
import { useAccount } from '../../models';
import sentryMetrics from 'fxa-shared/lib/sentry';
import { clearSignedInAccountUid } from '../../lib/cache';
import { useClickOutsideEffect, useBooleanState } from 'fxa-react/lib/hooks';
import { useEscKeydownEffect } from '../../lib/hooks';
import { ReactComponent as SignOut } from './sign-out.svg';

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
  const [alertBarRevealed, revealAlertBar, hideAlertBar] = useBooleanState();
  const dropDownId = 'drop-down-avatar-menu';

  // TODO: FXA-2450
  const [destroySession, { data, error }] = useMutation(
    DESTROY_SESSION_MUTATION,
    {
      onError: (error) => {
        revealAlertBar();
        sentryMetrics.captureException(error);
      },
    }
  );

  const signOut = () => {
    destroySession({
      variables: { input: {} },
    });
  };

  if (data) {
    clearSignedInAccountUid();
    window.location.assign(`${window.location.origin}/signin`);
    return null;
  }

  return (
    <>
      {alertBarRevealed && error && (
        <AlertBar onDismiss={hideAlertBar} type="error">
          <p data-testid="sign-out-error">Error text TBD. {error.message}</p>
        </AlertBar>
      )}
      <div className="relative" ref={avatarMenuInsideRef}>
        <button
          onClick={toggleRevealed}
          data-testid="drop-down-avatar-menu-toggle"
          title="Firefox Account Menu"
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
            className="drop-down-menu -left-52"
          >
            <div className="flex flex-wrap">
              <div className="flex w-full p-4">
                <div className="mr-3 flex flex-1">
                  <Avatar className="w-10" />
                </div>
                <div className="flex flex-4 truncate">
                  <p className="leading-5 max-w-full truncate">
                    <span className="text-grey-400 text-xs">Signed in as</span>
                    <span
                      className="font-bold block truncate"
                      data-testid="drop-down-name-or-email"
                    >
                      {displayName || primaryEmail.email}
                    </span>
                  </p>
                </div>
              </div>
              <div className="w-full">
                <div className="bg-gradient-to-r from-blue-500 via-pink-700 to-yellow-500 h-px" />
                <div className="px-4 py-5">
                  <button
                    className="pl-3 group"
                    onClick={signOut}
                    data-testid="sign-out"
                  >
                    <SignOut
                      height="18"
                      width="18"
                      className="mr-3 inline-block stroke-current align-middle"
                    />
                    <span className="group-hover:underline">Sign out</span>
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
