/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useCallback, useEffect } from 'react';
import { useErrorHandler } from 'react-error-boundary';
import { SETTINGS_PATH } from '../../../constants';
import GleanMetrics from '../../../lib/glean';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { isInvalidJwtError } from '../../../lib/mfa-guard-utils';
import { formatPhoneNumber } from '../../../lib/recovery-phone-utils';
import { MfaReason, RecoveryPhoneSetupReason } from '../../../lib/types';
import {
  useAccount,
  useAlertBar,
  useFtlMsgResolver,
  useSession,
} from '../../../models';
import { MfaGuard } from '../MfaGuard';
import Modal from '../Modal';
import { BackupCodesSubRow, BackupPhoneSubRow } from '../SubRow';
import UnitRow, { UnitRowProps } from '../UnitRow';
import VerifiedSessionGuard from '../VerifiedSessionGuard';

const route = `${SETTINGS_PATH}/two_step_authentication`;
const replaceCodesRoute = `${route}/replace_codes`;
const change2faRoute = `${route}/change`;

export const UnitRowTwoStepAuth = () => {
  const alertBar = useAlertBar();
  const account = useAccount();
  const navigateWithQuery = useNavigateWithQuery();
  const {
    backupCodes: { count },
    totp: { exists, verified },
    recoveryPhone,
  } = account;
  const [disable2FAModalRevealed, revealDisable2FAModal, hideDisable2FAModal] =
    useBooleanState();
  const ftlMsgResolver = useFtlMsgResolver();

  const handleAdd2FAClick = useCallback(() => {
    GleanMetrics.accountPref.twoStepAuthSubmit();
    navigateWithQuery(route);
  }, [navigateWithQuery]);

  const conditionalUnitRowProps: Partial<UnitRowProps> =
    exists && verified
      ? {
          statusIcon: 'checkmark',
          headerValue: ftlMsgResolver.getMsg('tfa-row-enabled', 'Enabled'),
          secondaryCtaText: ftlMsgResolver.getMsg(
            'tfa-row-action-disable',
            'Disable'
          ),
          ctaText: ftlMsgResolver.getMsg('tfa-row-action-change', 'Change'),
          ctaGleanDataAttrs: {
            id: 'account_pref_two_step_auth_change_submit',
          },
          route: change2faRoute,
          revealSecondaryModal: revealDisable2FAModal,
          secondaryButtonTestId: 'two-step-disable-button',
          secondaryButtonGleanDataAttrs: {
            id: 'two_step_auth_disable_click',
          },
        }
      : {
          statusIcon: 'alert',
          defaultHeaderValueText: ftlMsgResolver.getMsg(
            'tfa-row-disabled-status',
            'Disabled'
          ),
          ctaText: ftlMsgResolver.getMsg('tfa-row-action-add', 'Add'),
          ctaGleanDataAttrs: {
            id: 'account_pref_two_step_auth_add_click',
          },
          revealModal: handleAdd2FAClick,
        };

  const getSubRows = () => {
    let subRows = [];
    if (exists && verified) {
      subRows.push(
        <BackupCodesSubRow
          numCodesAvailable={count}
          onCtaClick={() => {
            navigateWithQuery(replaceCodesRoute, undefined, false);
          }}
          key={1}
        />
      );
      if (recoveryPhone.available === true || recoveryPhone.exists === true) {
        const { nationalFormat, phoneNumber } = recoveryPhone;
        subRows.push(
          <BackupPhoneSubRow
            onCtaClick={() => {
              navigateWithQuery(
                `${SETTINGS_PATH}/recovery_phone/setup`,
                {
                  state: {
                    reason: !!recoveryPhone.exists
                      ? RecoveryPhoneSetupReason.change
                      : RecoveryPhoneSetupReason.setup,
                  },
                },
                false
              );
            }}
            // only include the delete option if the user has recovery codes available
            {...(count &&
              count > 0 && {
                onDeleteClick: () => {
                  alertBar.hide();
                  navigateWithQuery(
                    `${SETTINGS_PATH}/recovery_phone/remove`,
                    undefined,
                    false
                  );
                },
              })}
            phoneNumber={
              (phoneNumber
                ? formatPhoneNumber({
                    nationalFormat,
                    phoneNumber,
                    ftlMsgResolver,
                  })
                : {}
              ).maskedPhoneNumber
            }
            key={2}
          />
        );
      }
    }

    return subRows;
  };

  const howThisProtectsYourAccountLink = (
    <FtlMsg id="tfa-row-enabled-info-link">
      <LinkExternal
        href="https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication"
        className="link-blue text-sm"
      >
        How this protects your account
      </LinkExternal>
    </FtlMsg>
  );

  return (
    <>
      <UnitRow
        header={ftlMsgResolver.getMsg(
          'tfa-row-header',
          'Two-step authentication'
        )}
        headerId="two-step-authentication"
        prefixDataTestId="two-step"
        {...conditionalUnitRowProps}
        disabled={!account.hasPassword}
        disabledReason={ftlMsgResolver.getMsg(
          'security-set-password',
          'Set a password to sync and use certain account security features.'
        )}
        subRows={getSubRows()}
      >
        {exists && verified ? (
          <FtlMsg id="tfa-row-enabled-description">
            <p className="text-sm my-2">
              Your account is protected by two-step authentication. You will
              need to enter a one-time passcode from your authenticator app when
              logging into your Mozilla account.
            </p>
          </FtlMsg>
        ) : (
          <FtlMsg id="tfa-row-disabled-description-v2">
            <p className="text-sm mt-3">
              Help secure your account by using a third-party authenticator app
              as a second step to sign in.
            </p>
          </FtlMsg>
        )}
        {howThisProtectsYourAccountLink}
        {disable2FAModalRevealed && (
          <MfaGuard
            requiredScope={'2fa'}
            reason={MfaReason.removeTotp}
            onDismissCallback={async () => {
              hideDisable2FAModal();
            }}
          >
            <DisableTwoStepAuthModal {...{ hideDisable2FAModal }} />
          </MfaGuard>
        )}
      </UnitRow>
    </>
  );
};

