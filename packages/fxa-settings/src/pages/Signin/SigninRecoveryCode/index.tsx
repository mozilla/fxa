/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useState } from 'react';
import { Link, RouteComponentProps, useLocation } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { isWebIntegration, useFtlMsgResolver } from '../../../models';
import { BackupCodesImage } from '../../../components/images';
import LinkExternal from 'fxa-react/components/LinkExternal';
import FormVerifyCode, {
  FormAttributes,
  InputModeEnum,
} from '../../../components/FormVerifyCode';
import GleanMetrics from '../../../lib/glean';
import AppLayout from '../../../components/AppLayout';
import { SigninRecoveryCodeProps } from './interfaces';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { storeAccountData } from '../../../lib/storage-utils';
import { handleNavigation } from '../utils';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import { useWebRedirect } from '../../../lib/hooks/useWebRedirect';
import { isBase32Crockford } from '../../../lib/utilities';
import Banner from '../../../components/Banner';
import { HeadingPrimary } from '../../../components/HeadingPrimary';

export const viewName = 'signin-recovery-code';

const SigninRecoveryCode = ({
  finishOAuthFlowHandler,
  integration,
  serviceName,
  signinState,
  submitRecoveryCode,
  keyFetchToken,
  unwrapBKey,
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

  const webRedirectCheck = useWebRedirect(integration.data.redirectTo);

  const redirectTo =
    isWebIntegration(integration) && webRedirectCheck.isValid()
      ? integration.data.redirectTo
      : '';

  const formAttributes: FormAttributes = {
    inputFtlId: 'signin-recovery-code-input-label-v2',
    inputLabelText: 'Enter 10-character code',
    inputMode: InputModeEnum.text,
    pattern: '[a-zA-Z0-9]',
    maxLength: 10,
    submitButtonFtlId: 'signin-recovery-code-confirm-button',
    submitButtonText: 'Confirm',
  };

  const { email, sessionToken, uid, verificationMethod, verificationReason } =
    signinState;

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
      handleFxaLogin: true,
      handleFxaOAuthLogin: true,
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

  const localizedInvalidCodeError = getLocalizedErrorMessage(
    ftlMsgResolver,
    AuthUiErrors.INVALID_RECOVERY_CODE
  );

  const onSubmit = async (code: string) => {
    setCodeErrorMessage('');
    setBannerErrorMessage('');
    GleanMetrics.loginBackupCode.submit();

    if (code.length !== 10 || !isBase32Crockford(code)) {
      setCodeErrorMessage(localizedInvalidCodeError);
      return;
    }

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

      localizedError = getLocalizedErrorMessage(ftlMsgResolver, response.error);
      if (localizedError === localizedInvalidCodeError) {
        setCodeErrorMessage(localizedError);
        return;
      }
      setBannerErrorMessage(localizedError);
    }
  };

  return (
    <AppLayout>
      <FtlMsg id="signin-recovery-code-heading">
        <HeadingPrimary>Sign in</HeadingPrimary>
      </FtlMsg>

      {bannerErrorMessage && (
        <Banner
          type="error"
          content={{ localizedHeading: bannerErrorMessage }}
        />
      )}
      <BackupCodesImage />

      <FtlMsg id="signin-recovery-code-sub-heading">
        <h2 className="card-header">Enter backup authentication code</h2>
      </FtlMsg>

      <FtlMsg id="signin-recovery-code-instruction-v2">
        <p className="mt-2 text-sm">
          Enter one of the one-time use backup authentication codes you saved
          during two-step authentication setup.
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

      <div className="mt-10 link-blue text-sm flex justify-between">
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
