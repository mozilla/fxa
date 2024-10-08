/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { Link, RouteComponentProps, useLocation } from '@reach/router';
import { FtlMsg, hardNavigate } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../../models';
import { logViewEvent } from '../../../lib/metrics';
import FormVerifyCode, {
  FormAttributes,
} from '../../../components/FormVerifyCode';
import { MozServices } from '../../../lib/types';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import Banner, { BannerType } from '../../../components/Banner';
import AppLayout from '../../../components/AppLayout';
import GleanMetrics from '../../../lib/glean';
import { SigninIntegration, SigninLocationState } from '../interfaces';
import { handleNavigation } from '../utils';
import { FinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { storeAccountData } from '../../../lib/storage-utils';
import {
  BeginSigninError,
  getLocalizedErrorMessage,
} from '../../../lib/error-utils';
import protectionShieldIcon from '@fxa/shared/assets/images/protection-shield.svg';

// TODO: show a banner success message if a user is coming from reset password
// in FXA-6491. This differs from content-server where currently, users only
// get an email confirmation with no success message.

export type SigninTotpCodeProps = {
  finishOAuthFlowHandler: FinishOAuthFlowHandler;
  integration: SigninIntegration;
  redirectTo?: string;
  signinState: SigninLocationState;
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
  signinState,
  submitTotpCode,
  serviceName,
}: SigninTotpCodeProps & RouteComponentProps) => {
  const location = useLocation();

  const [bannerError, setBannerError] = useState<string>('');
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
    showInlineRecoveryKeySetup,
  } = signinState;

  const localizedCustomCodeRequiredMessage = ftlMsgResolver.getMsg(
    'signin-totp-code-required-error',
    'Authentication code required'
  );

  const formAttributes: FormAttributes = {
    inputFtlId: 'signin-totp-code-input-label-v3',
    inputLabelText: 'Enter code',
    pattern: '[0-9]{6}',
    maxLength: 6,
    submitButtonFtlId: 'signin-totp-code-confirm-button',
    submitButtonText: 'Confirm',
  };

  useEffect(() => {
    GleanMetrics.totpForm.view();
  }, []);

  const onSubmit = async (code: string) => {
    setBannerError('');
    setCodeErrorMessage('');

    const { status, error } = await submitTotpCode(code);
    GleanMetrics.totpForm.submit();
    logViewEvent('flow', `${viewName}.submit`);

    if (error) {
      setBannerError(getLocalizedErrorMessage(ftlMsgResolver, error));
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
        showInlineRecoveryKeySetup,
      };

      const { error } = await handleNavigation(navigationOptions, {
        handleFxaLogin: true,
        handleFxaOAuthLogin: true,
      });
      if (error) {
        setBannerError(getLocalizedErrorMessage(ftlMsgResolver, error));
      }
    }
  };

  return (
    <AppLayout>
      <h2 className="font-bold text-xl text-left">
        <FtlMsg id="signin-totp-code-subheader">
          Enter your two-factor authentication security code (2FA)
        </FtlMsg>
      </h2>

      <div className="flex space-x-4">
        <img src={protectionShieldIcon} alt="" />
        <FtlMsg id="signin-totp-code-instruction-v3">
          <p id="totp-code-instruction" className="my-5 text-md text-left">
            Check your authenticator app to confirm your sign-in.
          </p>
        </FtlMsg>
      </div>

      {bannerError && <Banner type={BannerType.error}>{bannerError}</Banner>}

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
          {/* TODO in FXA-8636 replace with Link component once index reactified */}
          <a
            href="/"
            className="text-sm link-blue"
            onClick={(e) => {
              e.preventDefault();
              const params = new URLSearchParams(location.search);
              // Tell content-server to stay on index and prefill the email
              params.set('prefillEmail', email);
              // Passing back the 'email' param causes various behaviors in
              // content-server since it marks the email as "coming from a RP".
              // Also remove other params that are passed when coming
              // from content-server to Backbone, see Signup container component
              // for more info.
              params.delete('email');
              params.delete('hasLinkedAccount');
              params.delete('hasPassword');
              params.delete('showReactApp');
              hardNavigate(`/?${params.toString()}`);
            }}
          >
            Use a different account
          </a>
        </FtlMsg>
        <FtlMsg id="signin-totp-code-recovery-code-link">
          <Link
            to={`/signin_recovery_code${location.search}`}
            state={signinState}
            className="text-end"
          >
            Trouble entering code?
          </Link>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default SigninTotpCode;
