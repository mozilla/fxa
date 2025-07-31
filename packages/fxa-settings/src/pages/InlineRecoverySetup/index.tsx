/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useState } from 'react';
import { Link, RouteComponentProps, useLocation } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../models';
import { useNavigateWithQuery } from '../../lib/hooks/useNavigateWithQuery';
import DataBlock from '../../components/DataBlock';
import { BackupCodesImage } from '../../components/images';
import CardHeader from '../../components/CardHeader';
import AppLayout from '../../components/AppLayout';
import { copyRecoveryCodes } from '../../lib/totp';
import FormVerifyCode, {
  commonBackupCodeFormAttributes,
} from '../../components/FormVerifyCode';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import {
  InlineRecoverySetupProps,
  SigninRecoveryLocationState,
} from './interfaces';
import {
  getErrorFtlId,
  getHandledError,
  getLocalizedErrorMessage,
} from '../../lib/error-utils';
import GleanMetrics from '../../lib/glean';
import { GleanClickEventType2FA } from '../../lib/types';
import Banner from '../../components/Banner';

const InlineRecoverySetup = ({
  oAuthError,
  recoveryCodes,
  serviceName,
  cancelSetupHandler,
  verifyTotpHandler,
  successfulSetupHandler,
  email,
  integration,
}: InlineRecoverySetupProps & RouteComponentProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state?: SigninRecoveryLocationState;
  };
  const signinRecoveryLocationState = location.state;
  const { totp, ...signinLocationState } = signinRecoveryLocationState || {};
  const localizedIncorrectBackupCodeError = ftlMsgResolver.getMsg(
    'tfa-incorrect-recovery-code-1',
    'Incorrect backup authentication code'
  );
  const localizedRecoveryCodeRequiredError = ftlMsgResolver.getMsg(
    'signin-recovery-code-required-error',
    'Backup authentication code required'
  );

  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [successfulTotpSetup, setSuccessfulTotpSetup] =
    useState<boolean>(false);
  const [recoveryCodeError, setRecoveryCodeError] = useState<string>('');
  const [bannerErrorLocalized, setBannerErrorLocalized] =
    useState<React.ReactNode>(null);

  const showBannerSuccess = useCallback(
    () =>
      successfulTotpSetup && (
        <Banner
          type="success"
          content={{
            localizedHeading: ftlMsgResolver.getMsg(
              'inline-recovery-2fa-enabled-v2',
              'Two-step authentication has been enabled'
            ),
          }}
        />
      ),
    [ftlMsgResolver, successfulTotpSetup]
  );

  const showBannerOAuthError = useCallback(
    () =>
      oAuthError && (
        <Banner
          type="error"
          content={{
            localizedHeading: getLocalizedErrorMessage(
              ftlMsgResolver,
              oAuthError
            ),
          }}
        />
      ),
    [ftlMsgResolver, oAuthError]
  );

  const continueSetup = useCallback(() => {
    setShowConfirmation(true);
  }, []);
  const goBackToCodes = useCallback(() => {
    setRecoveryCodeError('');
    setShowConfirmation(false);
  }, []);

  const completeSetup = useCallback(
    async (code: string) => {
      setBannerErrorLocalized(null);

      if (!recoveryCodes.includes(code.trim())) {
        setRecoveryCodeError(localizedIncorrectBackupCodeError);
        return;
      }

      try {
        const success = await verifyTotpHandler();

        if (success) {
          setRecoveryCodeError('');
          setSuccessfulTotpSetup(true);
          setTimeout(successfulSetupHandler, 500);
        } else {
          // Some server side error occurred. Generic error message in catch
          // block.
          throw new Error('cannot enable TOTP');
        }
      } catch (err) {
        const { error } = getHandledError(err);
        if (error.errno === AuthUiErrors.TOTP_TOKEN_NOT_FOUND.errno) {
          setRecoveryCodeError(
            ftlMsgResolver.getMsg(
              getErrorFtlId(error),
              AuthUiErrors.TOTP_TOKEN_NOT_FOUND.message
            )
          );
        } else if (error.errno === AuthUiErrors.INVALID_OTP_CODE.errno) {
          const startOverLink = (
            <Link
              className="link-blue"
              to="/inline_totp_setup"
              state={signinLocationState}
              onClick={() => {
                navigateWithQuery('/inline_totp_setup', {
                  state: signinLocationState,
                });
              }}
            >
              start over
            </Link>
          );

          setBannerErrorLocalized(
            <FtlMsg
              id="two-factor-auth-setup-token-verification-error"
              elems={{ a: startOverLink }}
            >
              <>
                There was a problem enabling two-step authentication. Check that
                your device’s clock is set to update automatically and{' '}
                {startOverLink}.
              </>
            </FtlMsg>
          );
        } else {
          setRecoveryCodeError(
            ftlMsgResolver.getMsg(
              'tfa-cannot-verify-code-4',
              'There was a problem confirming your backup authentication code'
            )
          );
        }
      }
    },
    [
      ftlMsgResolver,
      localizedIncorrectBackupCodeError,
      recoveryCodes,
      successfulSetupHandler,
      verifyTotpHandler,
      navigateWithQuery,
      signinLocationState,
    ]
  );

  useEffect(() => {
    !showConfirmation &&
      GleanMetrics.accountPref.twoStepAuthCodesView({
        event: { reason: GleanClickEventType2FA.inline },
      });
  }, [showConfirmation]);

  useEffect(() => {
    showConfirmation &&
      GleanMetrics.accountPref.twoStepAuthEnterCodeView({
        event: { reason: GleanClickEventType2FA.inline },
      });
  }, [showConfirmation]);

  return (
    <AppLayout integration={integration}>
      {showConfirmation ? (
        <>
          <CardHeader
            headingText="Confirm backup authentication code"
            headingWithDefaultServiceFtlId="inline-recovery-confirmation-header-default"
            headingWithCustomServiceFtlId="inline-recovery-confirmation-header"
            {...{ serviceName }}
          />
          {showBannerSuccess()}
          {!bannerErrorLocalized && showBannerOAuthError()}
          {/* Only show one banner-style error at a time. At the time of writing the
           * only non-oauth error banner tells the user to start the flow again,
           * so allow it to take precedence.
           */}
          {bannerErrorLocalized && (
            <Banner
              type="error"
              customContent={
                <p className="font-bold">{bannerErrorLocalized}</p>
              }
            />
          )}
          <section>
            <div>
              <BackupCodesImage />
              <FtlMsg id="inline-recovery-confirmation-description">
                <p className="text-sm mb-6">
                  To ensure that you will be able to regain access to your
                  account in the event of a lost device, please enter one of
                  your saved backup authentication codes.
                </p>
              </FtlMsg>
              <FormVerifyCode
                viewName="inline_recovery_setup"
                verifyCode={completeSetup}
                formAttributes={{
                  inputLabelText: 'Backup authentication code',
                  inputFtlId: 'inline-recovery-backup-authentication-code',
                  submitButtonText: 'Confirm',
                  submitButtonFtlId: 'inline-recovery-confirm-button',
                  ...commonBackupCodeFormAttributes,
                }}
                codeErrorMessage={recoveryCodeError}
                setCodeErrorMessage={setRecoveryCodeError}
                localizedCustomCodeRequiredMessage={
                  localizedRecoveryCodeRequiredError
                }
                gleanDataAttrs={{
                  id: 'two_step_auth_enter_code_submit',
                  type: GleanClickEventType2FA.inline,
                }}
              />
              <div className="flex justify-between mt-4">
                <FtlMsg id="inline-recovery-back-link">
                  <button
                    type="button"
                    className="link-blue text-sm"
                    onClick={goBackToCodes}
                  >
                    Back
                  </button>
                </FtlMsg>
                <FtlMsg id="inline-recovery-cancel-setup">
                  <button
                    type="button"
                    className="link-blue text-sm"
                    onClick={cancelSetupHandler}
                    data-glean-id="two_step_auth_enter_code_cancel"
                    data-glean-type={GleanClickEventType2FA.inline}
                  >
                    Cancel setup
                  </button>
                </FtlMsg>
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          <CardHeader
            headingText="Save backup authentication codes"
            headingWithDefaultServiceFtlId="inline-recovery-setup-header-default"
            headingWithCustomServiceFtlId="inline-recovery-setup-header"
            {...{ serviceName }}
          />
          <section className="mt-6 flex flex-col items-center h-auto justify-between">
            <FtlMsg id="inline-recovery-setup-message">
              <p className="text-sm mb-6">
                Store these one-time use codes in a safe place for when you
                don’t have your mobile device.
              </p>
            </FtlMsg>
            <DataBlock
              value={recoveryCodes}
              onCopy={copyRecoveryCodes}
              contentType="Backup authentication codes"
              {...{ email }}
              gleanDataAttrs={{
                download: {
                  id: 'two_step_auth_codes_download',
                  type: GleanClickEventType2FA.inline,
                },
                copy: {
                  id: 'two_step_auth_codes_copy',
                  type: GleanClickEventType2FA.inline,
                },
                print: {
                  id: 'two_step_auth_codes_print',
                  type: GleanClickEventType2FA.inline,
                },
              }}
            />
            <div className="flex justify-center mt-6 mb-4 mx-auto max-w-64">
              <FtlMsg id="inline-recovery-cancel-button">
                <button
                  type="button"
                  className="cta-neutral mx-2 px-10 py-2 flex-1"
                  onClick={cancelSetupHandler}
                  data-glean-id="two_step_auth_codes_cancel"
                  data-glean-type={GleanClickEventType2FA.inline}
                >
                  Cancel
                </button>
              </FtlMsg>
              <FtlMsg id="inline-recovery-continue-button">
                <button
                  type="button"
                  className="cta-neutral mx-2 px-10 py-2"
                  onClick={continueSetup}
                  data-glean-id="two_step_auth_codes_submit"
                  data-glean-type={GleanClickEventType2FA.inline}
                >
                  Continue
                </button>
              </FtlMsg>
            </div>
          </section>
        </>
      )}
    </AppLayout>
  );
};

export default InlineRecoverySetup;
