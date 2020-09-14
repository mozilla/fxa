/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { ApolloError, gql } from '@apollo/client';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { useAlertBar, useMutation } from '../../lib/hooks';
import AlertBar from '../AlertBar';
import Modal from '../Modal';
import UnitRow from '../UnitRow';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import { useAccount, useLazyAccount } from '../../models';
import { ButtonIconReload } from '../ButtonIcon';

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

  const [getAccount, { accountLoading }] = useLazyAccount((error) => {
    hideModal();
    alertBar.error(
      'Sorry, there was a problem refreshing the recovery key.',
      error
    );
  });

  const [deleteRecoveryKey] = useMutation(DELETE_RECOVERY_KEY_MUTATION, {
    variables: { input: {} },
    onCompleted: () => {
      hideModal();
      alertBar.success('Account recovery key removed.');
    },
    onError: (error) => {
      hideModal();
      alertBar.error('Your account recovery key could not be removed.', error);
    },
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
      headerContent={
        <ButtonIconReload
          title="Refresh recovery key"
          classNames="mobileLandscape:hidden"
          disabled={accountLoading}
          onClick={getAccount}
        />
      }
      actionContent={
        <ButtonIconReload
          title="Refresh recovery key"
          classNames="hidden mobileLandscape:inline-block"
          testId="recovery-key-refresh"
          disabled={accountLoading}
          onClick={getAccount}
        />
      }
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
        <AlertBar onDismiss={alertBar.hide} type={alertBar.type}>
          <p data-testid={`delete-recovery-key-${alertBar.type}`}>
            {alertBar.content}
          </p>
        </AlertBar>
      )}
    </UnitRow>
  );
};

export default UnitRowRecoveryKey;
