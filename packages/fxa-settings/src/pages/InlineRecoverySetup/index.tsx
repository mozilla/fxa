/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../models';
import DataBlock from '../../components/DataBlock';
import { RecoveryCodesImage } from '../../components/images';
import CardHeader from '../../components/CardHeader';
import AppLayout from '../../components/AppLayout';
import Banner, { BannerType } from '../../components/Banner';
import { copyRecoveryCodes } from '../../lib/totp';
import FormVerifyCode from '../../components/FormVerifyCode';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { InlineRecoverySetupProps } from './interfaces';
import { getErrorFtlId, getLocalizedErrorMessage } from '../../lib/error-utils';
import GleanMetrics from '../../lib/glean';
import { GleanClickEventType2FA } from '../../lib/types';

const InlineRecoverySetup = ({
  oAuthError,
  recoveryCodes,
  serviceName,
  cancelSetupHandler,
  verifyTotpHandler,
  successfulSetupHandler,
  email,
}: InlineRecoverySetupProps & RouteComponentProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
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

  const showBannerSuccess = useCallback(
    () =>
      successfulTotpSetup && (
        <Banner type={BannerType.success}>
          <p>
            {ftlMsgResolver.getMsg(
              'inline-recovery-2fa-enabled',
              'Two-step authentication enabled'
            )}
          </p>
        </Banner>
      ),
    [ftlMsgResolver, successfulTotpSetup]
  );
  const showBannerError = useCallback(
    () =>
      oAuthError && (
        <Banner type={BannerType.error}>
          <p>{getLocalizedErrorMessage(ftlMsgResolver, oAuthError)}</p>
        </Banner>
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
          // Some server side error occurred.  Generic error message in catch
          // block.
          throw new Error('cannot enable TOTP');
        }
      } catch (error) {
        if (error.errno === AuthUiErrors.TOTP_TOKEN_NOT_FOUND.errno) {
          setRecoveryCodeError(
            ftlMsgResolver.getMsg(
              getErrorFtlId(error),
              AuthUiErrors.TOTP_TOKEN_NOT_FOUND.message
            )
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
    ]
  );

  useEffect(() => {
    !showConfirmation && GleanMetrics.accountPref.twoStepAuthCodesView();
  }, [showConfirmation]);

  useEffect(() => {
    showConfirmation && GleanMetrics.accountPref.twoStepAuthEnterCodeView();
  }, [showConfirmation]);

  return (
    <AppLayout>
      {showConfirmation ? (
        <>
          <CardHeader
            headingText="Confirm backup authentication code"
            headingWithDefaultServiceFtlId="inline-recovery-confirmation-header-default"
            headingWithCustomServiceFtlId="inline-recovery-confirmation-header"
            {...{ serviceName }}
          />
          {showBannerSuccess()}
          {showBannerError()}
          <section>
            <div>
              <RecoveryCodesImage className="mx-auto" />
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
                  pattern: '\\w{10}',
                  maxLength: 10,
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
              separator=" "
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
                  data-glean-type="inline setup"
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
                  data-glean-type="inline setup"
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
