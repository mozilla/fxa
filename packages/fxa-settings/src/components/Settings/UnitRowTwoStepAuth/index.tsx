/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback } from 'react';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { useBooleanState } from 'fxa-react/lib/hooks';
import Modal from '../Modal';
import UnitRow, { UnitRowProps } from '../UnitRow';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import {
  useAccount,
  useAlertBar,
  useConfig,
  useFtlMsgResolver,
} from '../../../models';
import { SETTINGS_PATH } from '../../../constants';
import GleanMetrics from '../../../lib/glean';
import { FtlMsg } from 'fxa-react/lib/utils';
import { BackupCodesSubRow, BackupPhoneSubRow } from '../SubRow';
import { useNavigateWithQuery as useNavigate } from '../../../lib/hooks/useNavigateWithQuery';

const route = `${SETTINGS_PATH}/two_step_authentication`;
const replaceCodesRoute = `${route}/replace_codes`;

export const UnitRowTwoStepAuth = () => {
  const alertBar = useAlertBar();
  const account = useAccount();
  const navigate = useNavigate();
  const {
    backupCodes: { count },
    totp: { exists, verified },
    recoveryPhone,
  } = account;
  const config = useConfig();
  const [disable2FAModalRevealed, revealDisable2FAModal, hideDisable2FAModal] =
    useBooleanState();
  const ftlMsgResolver = useFtlMsgResolver();

  const disableTwoStepAuth = useCallback(async () => {
    try {
      await account.disableTwoStepAuth();
      hideDisable2FAModal();
      alertBar.success(
        ftlMsgResolver.getMsg(
          'tfa-row-disabled-2',
          'Two-step authentication disabled'
        )
      );
    } catch (e) {
      hideDisable2FAModal();
      alertBar.error(
        ftlMsgResolver.getMsg(
          'tfa-row-cannot-disable-2',
          'Two-step authentication could not be disabled'
        )
      );
    }
  }, [account, hideDisable2FAModal, alertBar, ftlMsgResolver]);

  const DisableTwoStepAuthModal = () => {
    return (
      <VerifiedSessionGuard
        onDismiss={hideDisable2FAModal}
        onError={(error) => {
          hideDisable2FAModal();
          alertBar.error(error.message, error);
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

  const conditionalUnitRowProps: Partial<UnitRowProps> =
    exists && verified
      ? {
          statusIcon: 'checkmark',
          headerValue: ftlMsgResolver.getMsg('tfa-row-enabled', 'Enabled'),
          secondaryCtaText: ftlMsgResolver.getMsg(
            'tfa-row-action-disable',
            'Disable'
          ),
          revealSecondaryModal: revealDisable2FAModal,
          secondaryButtonTestId: 'two-step-disable-button',
          hideCtaText: true,
        }
      : {
          statusIcon: 'alert',
          defaultHeaderValueText: ftlMsgResolver.getMsg(
            'tfa-row-disabled-status',
            'Disabled'
          ),
          ctaText: ftlMsgResolver.getMsg('tfa-row-action-add', 'Add'),
          secondaryCtaText: undefined,
          revealSecondaryModal: undefined,
        };

  const getSubRows = () => {
    let subRows = [];
    if (exists && verified) {
      subRows.push(
        <BackupCodesSubRow
          numCodesAvailable={count}
          onCtaClick={() => {
            navigate(replaceCodesRoute);
          }}
          key={1}
        />
      );
      if (
        config.featureFlags?.enableAdding2FABackupPhone === true &&
        (recoveryPhone.available === true || recoveryPhone.exists === true)
      ) {
        subRows.push(
          <BackupPhoneSubRow
            onCtaClick={() => {
              navigate(`${SETTINGS_PATH}/recovery_phone/setup`);
            }}
            onDeleteClick={() => {}}
            phoneNumber={recoveryPhone.phoneNumber || ''}
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
        href="https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication"
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
        route={route}
        {...conditionalUnitRowProps}
        disabled={!account.hasPassword}
        disabledReason={ftlMsgResolver.getMsg(
          'security-set-password',
          'Set a password to sync and use certain account security features.'
        )}
        ctaOnClickAction={() => {
          GleanMetrics.accountPref.twoStepAuthSubmit();
        }}
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
        {disable2FAModalRevealed && <DisableTwoStepAuthModal />}
      </UnitRow>
    </>
  );
};

export default UnitRowTwoStepAuth;