const DisableTwoStepAuthModal = ({
  hideDisable2FAModal,
}: {
  hideDisable2FAModal: () => void;
}) => {
  const errorHandler = useErrorHandler();
  const alertBar = useAlertBar();
  const account = useAccount();
  const ftlMsgResolver = useFtlMsgResolver();
  const session = useSession();

  useEffect(() => {
    GleanMetrics.accountPref.twoStepAuthDisableModalView();
  }, [session]);

  const disableTwoStepAuth = useCallback(async () => {
    try {
      alertBar.hide();
      await account.disableTwoStepAuth();
      hideDisable2FAModal();
      alertBar.success(
        ftlMsgResolver.getMsg(
          'tfa-row-disabled-2',
          'Two-step authentication disabled'
        ),
        () => GleanMetrics.accountPref.twoStepAuthDisableSuccessView()
      );
    } catch (e) {
      if (isInvalidJwtError(e)) {
        // JWT invalid/expired.
        errorHandler(e);
        return;
      }

      hideDisable2FAModal();
      alertBar.error(
        ftlMsgResolver.getMsg(
          'tfa-row-cannot-disable-2',
          'Two-step authentication could not be disabled'
        )
      );

      Sentry.captureException(e);
    }
  }, [account, hideDisable2FAModal, alertBar, ftlMsgResolver, errorHandler]);

  return (
    <VerifiedSessionGuard
      onDismiss={hideDisable2FAModal}
      onError={(error) => {
        hideDisable2FAModal();
        alertBar.error(
          ftlMsgResolver.getMsg(
            'tfa-row-cannot-verify-session-4',
            'Sorry, there was a problem confirming your session'
          ),
          error
        );
      }}
    >
      <Modal
        onDismiss={hideDisable2FAModal}
        onConfirm={() => disableTwoStepAuth()}
        headerId="two-step-auth-disable-header"
        descId="two-step-auth-disable-description"
        confirmText={ftlMsgResolver.getMsg(
          'tfa-row-disable-modal-confirm',
          'Disable'
        )}
        confirmBtnClassName="cta-caution cta-base-p"
        confirmBtnGleanDataAttrs={{
          id: 'two_step_auth_confirm_disable_click',
        }}
      >
        <FtlMsg id="tfa-row-disable-modal-heading">
          <h2
            className="font-bold text-xl text-center mb-2"
            data-testid="disable-totp-modal-header"
          >
            Disable two-step authentication?
          </h2>
        </FtlMsg>
        {/* "replacing backup authentication codes" link below will actually drop you into
          backup authentication codes flow in the future. */}
        <FtlMsg
          id="tfa-row-disable-modal-explain-1"
          elems={{
            linkExternal: (
              <LinkExternal
                className="link-blue"
                href="https://support.mozilla.org/kb/changing-your-two-step-authentication-device-firefox-account"
              >
                replacing your backup authentication codes
              </LinkExternal>
            ),
          }}
        >
          <p className="text-center">
            You won’t be able to undo this action. You also have the option of{' '}
            <LinkExternal
              className="link-blue"
              href="https://support.mozilla.org/kb/changing-your-two-step-authentication-device-firefox-account"
            >
              replacing your backup authentication codes
            </LinkExternal>
            .
          </p>
        </FtlMsg>
      </Modal>
    </VerifiedSessionGuard>
  );
};

export default UnitRowTwoStepAuth;
