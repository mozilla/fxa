/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useState } from 'react';
import { Link, RouteComponentProps, useLocation } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../../models';
import { RecoveryCodesImage } from '../../../components/images';
import CardHeader from '../../../components/CardHeader';
import LinkExternal from 'fxa-react/components/LinkExternal';
import FormVerifyCode, {
  FormAttributes,
  InputModeEnum,
} from '../../../components/FormVerifyCode';
import GleanMetrics from '../../../lib/glean';
import AppLayout from '../../../components/AppLayout';
import { SigninRecoveryCodeProps } from './interfaces';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import Banner, { BannerType } from '../../../components/Banner';
import { storeAccountData } from '../../../lib/storage-utils';
import { handleNavigation } from '../utils';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';

export const viewName = 'signin-recovery-code';

const SigninRecoveryCode = ({
  finishOAuthFlowHandler,
  integration,
  redirectTo,
  serviceName,
  signinState,
  submitRecoveryCode,
}: SigninRecoveryCodeProps & RouteComponentProps) => {
  useEffect(() => {
    GleanMetrics.loginBackupCode.view();
  }, []);

  const [codeErrorMessage, setCodeErrorMessage] = useState<string>('');
  const [bannerErrorMessage, setBannerErrorMessage] = useState<string>('');
  const ftlMsgResolver = useFtlMsgResolver();
  const localizedCustomCodeRequiredMessage = ftlMsgResolver.getMsg(
    'signin-recovery-code-required-error',
    'Backup authentication code required'
  );
  const location = useLocation();

  const formAttributes: FormAttributes = {
    inputFtlId: 'signin-recovery-code-input-label',
    inputLabelText: 'Enter 10-digit backup authentication code',
    inputMode: InputModeEnum.text,
    pattern: '[a-zA-Z0-9]',
    maxLength: 10,
    submitButtonFtlId: 'signin-recovery-code-confirm-button',
    submitButtonText: 'Confirm',
  };

  const {
    email,
    sessionToken,
    uid,
    verificationMethod,
    verificationReason,
    keyFetchToken,
    unwrapBKey,
  } = signinState;

  const onSuccessNavigate = useCallback(async () => {
    const navigationOptions = {
      email,
      signinData: {
        uid,
        sessionToken,
        verificationReason,
        verificationMethod,
        verified: true,
        keyFetchToken,
      },
      unwrapBKey,
      integration,
      finishOAuthFlowHandler,
      redirectTo,
      queryParams: location.search,
    };

    const { error } = await handleNavigation(navigationOptions);
    if (error) {
      setBannerErrorMessage(getLocalizedErrorMessage(ftlMsgResolver, error));
    }
  }, [
    email,
    integration,
    finishOAuthFlowHandler,
    keyFetchToken,
    location.search,
    redirectTo,
    sessionToken,
    verificationMethod,
    verificationReason,
    uid,
    unwrapBKey,
    ftlMsgResolver,
  ]);

  const onSubmit = async (code: string) => {
    setBannerErrorMessage('');
    GleanMetrics.loginBackupCode.submit();
    const response = await submitRecoveryCode(code.toLowerCase());

    if (response.data?.consumeRecoveryCode.remaining !== undefined) {
      GleanMetrics.loginBackupCode.success();
      storeAccountData({
        sessionToken,
        email,
        uid,
        // Update verification status of stored current account
        verified: true,
      });
      onSuccessNavigate();
    }

    if (response.error) {
      let localizedError: string;

      switch (response.error.errno) {
        // 107 is an "invalid parameter" error, not localizable or user facing
        case AuthUiErrors.RECOVERY_CODE_NOT_FOUND.errno:
        case AuthUiErrors.INVALID_RECOVERY_CODE.errno:
        case 107:
          const localizedInvalidCodeError = getLocalizedErrorMessage(
            ftlMsgResolver,
            AuthUiErrors.INVALID_RECOVERY_CODE
          );
          setCodeErrorMessage(localizedInvalidCodeError);
          break;
        default:
          localizedError = getLocalizedErrorMessage(
            ftlMsgResolver,
            response.error
          );
          setBannerErrorMessage(localizedError);
      }
    }
  };

  return (
    <AppLayout>
      <CardHeader
        headingWithDefaultServiceFtlId="signin-recovery-code-heading-w-default-service"
        headingWithCustomServiceFtlId="signin-recovery-code-heading-w-custom-service"
        headingText="Enter backup authentication code"
        {...{ serviceName }}
      />

      {bannerErrorMessage && (
        <Banner type={BannerType.error}>{bannerErrorMessage}</Banner>
      )}
      <div className="flex justify-center mx-auto">
        <RecoveryCodesImage className="w-3/5" />
      </div>

      <FtlMsg id="signin-recovery-code-instruction">
        <p className="m-5 text-sm">
          Please enter a backup authentication code that was provided to you
          during two step authentication setup.
        </p>
      </FtlMsg>

      <FormVerifyCode
        {...{
          formAttributes,
          viewName,
          verifyCode: onSubmit,
          localizedCustomCodeRequiredMessage,
          codeErrorMessage,
          setCodeErrorMessage,
        }}
      />

      <div className="mt-5 link-blue text-sm flex justify-between">
        <FtlMsg id="signin-recovery-code-back-link">
          <Link
            to={`/signin_totp_code${location.search || ''}`}
            state={signinState}
          >
            Back
          </Link>
        </FtlMsg>
        <FtlMsg id="signin-recovery-code-support-link">
          <LinkExternal href="https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication">
            Are you locked out?
          </LinkExternal>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default SigninRecoveryCode;
