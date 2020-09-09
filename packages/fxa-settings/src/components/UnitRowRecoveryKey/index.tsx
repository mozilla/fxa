/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { useAlertBar } from '../../lib/hooks';
import AlertBar from '../AlertBar';
import Modal from '../Modal';
import UnitRow from '../UnitRow';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import { useAccount } from '../../models';

export const DELETE_RECOVERY_KEY_MUTATION = gql`
  mutation deleteRecoveryKey($input: DeleteRecoveryKeyInput!) {
    deleteRecoveryKey(input: $input) {
      clientMutationId
    }
  }
`;

export const UnitRowRecoveryKey = () => {
  const { recoveryKey } = useAccount();
  const alertBar = useAlertBar();
  const [modalRevealed, revealModal, hideModal] = useBooleanState();
  const [errorText, setErrorText] = useState<string>();
  const onError = (e: Error) => {
    setErrorText(e.message);
    hideModal();
    alertBar.show();
  };
  const [deleteRecoveryKey] = useMutation(DELETE_RECOVERY_KEY_MUTATION, {
    variables: { input: {} },
    onCompleted: () => {
      hideModal();
      alertBar.show();
    },
    onError,
    ignoreResults: true,
    update: (cache) => {
      cache.modify({
        fields: {
          account: (existing) => {
            return { ...existing, recoveryKey: false };
          },
        },
      });
    },
  });

  return (
    <UnitRow
      header="Recovery key"
      headerValueClassName={recoveryKey ? 'text-green-800' : ''}
      headerValue={recoveryKey ? 'Enabled' : 'Not Set'}
      route={
        recoveryKey
          ? undefined
          : '/beta/settings/account_recovery/confirm_password'
      }
      revealModal={recoveryKey ? revealModal : undefined}
      ctaText={recoveryKey ? 'Remove' : 'Create'}
      alertBarRevealed
    >
      <p className="text-sm mt-3">
        Restores your information when you forget your password.
      </p>
      <LinkExternal
        className="link-blue text-xs mt-2"
        href="https://support.mozilla.org/en-US/kb/reset-your-firefox-account-password-recovery-keys"
      >
        Why does resetting my password reset my data?
      </LinkExternal>
      {modalRevealed && (
        <VerifiedSessionGuard onDismiss={hideModal} onError={onError}>
          <Modal
            onDismiss={hideModal}
            onConfirm={deleteRecoveryKey}
            confirmBtnClassName="cta-caution"
            confirmText="Remove"
            headerId="recovery-key-header"
            descId="recovery-key-desc"
          >
            <h2
              id="recovery-key-header"
              className="font-bold text-xl text-center mb-2"
            >
              Remove recovery key?
            </h2>
            <p id="recovery-key-desc" className="my-6 text-center">
              In the event you reset your password, you won't be able to use
              your recovery key to access your data. You can't undo this action.
            </p>
          </Modal>
        </VerifiedSessionGuard>
      )}
      {alertBar.visible && (
        <AlertBar
          onDismiss={alertBar.hide}
          type={errorText ? 'error' : 'success'}
        >
          {errorText ? (
            <p data-testid="delete-recovery-key-error">
              Error text TBD. {errorText}
            </p>
          ) : (
            <p data-testid="delete-recovery-key-success">
              Account recovery key removed
            </p>
          )}
        </AlertBar>
      )}
    </UnitRow>
  )
};

export default UnitRowRecoveryKey;
