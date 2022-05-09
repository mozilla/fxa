/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback } from 'react';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { useAccount, useAlertBar } from '../../models';
import { logViewEvent } from '../../lib/metrics';
import Modal from '../Modal';
import UnitRow from '../UnitRow';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import { ButtonIconReload } from '../ButtonIcon';
import { HomePath } from '../../constants';
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
        l10n.getString('rk-key-removed', null, 'Account recovery key removed.')
      );
      logViewEvent('flow.settings.account-recovery', 'confirm-revoke.success');
    } catch (e) {
      hideModal();
      alertBar.error(l10n.getString('rk-remove-error'));
      logViewEvent('flow.settings.account-recovery', 'confirm-revoke.fail');
    }
  }, [account, hideModal, alertBar, l10n]);

  return (
    <UnitRow
      header={l10n.getString('rk-header')}
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
        'rk-no-pwd-action-disabled-reason',
        null,
        'Set a password to use Sync and certain account security features.'
      )}
      alertBarRevealed
      headerContent={
        <ButtonIconReload
          title={l10n.getString('rk-refresh-key')}
          classNames="mobileLandscape:hidden ltr:ml-1 rtl:mr-1"
          disabled={account.loading}
          onClick={() => account.refresh('recovery')}
        />
      }
      actionContent={
        <ButtonIconReload
          title={l10n.getString('rk-refresh-key')}
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
      <Localized id="rk-content-reset-data">
        <LinkExternal
          className="link-blue text-xs mt-2"
          href="https://support.mozilla.org/en-US/kb/reset-your-firefox-account-password-recovery-keys"
        >
          Why does resetting my password reset my data?
        </LinkExternal>
      </Localized>
      {modalRevealed && (
        <VerifiedSessionGuard
          onDismiss={hideModal}
          onError={(error) => {
            hideModal();
            alertBar.error(
              l10n.getString(
                'rk-cannot-verify-session-2',
                null,
                'Sorry, there was a problem verifying your session.'
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
            confirmBtnClassName="cta-caution"
            confirmText={l10n.getString('rk-action-remove', null, 'Remove')}
            headerId="recovery-key-header"
            descId="recovery-key-desc"
          >
            <Localized id="rk-remove-modal-heading">
              <h2
                id="recovery-key-header"
                className="font-bold text-xl text-center mb-2"
              >
                Remove recovery key?
              </h2>
            </Localized>
            <Localized id="rk-remove-modal-content">
              <p id="recovery-key-desc" className="my-6 text-center">
                In the event you reset your password, you won't be able to use
                your recovery key to access your data. You can't undo this
                action.
              </p>
            </Localized>
          </Modal>
        </VerifiedSessionGuard>
      )}
    </UnitRow>
  );
};

export default UnitRowRecoveryKey;
