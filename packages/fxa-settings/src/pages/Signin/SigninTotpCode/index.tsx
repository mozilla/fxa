/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import {
  Link,
  RouteComponentProps,
  useLocation,
  useNavigate,
} from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../../models';
import { logViewEvent } from '../../../lib/metrics';
import { TwoFactorAuthImage } from '../../../components/images';
import CardHeader from '../../../components/CardHeader';
import FormVerifyCode, {
  FormAttributes,
} from '../../../components/FormVerifyCode';
import { MozServices } from '../../../lib/types';
import {
  AuthUiErrors,
  getLocalizedErrorMessage,
} from '../../../lib/auth-errors/auth-errors';
import Banner, { BannerType } from '../../../components/Banner';
import AppLayout from '../../../components/AppLayout';
import GleanMetrics from '../../../lib/glean';
import {
  BeginSigninError,
  SigninIntegration,
  SigninLocationState,
} from '../interfaces';
import { handleNavigation } from '../utils';
import { FinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { storeAccountData } from '../../../lib/storage-utils';

// TODO: show a banner success message if a user is coming from reset password
// in FXA-6491. This differs from content-server where currently, users only
// get an email confirmation with no success message.

export type SigninTotpCodeProps = {
  finishOAuthFlowHandler: FinishOAuthFlowHandler;
  integration: SigninIntegration;
  redirectTo?: string;
  signinLocationState: SigninLocationState;
  // TODO: Switch to gql error shaped object
  submitTotpCode: (
    totpCode: string
  ) => Promise<{ error?: BeginSigninError; status: boolean }>;
  serviceName?: MozServices;
};

export const viewName = 'signin-totp-code';

export const SigninTotpCode = ({
  finishOAuthFlowHandler,
  integration,
  redirectTo,
  signinLocationState,
  submitTotpCode,
  serviceName,
}: SigninTotpCodeProps & RouteComponentProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [success, setSuccess] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string>('');
  const [codeErrorMessage, setCodeErrorMessage] = useState<string>('');
  const ftlMsgResolver = useFtlMsgResolver();

  const {
    email,
    uid,
    sessionToken,
    verificationMethod,
    verificationReason,
    keyFetchToken,
    unwrapBKey,
  } = signinLocationState;

  const localizedCustomCodeRequiredMessage = ftlMsgResolver.getMsg(
    'signin-totp-code-required-error',
    'Authentication code required'
  );

  const formAttributes: FormAttributes = {
    inputFtlId: 'signin-totp-code-input-label-v2',
    inputLabelText: 'Enter 6-digit code',
    pattern: '[0-9]{6}',
    maxLength: 6,
    submitButtonFtlId: 'signin-totp-code-confirm-button',
    submitButtonText: 'Confirm',
  };

  useEffect(() => {
    GleanMetrics.totpForm.view();
  }, []);

  const onSubmit = async (code: string) => {
    setGeneralError('');
    setCodeErrorMessage('');

    const { status, error } = await submitTotpCode(code);
    GleanMetrics.totpForm.submit();
    logViewEvent('flow', `${viewName}.submit`);
    setSuccess(status);

    if (error) {
      const localizedErrorMessage = getLocalizedErrorMessage(
        ftlMsgResolver,
        error
      );
      setGeneralError(localizedErrorMessage);
    } else if (status === false) {
      const localizedErrorMessage = getLocalizedErrorMessage(
        ftlMsgResolver,
        AuthUiErrors.INVALID_TOTP_CODE
      );
      setCodeErrorMessage(localizedErrorMessage);
    } else {
      GleanMetrics.totpForm.success();

      storeAccountData({
        sessionToken,
        email,
        uid,
        // Update verification status of stored current account
        verified: true,
      });

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

      await handleNavigation(navigationOptions, navigate, true);
    }
  };

  return (
    <AppLayout>
      <CardHeader
        headingWithDefaultServiceFtlId="signin-totp-code-heading-w-default-service-v2"
        headingWithCustomServiceFtlId="signin-totp-code-heading-w-custom-service-v2"
        headingText="Enter authentication code"
        {...{ serviceName }}
      />

      <main>
        {!success && generalError && (
          <Banner type={BannerType.error}>{generalError}</Banner>
        )}

        <div className="flex justify-center mx-auto">
          <TwoFactorAuthImage className="w-3/5" />
        </div>

        <FtlMsg id="signin-totp-code-instruction-v2">
          <p id="totp-code-instruction" className="my-5 text-sm">
            Open your authentication app and enter the authentication code it
            provides.
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
          <FtlMsg id="signin-totp-code-other-account-link">
            <Link to="/signin" className="text-start">
              Use a different account
            </Link>
          </FtlMsg>
          <FtlMsg id="signin-totp-code-recovery-code-link">
            <Link to="/signin_recovery_code" className="text-end">
              Trouble entering code?
            </Link>
          </FtlMsg>
        </div>
      </main>
    </AppLayout>
  );
};

export default SigninTotpCode;
