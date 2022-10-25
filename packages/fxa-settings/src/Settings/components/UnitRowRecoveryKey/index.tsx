/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback } from 'react';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { useAccount, useAlertBar } from '../../../models';
import { logViewEvent } from '../../../lib/metrics';
import Modal from '../Modal';
import UnitRow from '../UnitRow';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import { ButtonIconReload } from '../ButtonIcon';
import { HomePath } from '../../../constants';
import { Localized, useLocalization } from '@fluent/react';

export const UnitRowRecoveryKey = () => {
  const account = useAccount();
  const recoveryKey = account.recoveryKey;
  const alertBar = useAlertBar();
  const [modalRevealed, revealModal, hideModal] = useBooleanState();
  const { l10n } = useLocalization();

  const deleteRecoveryKey = useCallback(async () => {
    try {
      await account.deleteRecoveryKey();
      hideModal();
      alertBar.success(
        l10n.getString('rk-key-removed-2', null, 'Account recovery key removed')
      );
      logViewEvent('flow.settings.account-recovery', 'confirm-revoke.success');
    } catch (e) {
      hideModal();
      alertBar.error(
        l10n.getString(
          'rk-remove-error-2',
          null,
          'Your account recovery key could not be removed'
        )
      );
      logViewEvent('flow.settings.account-recovery', 'confirm-revoke.fail');
    }
  }, [account, hideModal, alertBar, l10n]);

  const localizedRefreshRkText = l10n.getString(
    'rk-refresh-key-1',
    null,
    'Refresh account recovery key'
  );

  return (
    <UnitRow
      header={l10n.getString('rk-header-1', null, 'Account recovery key')}
      headerId="recovery-key"
      prefixDataTestId="recovery-key"
      headerValueClassName={recoveryKey ? 'text-green-800' : ''}
      headerValue={
        recoveryKey
          ? l10n.getString('rk-enabled', null, 'Enabled')
          : l10n.getString('rk-not-set', null, 'Not Set')
      }
      route={recoveryKey ? undefined : `${HomePath}/account_recovery`}
      revealModal={recoveryKey ? revealModal : undefined}
      ctaText={
        recoveryKey
          ? l10n.getString('rk-action-remove', null, 'Remove')
          : l10n.getString('rk-action-create', null, 'Create')
      }
      disabled={!account.hasPassword}
      disabledReason={l10n.getString(
        'security-set-password',
        null,
        'Set a password to sync and use certain account security features.'
      )}
      alertBarRevealed
      headerContent={
        <ButtonIconReload
          title={localizedRefreshRkText}
          classNames="mobileLandscape:hidden ltr:ml-1 rtl:mr-1"
          disabled={account.loading}
          onClick={() => account.refresh('recovery')}
        />
      }
      actionContent={
        <ButtonIconReload
          title={localizedRefreshRkText}
          classNames="hidden mobileLandscape:inline-block ltr:ml-1 rtl:mr-1"
          testId="recovery-key-refresh"
          disabled={account.loading || !account.hasPassword}
          onClick={() => account.refresh('recovery')}
        />
      }
    >
      <Localized id="rk-content-explain">
        <p className="text-sm mt-3">
          Restores your information when you forget your password.
        </p>
      </Localized>
      {modalRevealed && (
        <VerifiedSessionGuard
          onDismiss={hideModal}
          onError={(error) => {
            hideModal();
            alertBar.error(
              l10n.getString(
                'rk-cannot-verify-session-4',
                null,
                'Sorry, there was a problem confirming your session'
              ),
              error
            );
          }}
        >
          <Modal
            onDismiss={hideModal}
            onConfirm={() => {
              deleteRecoveryKey();
              logViewEvent(
                'flow.settings.account-recovery',
                'confirm-revoke.submit'
              );
            }}
            confirmBtnClassName="cta-caution cta-base-p"
            confirmText={l10n.getString('rk-action-remove', null, 'Remove')}
            headerId="recovery-key-header"
            descId="recovery-key-desc"
          >
            <Localized id="rk-remove-modal-heading-1">
              <h2
                id="recovery-key-header"
                className="font-bold text-xl text-center mb-2"
              >
                Remove account recovery key?
              </h2>
            </Localized>
            <Localized id="rk-remove-modal-content-1">
              <p id="recovery-key-desc" className="my-6 text-center">
                In the event you reset your password, you won't be able to use
                your account recovery key to access your data. You can't undo
                this action.
              </p>
            </Localized>
          </Modal>
        </VerifiedSessionGuard>
      )}
    </UnitRow>
  );
};

export default UnitRowRecoveryKey;
