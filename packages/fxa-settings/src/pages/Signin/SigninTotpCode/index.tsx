/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { Link, RouteComponentProps, useLocation } from '@reach/router';
import { FtlMsg, hardNavigate } from 'fxa-react/lib/utils';
import { useConfig, useFtlMsgResolver } from '../../../models';
import { logViewEvent } from '../../../lib/metrics';
import { MozServices } from '../../../lib/types';
import AppLayout from '../../../components/AppLayout';
import GleanMetrics from '../../../lib/glean';
import { SigninIntegration, SigninLocationState } from '../interfaces';
import { handleNavigation } from '../utils';
import { FinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { storeAccountData } from '../../../lib/storage-utils';
import {
  getLocalizedErrorMessage,
  HandledError,
} from '../../../lib/error-utils';
import protectionShieldIcon from '@fxa/shared/assets/images/protection-shield.svg';
import Banner from '../../../components/Banner';
import { SensitiveData } from '../../../lib/sensitive-data-client';
import { HeadingPrimary } from '../../../components/HeadingPrimary';
import FormVerifyTotp from '../../../components/FormVerifyTotp';

// TODO: show a banner success message if a user is coming from reset password
// in FXA-6491. This differs from content-server where currently, users only
// get an email confirmation with no success message.

export type SigninTotpCodeProps = {
  finishOAuthFlowHandler: FinishOAuthFlowHandler;
  integration: SigninIntegration;
  redirectTo?: string;
  signinState: SigninLocationState;
  // TODO: Switch to gql error shaped object
  submitTotpCode: (totpCode: string) => Promise<{ error?: HandledError }>;
  serviceName?: MozServices;
} & SensitiveData.AuthData;

export const viewName = 'signin-totp-code';

export const SigninTotpCode = ({
  finishOAuthFlowHandler,
  integration,
  redirectTo,
  signinState,
  submitTotpCode,
  keyFetchToken,
  unwrapBKey,
}: SigninTotpCodeProps & RouteComponentProps) => {
  const config = useConfig();
  const ftlMsgResolver = useFtlMsgResolver();
  const location = useLocation();

  const [bannerError, setBannerError] = useState<string>('');

  const {
    email,
    uid,
    sessionToken,
    verificationMethod,
    verificationReason,
    showInlineRecoveryKeySetup,
  } = signinState;

  useEffect(() => {
    GleanMetrics.totpForm.view();
  }, []);

  const onSubmit = async (code: string) => {
    setBannerError('');

    const { error } = await submitTotpCode(code);
    GleanMetrics.totpForm.submit();
    logViewEvent('flow', `${viewName}.submit`);

    if (error) {
      setBannerError(getLocalizedErrorMessage(ftlMsgResolver, error));
      return;
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
        handleFxaLogin: true,
        handleFxaOAuthLogin: true,
      };

      const { error: navError } = await handleNavigation(navigationOptions);
      if (navError) {
        setBannerError(getLocalizedErrorMessage(ftlMsgResolver, navError));
      }
    }
  };

  const troubleWithCodeTarget = config.featureFlags?.enableUsing2FABackupPhone
    ? 'signin_recovery_choice'
    : 'signin_recovery_code';

  return (
    <AppLayout>
      <FtlMsg id="signin-totp-code-header">
        <HeadingPrimary>Sign in</HeadingPrimary>
      </FtlMsg>
      <FtlMsg id="signin-totp-code-subheader-v2">
        <h2 className="card-header">Enter two-step authentication code</h2>
      </FtlMsg>

      <div className="flex space-x-4">
        <img src={protectionShieldIcon} alt="" />
        <FtlMsg id="signin-totp-code-instruction-v4">
          <p className="mt-5 text-md">
            Check your <strong>authenticator app</strong> to confirm your
            sign-in.
          </p>
        </FtlMsg>
      </div>

      {integration.isDesktopRelay() && (
        <FtlMsg id="signin-totp-code-desktop-relay">
          <p className="mt-2 mb-4 text-sm">
            Firefox will try sending you back to use an email mask after you
            sign in.
          </p>
        </FtlMsg>
      )}

      {bannerError && (
        <Banner type="error" content={{ localizedHeading: bannerError }} />
      )}

      <FormVerifyTotp
        codeLength={6}
        codeType="numeric"
        errorMessage={bannerError}
        localizedInputLabel={ftlMsgResolver.getMsg(
          'signin-totp-code-input-label-v4',
          'Enter 6-digit code'
        )}
        localizedSubmitButtonText={ftlMsgResolver.getMsg(
          'signin-totp-code-confirm-button',
          'Confirm'
        )}
        setErrorMessage={setBannerError}
        verifyCode={onSubmit}
      />
      <div className="mt-8 link-blue text-sm flex justify-between">
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
            to={`/${troubleWithCodeTarget}${location.search}`}
            state={signinState}
            className="text-end"
            data-glean-id="login_totp_code_trouble_link"
          >
            Trouble entering code?
          </Link>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default SigninTotpCode;
