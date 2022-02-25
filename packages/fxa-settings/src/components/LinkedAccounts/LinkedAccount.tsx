/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';

import { Localized, useLocalization } from '@fluent/react';
import { ReactComponent as GoogleIcon } from './google.svg';
import { Modal } from '../Modal';
import { useAccount } from '../../models';
import { useBooleanState } from 'fxa-react/lib/hooks';

export function LinkedAccount({ providerId }: { providerId: number }) {
  const account = useAccount();
  const { l10n } = useLocalization();

  const [confirmUnlinkModalRevealed, revealUnlinkModal, hideUnlinkModal] =
    useBooleanState();

  const onConfirmUnlinkAccountClick = async () => {
    await account.unlinkThirdParty(providerId);
  };

  const onUnlinkAccountClick = () => {
    revealUnlinkModal();
  };

  return (
    <div
      className="my-1"
      id="linked-account"
      data-testid="settings-linked-accounts"
      data-name={providerId}
    >
      <div className="p-4 border-2 border-solid border-grey-100 rounded flex mobileLandscape:justify-around items-center flex-col mobileLandscape:flex-row">
        <div className="flex flex-grow w-full mobileLandscape:flex-2">
          <span className="flex justify-center items-center flex-0">
            {providerId === 1 && <GoogleIcon />}
          </span>
          <div className="flex flex-col flex-5 mobileLandscape:items-center mobileLandscape:flex-row">
            <div className="flex flex-col mobileLandscape:flex-2">
              <Localized id="settings-provider-name">
                <p className="text-xs break-word" data-testid="provider-name">
                  Google
                </p>
              </Localized>
            </div>
          </div>
        </div>

        <div className="flex flex-grow w-full mobileLandscape:justify-end mobileLandscape:flex-1">
          <Localized id="la-unlink-button">
            <button
              className="cta-neutral cta-base disabled:cursor-wait whitespace-no-wrap"
              data-testid="linked-account-unlink"
              onClick={onUnlinkAccountClick}
            >
              Unlink
            </button>
          </Localized>
        </div>
      </div>

      {confirmUnlinkModalRevealed && (
        <Modal
          onDismiss={hideUnlinkModal}
          onConfirm={onConfirmUnlinkAccountClick}
          confirmBtnClassName="cta-primary"
          confirmText={l10n.getString(
            'la-unlink-account-button',
            null,
            'Unlink'
          )}
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

          <Localized id="la-unlink-content">
            <p
              id="linked-accounts-unlink-description"
              className="my-4 text-center"
            >
              Are you sure you want to unlink your Google account? Unlinking
              your account does not automatically sign you out of those
              services. To do that you will need to manually sign out from the
              Connected services section.
            </p>
          </Localized>
        </Modal>
      )}
    </div>
  );
}

export default LinkedAccount;
