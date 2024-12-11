/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useState } from 'react';
import { RouteComponentProps, useLocation } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import {
  isWebIntegration,
  useFtlMsgResolver,
  useSession,
} from '../../../models';
import { usePageViewEvent } from '../../../lib/metrics';
import { EmailCodeImage } from '../../../components/images';
import FormVerifyCode, {
  FormAttributes,
} from '../../../components/FormVerifyCode';
import { REACT_ENTRYPOINT } from '../../../constants';
import CardHeader from '../../../components/CardHeader';
import GleanMetrics from '../../../lib/glean';
import AppLayout from '../../../components/AppLayout';
import { SigninTokenCodeProps } from './interfaces';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { handleNavigation } from '../utils';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import { useWebRedirect } from '../../../lib/hooks/useWebRedirect';
import Banner, { ResendCodeSuccessBanner } from '../../../components/Banner';

export const viewName = 'signin-token-code';

const SIX_DIGIT_NUMBER_REGEX = /^\d{6}$/;

const SigninTokenCode = ({
  finishOAuthFlowHandler,
  integration,
  signinState,
  keyFetchToken,
  unwrapBKey,
  onSessionVerified,
}: SigninTokenCodeProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const session = useSession();
  const location = useLocation();

  const {
    email,
    uid,
    sessionToken,
    verificationReason,
    showInlineRecoveryKeySetup,
  } = signinState;

  const [localizedErrorBannerMessage, setLocalizedErrorBannerMessage] =
    useState('');
  const [showResendSuccessBanner, setShowResendSuccessBanner] = useState(false);
  const [animateBanner, setAnimateBanner] = useState(false);
  const [codeErrorMessage, setCodeErrorMessage] = useState<string>('');
  const [resendCodeLoading, setResendCodeLoading] = useState<boolean>(false);

  const webRedirectCheck = useWebRedirect(integration.data.redirectTo);
  const redirectTo =
    isWebIntegration(integration) && webRedirectCheck?.isValid
      ? integration.data.redirectTo
      : '';

  const ftlMsgResolver = useFtlMsgResolver();
  const localizedCustomCodeRequiredMessage = ftlMsgResolver.getMsg(
    'signin-token-code-required-error',
    'Confirmation code required'
  );
  const localizedInvalidCode = getLocalizedErrorMessage(
    ftlMsgResolver,
    AuthUiErrors.INVALID_VERIFICATION_CODE
  );

  const formAttributes: FormAttributes = {
    inputFtlId: 'signin-token-code-input-label-v2',
    inputLabelText: 'Enter 6-digit code',
    pattern: '[0-9]{6}',
    maxLength: 6,
    submitButtonFtlId: 'signin-token-code-confirm-button',
    submitButtonText: 'Confirm',
  };

  useEffect(() => {
    GleanMetrics.loginConfirmation.view();
  }, []);

  const handleAnimationEnd = () => {
    // We add the "shake" animation to bring attention to the success banner
    // when the success banner was already displayed. We have to remove the
    // class once the animation completes or the animation won't replay.
    setAnimateBanner(false);
  };

  const handleResendCode = async () => {
    setResendCodeLoading(true);
    try {
      await session.sendVerificationCode();
      if (showResendSuccessBanner) {
        // shake the banner if it is already displayed
        setAnimateBanner(true);
      } else {
        setShowResendSuccessBanner(true);
      }
    } catch (error) {
      setShowResendSuccessBanner(false);
      // TODO in FXA-9714 - verify if we only want to display a specific message for throttled errors
      setLocalizedErrorBannerMessage(
        error.errno === AuthUiErrors.THROTTLED.errno
          ? getLocalizedErrorMessage(ftlMsgResolver, error)
          : ftlMsgResolver.getMsg(
              'signin-token-code-resend-error',
              'Something went wrong. A new code could not be sent.'
            )
      );
    } finally {
      setResendCodeLoading(false);
    }
  };

  const onSubmit = useCallback(
    async (code: string) => {
      if (!SIX_DIGIT_NUMBER_REGEX.test(code)) {
        setCodeErrorMessage(localizedInvalidCode);
        return;
      }

      GleanMetrics.loginConfirmation.submit();
      try {
        await session.verifySession(code);

        // Attempt to finish any key stretching upgrades
        await onSessionVerified(sessionToken);

        // TODO: Bounced email redirect to `/signin_bounced`. Try
        // reaching signin_token_code in one browser and deleting the account
        // in another. You reach the "Sorry. We've locked your account" screen
        GleanMetrics.loginConfirmation.success();

        const navigationOptions = {
          email,
          signinData: {
            uid,
            sessionToken,
            verificationReason,
            verified: true,
            keyFetchToken,
          },
          unwrapBKey,
          integration,
          finishOAuthFlowHandler,
          queryParams: location.search,
          redirectTo,
          showInlineRecoveryKeySetup,
          handleFxaLogin: false,
          handleFxaOAuthLogin: true,
        };

        await GleanMetrics.isDone();

        const { error: navError } = await handleNavigation(navigationOptions);
        if (navError) {
          setLocalizedErrorBannerMessage(
            getLocalizedErrorMessage(ftlMsgResolver, navError)
          );
        }
      } catch (error) {
        const localizedErrorMessage = getLocalizedErrorMessage(
          ftlMsgResolver,
          error
        );
        if (error.errno === AuthUiErrors.THROTTLED.errno) {
          setShowResendSuccessBanner(false);
          setLocalizedErrorBannerMessage(localizedErrorMessage);
        } else {
          // TODO in FXA-9714 - show in tooltip or banner? we might end up with unexpected errors shown in tooltip with current pattern
          setCodeErrorMessage(localizedErrorMessage);
        }
      }
    },
    [
      email,
      finishOAuthFlowHandler,
      ftlMsgResolver,
      integration,
      keyFetchToken,
      localizedInvalidCode,
      location.search,
      redirectTo,
      session,
      sessionToken,
      uid,
      unwrapBKey,
      verificationReason,
      showInlineRecoveryKeySetup,
      onSessionVerified,
    ]
  );

  return (
    <AppLayout>
      <CardHeader
        headingText="Enter confirmation code"
        headingAndSubheadingFtlId="signin-token-code-heading-2"
      />
      {showResendSuccessBanner && !localizedErrorBannerMessage && (
        <ResendCodeSuccessBanner
          animation={{
            handleAnimationEnd,
            animate: animateBanner,
            className: 'animate-shake',
          }}
        />
      )}
      {localizedErrorBannerMessage && (
        <Banner
          type="error"
          content={{ localizedHeading: localizedErrorBannerMessage }}
        />
      )}

      <EmailCodeImage />

      <FtlMsg id="signin-token-code-instruction" vars={{ email }}>
        <p id="verification-email-message" className="my-4 text-sm">
          Enter the code that was sent to {email} within 5 minutes.
        </p>
      </FtlMsg>

      {integration.isDesktopRelay() && (
        <FtlMsg id="signin-token-code-instruction-desktop-relay">
          <p className="mt-2 text-sm">
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

      <div className="animate-delayed-fade-in opacity-0 mt-5 text-grey-500 text-xs inline-flex gap-1">
        <FtlMsg id="signin-token-code-code-expired">
          <p>Code expired?</p>
        </FtlMsg>
        <FtlMsg id="signin-token-code-resend-code-link">
          <button
            className="link-blue"
            onClick={handleResendCode}
            disabled={resendCodeLoading}
          >
            Email new code.
          </button>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default SigninTokenCode;
