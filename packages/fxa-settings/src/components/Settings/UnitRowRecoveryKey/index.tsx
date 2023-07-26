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
import { ButtonIconReload, ButtonIconTrash } from '../ButtonIcon';
import { HomePath } from '../../../constants';
import { FtlMsg } from 'fxa-react/lib/utils';

export const UnitRowRecoveryKey = ({
  showRecoveryKeyV2,
}: {
  showRecoveryKeyV2?: boolean;
}) => {
  const account = useAccount();

  const recoveryKey = account.recoveryKey;
  const alertBar = useAlertBar();
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [modalRevealed, revealModal, hideModal] = useBooleanState();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const ftlMsgResolver = useFtlMsgResolver();

  const deleteRecoveryKey = useCallback(async () => {
    try {
      await account.deleteRecoveryKey();
      setDeleteModalVisible(false);
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
      setDeleteModalVisible(false);
      alertBar.error(
        ftlMsgResolver.getMsg(
          'rk-remove-error-2',
          'Your account recovery key could not be removed'
        )
      );
      logViewEvent('flow.settings.account-recovery', 'confirm-revoke.fail');
    } finally {
      setIsLoading(false);
    }
  }, [account, hideModal, alertBar, ftlMsgResolver]);

  const localizedRefreshRkText = ftlMsgResolver.getMsg(
    'rk-refresh-key-1',
    'Refresh account recovery key'
  );

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
      // TODO Remove condition in FXA-7419 and only keep v2
      route={
        showRecoveryKeyV2
          ? `${HomePath}/account_recovery`
          : recoveryKey
          ? undefined
          : `${HomePath}/account_recovery`
      }
      // Remove this attribute when v1 phased out in FXA-7419
      revealModal={
        showRecoveryKeyV2 ? undefined : recoveryKey ? revealModal : undefined
      }
      // TODO Remove condition in FXA-7419 and only keep v2
      ctaText={
        showRecoveryKeyV2
          ? recoveryKey
            ? ftlMsgResolver.getMsg('rk-action-change-button', 'Change')
            : ftlMsgResolver.getMsg('rk-action-create', 'Create')
          : recoveryKey
          ? ftlMsgResolver.getMsg('rk-action-remove', 'Remove')
          : ftlMsgResolver.getMsg('rk-action-create', 'Create')
      }
      disabled={!account.hasPassword}
      disabledReason={ftlMsgResolver.getMsg(
        'security-set-password',
        'Set a password to sync and use certain account security features.'
      )}
      alertBarRevealed
      headerContent={
        // TODO Remove condition in FXA-7419 and only keep v2
        showRecoveryKeyV2 ? (
          recoveryKey && (
            <ButtonIconTrash
              title={localizedDeleteRKIconButton}
              classNames="inline-block mobileLandscape:hidden ms-1"
              disabled={!recoveryKey || account.loading}
              onClick={() => setDeleteModalVisible(true)}
            />
          )
        ) : (
          <ButtonIconReload
            title={localizedRefreshRkText}
            classNames="inline-block mobileLandscape:hidden ms-1"
            disabled={account.loading}
            onClick={() => account.refresh('recovery')}
          />
        )
      }
      // if there is a recovery key for the account, show the trash icon
      actionContent={
        // TODO Remove condition in FXA-7419 and only keep v2
        showRecoveryKeyV2 ? (
          recoveryKey && (
            <ButtonIconTrash
              title={localizedDeleteRKIconButton}
              classNames="hidden mobileLandscape:inline-block ms-1"
              disabled={!recoveryKey || account.loading}
              onClick={() => setDeleteModalVisible(true)}
            />
          )
        ) : (
          <ButtonIconReload
            title={localizedRefreshRkText}
            classNames="hidden mobileLandscape:inline-block ms-1"
            testId="recovery-key-refresh"
            disabled={account.loading || !account.hasPassword}
            onClick={() => account.refresh('recovery')}
          />
        )
      }
    >
      <FtlMsg id="rk-content-explain">
        <p className="text-sm mt-3">
          Restore your information when you forget your password.
        </p>
      </FtlMsg>
      {(deleteModalVisible || modalRevealed) && (
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
              setDeleteModalVisible(false);
            }}
            onConfirm={() => {
              setIsLoading(true);
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
            isLoading={isLoading}
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
