/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState } from 'react';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { useAccount, useAlertBar, useFtlMsgResolver } from '../../../models';
import { logViewEvent } from '../../../lib/metrics';
import Modal from '../Modal';
import UnitRow from '../UnitRow';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import { ButtonIconTrash } from '../ButtonIcon';
import { SETTINGS_PATH } from '../../../constants';
import { FtlMsg } from 'fxa-react/lib/utils';
import GleanMetrics from '../../../lib/glean';

export const UnitRowRecoveryKey = () => {
  const account = useAccount();

  const recoveryKey = account.recoveryKey.exists;
  const alertBar = useAlertBar();
  const [modalRevealed, revealModal, hideModal] = useBooleanState();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const ftlMsgResolver = useFtlMsgResolver();

  const deleteRecoveryKey = useCallback(async () => {
    try {
      await account.deleteRecoveryKey();
      hideModal();
      alertBar.success(
        ftlMsgResolver.getMsg(
          'rk-key-removed-2',
          'Account recovery key removed'
        )
      );
      logViewEvent('flow.settings.account-recovery', 'confirm-revoke.success');
    } catch (e) {
      hideModal();
      alertBar.error(
        ftlMsgResolver.getMsg(
          'rk-remove-error-2',
          'Your account recovery key could not be removed'
        )
      );
      logViewEvent('flow.settings.account-recovery', 'confirm-revoke.fail');
    } finally {
      setIsDeleting(false);
    }
  }, [account, hideModal, alertBar, ftlMsgResolver]);

  const localizedDeleteRKIconButton = ftlMsgResolver.getMsg(
    'unit-row-recovery-key-delete-icon-button-title',
    'Delete account recovery key'
  );

  return (
    <UnitRow
      header={ftlMsgResolver.getMsg('rk-header-1', 'Account recovery key')}
      headerId="recovery-key"
      prefixDataTestId="recovery-key"
      headerValueClassName={recoveryKey ? 'text-green-800' : ''}
      headerValue={
        recoveryKey
          ? ftlMsgResolver.getMsg('rk-enabled', 'Enabled')
          : ftlMsgResolver.getMsg('rk-not-set', 'Not Set')
      }
      route={`${SETTINGS_PATH}/account_recovery`}
      ctaText={
        recoveryKey
          ? ftlMsgResolver.getMsg('rk-action-change-button', 'Change')
          : ftlMsgResolver.getMsg('rk-action-create', 'Create')
      }
      disabled={!account.hasPassword}
      disabledReason={ftlMsgResolver.getMsg(
        'security-set-password',
        'Set a password to sync and use certain account security features.'
      )}
      alertBarRevealed
      headerContent={
        recoveryKey && (
          <ButtonIconTrash
            title={localizedDeleteRKIconButton}
            classNames="inline-block mobileLandscape:hidden ms-1"
            disabled={!recoveryKey || isDeleting}
            onClick={revealModal}
          />
        )
      }
      // if there is a recovery key for the account, show the trash icon
      actionContent={
        recoveryKey && (
          <ButtonIconTrash
            title={localizedDeleteRKIconButton}
            classNames="hidden mobileLandscape:inline-block ms-1"
            disabled={!recoveryKey || isDeleting}
            onClick={revealModal}
          />
        )
      }
      ctaOnClickAction={() => {
        GleanMetrics.accountPref.recoveryKeySubmit();
      }}
    >
      <FtlMsg id="rk-content-explain">
        <p className="text-sm mt-3">
          Restore your information when you forget your password.
        </p>
      </FtlMsg>
      {modalRevealed && (
        <VerifiedSessionGuard
          onDismiss={hideModal}
          onError={(error) => {
            hideModal();
            alertBar.error(
              ftlMsgResolver.getMsg(
                'rk-cannot-verify-session-4',
                'Sorry, there was a problem confirming your session'
              ),
              error
            );
          }}
        >
          <Modal
            onDismiss={() => {
              hideModal();
            }}
            onConfirm={() => {
              setIsDeleting(true);
              deleteRecoveryKey();
              logViewEvent(
                'flow.settings.account-recovery',
                'confirm-revoke.submit'
              );
            }}
            confirmBtnClassName="cta-caution cta-base-p"
            confirmText={ftlMsgResolver.getMsg('rk-action-remove', 'Remove')}
            headerId="recovery-key-header"
            descId="recovery-key-desc"
            isLoading={isDeleting}
          >
            <FtlMsg id="rk-remove-modal-heading-1">
              <h2
                id="recovery-key-header"
                className="font-bold text-xl text-center mb-2"
              >
                Remove account recovery key?
              </h2>
            </FtlMsg>
            <FtlMsg id="rk-remove-modal-content-1">
              <p className="my-6 text-center">
                In the event you reset your password, you wonʼt be able to use
                your account recovery key to access your data. You canʼt undo
                this action.
              </p>
            </FtlMsg>
          </Modal>
        </VerifiedSessionGuard>
      )}
    </UnitRow>
  );
};

export default UnitRowRecoveryKey;
