/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { usePageViewEvent } from '../../../lib/metrics';
import { FtlMsg } from 'fxa-react/lib/utils';
import { RouteComponentProps, useLocation } from '@reach/router';
import { useNavigateWithQuery as useNavigate } from '../../../lib/hooks/useNavigateWithQuery';
import { REACT_ENTRYPOINT } from '../../../constants';
import CardHeader from '../../../components/CardHeader';
import AppLayout from '../../../components/AppLayout';
import FormVerifyCode, {
  FormAttributes,
  InputModeEnum,
} from '../../../components/FormVerifyCode';
import { useFtlMsgResolver } from '../../../models';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { SigninUnblockProps } from './interfaces';
import Banner, {
  BannerType,
  ResendEmailSuccessBanner,
} from '../../../components/Banner';
import { MailImage } from '../../../components/images';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import GleanMetrics from '../../../lib/glean';
import {
  StoredAccountData,
  storeAccountData,
} from '../../../lib/storage-utils';
import { handleNavigation } from '../utils';
import { ResendStatus } from '../../../lib/types';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';

export const viewName = 'signin-unblock';

export const SigninUnblock = ({
  email,
  hasLinkedAccount,
  hasPassword,
  signinWithUnblockCode,
  resendUnblockCodeHandler,
  integration,
  finishOAuthFlowHandler,
}: SigninUnblockProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const [bannerErrorMessage, setBannerErrorMessage] = useState('');
  const [codeErrorMessage, setCodeErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<ResendStatus>(
    ResendStatus.none
  );

  const ftlMsgResolver = useFtlMsgResolver();
  const location = useLocation();
  const navigate = useNavigate();

  const formAttributes: FormAttributes = {
    inputFtlId: 'signin-unblock-code-input',
    inputLabelText: 'Enter authorization code',
    inputMode: InputModeEnum.text,
    pattern: '[a-zA-Z0-9]{8}',
    maxLength: 8,
    submitButtonFtlId: 'signin-unblock-submit-button',
    submitButtonText: 'Continue',
  };

  const localizedCustomCodeRequiredMessage = ftlMsgResolver.getMsg(
    'signin-unblock-code-required-error',
    'Authorization code required'
  );

  const isValidCodeFormat = (unblockCode: string) => {
    return /^[a-zA-Z0-9]+$/.test(unblockCode);
  };

  const isValidLength = (unblockCode: string) => {
    return unblockCode.length === 8;
  };

  const getCodeFormatErrorMessage = (unblockCode: string) => {
    if (!isValidLength(unblockCode)) {
      return ftlMsgResolver.getMsg(
        'signin-unblock-code-incorrect-length',
        'Authorization code must contain 8 characters'
      );
    }
    if (!isValidCodeFormat(unblockCode)) {
      return ftlMsgResolver.getMsg(
        'signin-unblock-code-incorrect-format-2',
        'Authorization code can only contain letters and/or numbers'
      );
    }
    return;
  };

  const onSubmit = async (unblockCode: string) => {
    setBannerErrorMessage('');
    setResendStatus(ResendStatus.none);

    // Check if code format is valid and abort submission if not
    const localizedCodeInputError = getCodeFormatErrorMessage(unblockCode);
    if (localizedCodeInputError) {
      setCodeErrorMessage(localizedCodeInputError);
      return;
    }

    setIsLoading(true);
    GleanMetrics.login.submit();
    const { data, error } = await signinWithUnblockCode(unblockCode);
    if (data) {
      GleanMetrics.login.success();

      const accountData: StoredAccountData = {
        email,
        uid: data.signIn.uid,
        lastLogin: Date.now(),
        sessionToken: data.signIn.sessionToken,
        verified: data.signIn.verified,
        metricsEnabled: data.signIn.metricsEnabled,
      };

      storeAccountData(accountData);

      const navigationOptions = {
        email,
        signinData: data.signIn,
        unwrapBKey: data.unwrapBKey,
        integration,
        finishOAuthFlowHandler,
        queryParams: location.search,
      };

      const { error: navError } = await handleNavigation(navigationOptions, {
        handleFxaLogin: true,
        handleFxaOAuthLogin: true,
      });
      if (navError) {
        setBannerErrorMessage(
          getLocalizedErrorMessage(ftlMsgResolver, navError)
        );
      }
    }
    if (error) {
      const localizedErrorMessage = getLocalizedErrorMessage(
        ftlMsgResolver,
        error
      );
      switch (error.errno) {
        case AuthUiErrors.INCORRECT_PASSWORD.errno:
          navigate(`/signin`, {
            state: {
              email,
              // TODO: in FXA-9177, retrieve hasLinkedAccount and hasPassword from Apollo cache
              hasLinkedAccount,
              hasPassword,
              localizedErrorMessage,
            },
          });
          break;
        case AuthUiErrors.INCORRECT_UNBLOCK_CODE.errno:
        case AuthUiErrors.INVALID_UNBLOCK_CODE.errno:
          setCodeErrorMessage(localizedErrorMessage);
          break;
        default:
          setBannerErrorMessage(localizedErrorMessage);
      }
    }
    setIsLoading(false);
  };

  const handleResend = async () => {
    const { success, localizedErrorMessage } = await resendUnblockCodeHandler();
    if (success) {
      setBannerErrorMessage('');
      setResendStatus(ResendStatus.sent);
    } else if (localizedErrorMessage) {
      setResendStatus(ResendStatus.error);
      setBannerErrorMessage(localizedErrorMessage);
    }
  };

  return (
    <AppLayout>
      <CardHeader
        headingText="Authorize this sign-in"
        headingTextFtlId="signin-unblock-header"
      />
      {bannerErrorMessage && (
        <Banner type={BannerType.error}>{bannerErrorMessage}</Banner>
      )}
      {resendStatus === ResendStatus.sent && <ResendEmailSuccessBanner />}
      <MailImage />
      <FtlMsg id="signin-unblock-body" vars={{ email }}>
        <p className="text-sm">
          Check your email for the authorization code sent to {email}.
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
          isLoading,
        }}
      />
      <div className="flex flex-col items-center gap-3">
        <FtlMsg id="signin-unblock-resend-code-button">
          <button className="link-blue text-sm" onClick={handleResend}>
            Not in inbox or spam folder? Resend
          </button>
        </FtlMsg>
        <FtlMsg id="signin-unblock-support-link">
          <LinkExternal
            href="https://support.mozilla.org/kb/accounts-blocked"
            className="link-blue text-sm"
          >
            Why is this happening?
          </LinkExternal>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default SigninUnblock;
