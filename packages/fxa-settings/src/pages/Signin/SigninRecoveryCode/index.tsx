/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useState } from 'react';
import { RouteComponentProps, useLocation } from '@reach/router';
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
import ButtonBack from '../../../components/ButtonBack';
import classNames from 'classnames';

export const viewName = 'signin-recovery-code';

const SigninRecoveryCode = ({
  finishOAuthFlowHandler,
  integration,
  keyFetchToken,
  lastFourPhoneDigits,
  navigateToRecoveryPhone,
  signinState,
  submitRecoveryCode,
  unwrapBKey,
}: SigninRecoveryCodeProps & RouteComponentProps) => {
  useEffect(() => {
    GleanMetrics.loginBackupCode.view();
  }, []);

  const [codeErrorMessage, setCodeErrorMessage] = useState<string>('');
  const [bannerErrorMessage, setBannerErrorMessage] = useState<string>('');
  const [bannerErrorDescription, setBannerErrorDescription] =
    useState<string>('');
  const ftlMsgResolver = useFtlMsgResolver();
  const localizedCustomCodeRequiredMessage = ftlMsgResolver.getMsg(
    'signin-recovery-code-required-error',
    'Backup authentication code required'
  );
  const location = useLocation();

  const webRedirectCheck = useWebRedirect(integration.data.redirectTo);

  const redirectTo =
    isWebIntegration(integration) && webRedirectCheck?.isValid
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

  const clearBanners = () => {
    setBannerErrorMessage('');
    setBannerErrorDescription('');
    setCodeErrorMessage('');
  };

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
    clearBanners();
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

  const handleNavigateToRecoveryPhone = async () => {
    clearBanners();
    const handledError = await navigateToRecoveryPhone();
    if (!handledError) {
      return;
    }
    if (
      handledError.errno === AuthUiErrors.BACKEND_SERVICE_FAILURE.errno ||
      handledError.errno === AuthUiErrors.SMS_SEND_RATE_LIMIT_EXCEEDED.errno ||
      handledError.errno === AuthUiErrors.UNEXPECTED_ERROR.errno
    ) {
      setBannerErrorMessage(
        ftlMsgResolver.getMsg(
          'signin-recovery-code-use-phone-failure',
          'There was a problem sending a code to your recovery phone'
        )
      );
      setBannerErrorDescription(
        ftlMsgResolver.getMsg(
          'signin-recovery-code-use-phone-failure-description',
          'Please try again later.'
        )
      );
      return;
    }
    setBannerErrorMessage(
      getLocalizedErrorMessage(ftlMsgResolver, handledError)
    );
  };

  return (
    <AppLayout>
      <div className="relative flex items-center mb-5">
        <ButtonBack />
        <FtlMsg id="signin-recovery-code-heading">
          <HeadingPrimary marginClass="">Sign in</HeadingPrimary>
        </FtlMsg>
      </div>

      {bannerErrorMessage && (
        <Banner
          type="error"
          content={{
            localizedHeading: bannerErrorMessage,
            localizedDescription: bannerErrorDescription,
          }}
        />
      )}
      <BackupCodesImage />

      <FtlMsg id="signin-recovery-code-sub-heading">
        <h2 className="card-header">Enter backup authentication code</h2>
      </FtlMsg>

      <FtlMsg id="signin-recovery-code-instruction-v3">
        <p className="mt-2 text-sm">
          Enter one of the one-time-use codes you saved when you set up two-step
          authentication.
        </p>
      </FtlMsg>

      {integration.isDesktopRelay() && (
        <FtlMsg id="signin-recovery-code-desktop-relay">
          <p className="text-sm mt-2">
            Firefox will try sending you back to use an email mask after you
            sign in.
          </p>
        </FtlMsg>
      )}

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

      <div
        className={classNames(
          'mt-10 link-blue text-sm flex',
          lastFourPhoneDigits ? 'justify-between' : 'justify-center'
        )}
      >
        {lastFourPhoneDigits && (
          <FtlMsg id="signin-recovery-code-phone-link">
            <button
              className="link-blue"
              data-glean-id="signin-recovery-code-phone-button"
              onClick={handleNavigateToRecoveryPhone}
            >
              Use recovery phone
            </button>
          </FtlMsg>
        )}
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
