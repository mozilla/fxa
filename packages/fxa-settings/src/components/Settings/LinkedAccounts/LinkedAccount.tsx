/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';

import { Localized } from '@fluent/react';
import { ReactComponent as GoogleIcon } from './google.svg';
import { ReactComponent as AppleIcon } from './apple.svg';
import { Modal } from '../Modal';
import { useAccount, useFtlMsgResolver } from '../../../models';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { useLocation } from '@reach/router';
import { useNavigateWithQuery as useNavigate } from '../../../lib/hooks/useNavigateWithQuery';
import { SETTINGS_PATH } from '../../../constants';
import {
  LinkedAccountProviderIds,
  UnlinkAccountLocationState,
} from '../../../lib/types';
import GleanMetrics from '../../../lib/glean';

export function LinkedAccount({
  providerId,
}: {
  providerId: LinkedAccountProviderIds;
}) {
  const account = useAccount();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigate = useNavigate();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: UnlinkAccountLocationState;
  };
  const { wantsUnlinkProviderId } = location.state || {};

  // Open the modal by default if the location state contains this provider ID.
  // This means the user previously did not have a password, attempted to unlink
  // their third party account, and created their password successfully.
  const [confirmUnlinkModalRevealed, revealUnlinkModal, hideUnlinkModal] =
    useBooleanState(
      wantsUnlinkProviderId === providerId && account.hasPassword
    );

  // Keep the user where they were, but update router state
  const resetLocationState = () =>
    navigate(SETTINGS_PATH + '#linked-accounts', {
      replace: true,
      state: { wantsUnlinkProviderId: undefined },
    });

  const onConfirmUnlinkAccountClick = async () => {
    if (account.hasPassword) {
      // If wantsUnlinkProviderId is truthy, the user was taken to create password page,
      // created a password, then taken back here with modal open
      const eventReason = wantsUnlinkProviderId
        ? {
            event: { reason: 'create_password' },
          }
        : undefined;

      switch (providerId) {
        case 1:
          GleanMetrics.accountPref.googleUnlinkSubmitConfirm(eventReason);
          break;
        case 2:
          GleanMetrics.accountPref.appleUnlinkSubmitConfirm(eventReason);
          break;
        default:
          break;
      }
      await account.unlinkThirdParty(providerId);
      resetLocationState();
    } else {
      // If a user doesn't have a password, they must create one first. We send
      // a navigation state that's passed back to Settings on password create
      // success that we account for here by automatically re-opening the modal.
      navigate(SETTINGS_PATH + '/create_password', {
        state: { wantsUnlinkProviderId: providerId },
      });
    }
  };

  const onModalDismiss = () => {
    hideUnlinkModal();
    resetLocationState();
  };

  const onUnlinkAccountClick = () => {
    const eventReason = !account.hasPassword
      ? {
          event: { reason: 'create_password' },
        }
      : undefined;

    switch (providerId) {
      case 1:
        GleanMetrics.accountPref.googleUnlinkSubmit(eventReason);
        break;
      case 2:
        GleanMetrics.accountPref.appleUnlinkSubmit(eventReason);
        break;
      default:
        break;
    }
    revealUnlinkModal();
  };

  const unlinkConfirmText = () => {
    return account.hasPassword
      ? ftlMsgResolver.getMsg('la-unlink-account-button', 'Unlink')
      : ftlMsgResolver.getMsg('la-set-password-button', 'Set Password');
  };

  return (
    <div
      className="my-1"
      data-testid="settings-linked-account"
      data-name={providerId}
    >
      <div className="p-4 border-2 border-solid border-grey-100 rounded flex mobileLandscape:justify-around items-center flex-col mobileLandscape:flex-row">
        <div className="flex flex-grow w-full mobileLandscape:flex-2">
          <span className="flex justify-center items-center flex-0">
            {providerId === 1 && <GoogleIcon role="img" aria-label="Google" />}
            {providerId === 2 && <AppleIcon role="img" aria-label="Apple" />}
          </span>
          <div className="flex flex-col flex-5 mobileLandscape:items-center mobileLandscape:flex-row justify-center">
            <div className="flex flex-col mobileLandscape:flex-2">
              <p className="text-xs break-word" data-testid="provider-name">
                {providerId === 1 && 'Google'}
                {providerId === 2 && 'Apple'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-grow w-full mobileLandscape:justify-end mobileLandscape:flex-1">
          <Localized id="la-unlink-button">
            <button
              className="cta-neutral cta-base cta-base-p disabled:cursor-wait whitespace-nowrap"
              data-testid={`linked-account-unlink-${providerId}`}
              onClick={onUnlinkAccountClick}
            >
              Unlink
            </button>
          </Localized>
        </div>
      </div>

      {confirmUnlinkModalRevealed && (
        <Modal
          onDismiss={onModalDismiss}
          onConfirm={onConfirmUnlinkAccountClick}
          confirmBtnClassName="cta-primary cta-base-p"
          confirmText={unlinkConfirmText()}
          data-testid="linked-account-unlink-header-test-id"
          headerId="linked-account-unlink-header"
          descId="linked-account-unlink-description"
        >
          <Localized id="la-unlink-heading">
            <h2
              id="linked-account-unlink-header"
              className="font-bold text-xl text-center mb-2"
              data-testid="linked-account-modal-header"
            >
              Unlink from third party account
            </h2>
          </Localized>

          {account.hasPassword ? (
            <Localized id="la-unlink-content-3">
              <p
                id="linked-accounts-unlink-description"
                className="my-4 text-center"
              >
                Are you sure you want to unlink your account? Unlinking your
                account does not automatically sign you out of your Connected
                Services. To do that, you will need to manually sign out from
                the Connected Services section.
              </p>
            </Localized>
          ) : (
            <Localized id="la-unlink-content-4">
              <p
                id="linked-accounts-unlink-pwd-needed-description"
                className="my-4 text-center"
              >
                Before unlinking your account, you must set a password. Without
                a password, there is no way for you to log in after unlinking
                your account.
              </p>
            </Localized>
          )}
        </Modal>
      )}
    </div>
  );
}

export default LinkedAccount;
