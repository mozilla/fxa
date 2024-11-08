/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect } from 'react';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { useBooleanState } from 'fxa-react/lib/hooks';
import Modal from '../Modal';
import UnitRow from '../UnitRow';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import { useAccount, useAlertBar } from '../../../models';
import { ButtonIconReload } from '../ButtonIcon';
import { SETTINGS_PATH } from '../../../constants';
import { Localized, useLocalization } from '@fluent/react';
import GleanMetrics from '../../../lib/glean';

const route = `${SETTINGS_PATH}/two_step_authentication`;
const replaceCodesRoute = `${route}/replace_codes`;

export const UnitRowTwoStepAuth = () => {
  const alertBar = useAlertBar();
  const account = useAccount();
  const {
    totp: { exists, verified },
  } = account;
  const count = account.backupCodes?.count;
  const [modalRevealed, revealModal, hideModal] = useBooleanState();
  const [secondaryModalRevealed, revealSecondaryModal, hideSecondaryModal] =
    useBooleanState();
  const { l10n } = useLocalization();

  const disableTwoStepAuth = useCallback(async () => {
    try {
      await account.disableTwoStepAuth();
      hideModal();
      alertBar.success(
        l10n.getString(
          'tfa-row-disabled-2',
          null,
          'Two-step authentication disabled'
        )
      );
    } catch (e) {
      hideModal();
      alertBar.error(
        l10n.getString(
          'tfa-row-cannot-disable-2',
          null,
          'Two-step authentication could not be disabled'
        )
      );
    }
  }, [account, hideModal, alertBar, l10n]);

  console.log('Number of backup codes remaining: ', count);

  // TODO in FXA-10206, remove this console log and use the count data for the backup codes subrow
  useEffect(() => {
    if (exists && verified) {
      console.log('Number of backup codes remaining: ', count);
    }
  }, [count, exists, verified]);

  const conditionalUnitRowProps =
    exists && verified
      ? {
          headerValueClassName: 'text-green-800',
          headerValue: l10n.getString('tfa-row-enabled', null, 'Enabled'),
          secondaryCtaText: l10n.getString(
            'tfa-row-action-disable',
            null,
            'Disable'
          ),
          secondaryButtonClassName: 'cta-caution cta-base-p',
          secondaryButtonTestId: 'two-step-disable-button',
          // The naming of this is a bit confusing, since they are swapped in this
          // case, we should come up with a better name here. Filed FXA-2539
          revealModal: revealSecondaryModal,
          revealSecondaryModal: revealModal,
          hideCtaText: true,
        }
      : {
          defaultHeaderValueText: l10n.getString(
            'tfa-row-not-set',
            null,
            'Not Set'
          ),
          ctaText: l10n.getString('tfa-row-action-add', null, 'Add'),
          secondaryCtaText: undefined,
          revealSecondaryModal: undefined,
        };

  return (
    <UnitRow
      header={l10n.getString('tfa-row-header', null, 'Two-step authentication')}
      headerId="two-step-authentication"
      prefixDataTestId="two-step"
      route={route}
      {...conditionalUnitRowProps}
      headerContent={
        <Localized id="tfa-row-button-refresh" attrs={{ title: true }}>
          <ButtonIconReload
            title="Refresh two-step authentication"
            classNames="ltr:ml-1 rtl:mr-1 mobileLandscape:hidden"
            disabled={account.loading}
            onClick={() => account.refresh('totp')}
          />
        </Localized>
      }
      disabled={!account.hasPassword}
      disabledReason={l10n.getString(
        'security-set-password',
        null,
        'Set a password to sync and use certain account security features.'
      )}
      actionContent={
        <Localized id="tfa-row-button-refresh" attrs={{ title: true }}>
          <ButtonIconReload
            title="Refresh two-step authentication"
            classNames="hidden ltr:ml-1 rtl:mr-1 mobileLandscape:inline-block"
            testId="two-step-refresh"
            disabled={account.loading || !account.hasPassword}
            onClick={() => account.refresh('totp')}
          />
        </Localized>
      }
      ctaOnClickAction={() => {
        GleanMetrics.accountPref.twoStepAuthSubmit();
      }}
    >
      <Localized id="tfa-row-content-explain">
        <p className="text-sm mt-3">
          Prevent someone else from logging in by requiring a unique code only
          you have access to.
        </p>
      </Localized>
      {modalRevealed && (
        <VerifiedSessionGuard
          onDismiss={hideModal}
          onError={(error) => {
            hideModal();
            alertBar.error(error.message, error);
          }}
        >
          <Modal
            onDismiss={hideModal}
            onConfirm={() => disableTwoStepAuth()}
            headerId="two-step-auth-disable-header"
            descId="two-step-auth-disable-description"
            confirmText={l10n.getString(
              'tfa-row-disable-modal-confirm',
              null,
              'Disable'
            )}
            confirmBtnClassName="cta-caution cta-base-p"
          >
            <Localized id="tfa-row-disable-modal-heading">
              <h2
                className="font-bold text-xl text-center mb-2"
                data-testid="disable-totp-modal-header"
              >
                Disable two-step authentication?
              </h2>
            </Localized>
            {/* "replacing backup authentication codes" link below will actually drop you into
            backup authentication codes flow in the future. */}
            <Localized
              id="tfa-row-disable-modal-explain-1"
              elems={{
                linkExternal: (
                  <LinkExternal
                    className="link-blue"
                    href="https://support.mozilla.org/kb/changing-your-two-step-authentication-device-firefox-account"
                  >
                    {' '}
                  </LinkExternal>
                ),
              }}
            >
              <p className="text-center">
                You won't be able to undo this action. You also have the option
                of{' '}
                <LinkExternal
                  className="link-blue"
                  href="https://support.mozilla.org/kb/reset-your-firefox-account-password-recovery-keys"
                >
                  replacing your backup authentication codes
                </LinkExternal>
                .
              </p>
            </Localized>
          </Modal>
        </VerifiedSessionGuard>
      )}
      {secondaryModalRevealed && (
        <VerifiedSessionGuard
          onDismiss={hideSecondaryModal}
          onError={(error) => {
            hideModal();
            alertBar.error(
              l10n.getString(
                'tfa-row-cannot-verify-session-4',
                null,
                'Sorry, there was a problem confirming your session'
              ),
              error
            );
          }}
        >
          <Modal
            onDismiss={hideSecondaryModal}
            headerId="two-step-auth-change-codes-header"
            descId="two-step-auth-change-codes-description"
            confirmText={l10n.getString(
              'tfa-row-change-modal-confirm',
              null,
              'Change'
            )}
            confirmBtnClassName="cta-primary cta-base-p"
            route={replaceCodesRoute}
          >
            <Localized id="tfa-row-change-modal-heading-1">
              <h2
                className="font-bold text-xl text-center mb-2"
                data-testid="change-codes-modal-header"
              >
                Change backup authentication codes?
              </h2>
            </Localized>
            <Localized id="tfa-row-change-modal-explain">
              <p className="text-center">
                You won't be able to undo this action.
              </p>
            </Localized>
          </Modal>
        </VerifiedSessionGuard>
      )}
    </UnitRow>
  );
};

export default UnitRowTwoStepAuth;
