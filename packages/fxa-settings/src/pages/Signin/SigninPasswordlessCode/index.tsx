/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useState } from 'react';
import { RouteComponentProps, useLocation } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useAuthClient, useFtlMsgResolver } from '../../../models';
import { usePageViewEvent } from '../../../lib/metrics';
import { EmailCodeImage } from '../../../components/images';
import FormVerifyCode, {
  FormAttributes,
} from '../../../components/FormVerifyCode';
import { REACT_ENTRYPOINT } from '../../../constants';
import CardHeader from '../../../components/CardHeader';
import AppLayout from '../../../components/AppLayout';
import { SigninPasswordlessCodeProps } from './interfaces';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import Banner, { ResendCodeSuccessBanner } from '../../../components/Banner';
import { currentAccount } from '../../../lib/cache';
import { setCurrentAccount } from '../../../lib/storage-utils';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';

export const viewName = 'signin-passwordless-code';

const EIGHT_DIGIT_NUMBER_REGEX = /^\d{8}$/;
const RESEND_CODE_COUNTDOWN = 30;

const SigninPasswordlessCode = ({
  email,
  integration,
  finishOAuthFlowHandler,
  setCurrentSplitLayout,
  isSignup = false,
}: SigninPasswordlessCodeProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const authClient = useAuthClient();
  const navigateWithQuery = useNavigateWithQuery();
  const location = useLocation();

  const [localizedErrorBannerMessage, setLocalizedErrorBannerMessage] =
    useState('');
  const [showResendSuccessBanner, setShowResendSuccessBanner] = useState(false);
  const [animateBanner, setAnimateBanner] = useState(false);
  const [codeErrorMessage, setCodeErrorMessage] = useState<string>('');
  const [resendCodeLoading, setResendCodeLoading] = useState<boolean>(false);
  const [resendCountdown, setResendCountdown] = useState<number>(0);

  const ftlMsgResolver = useFtlMsgResolver();
  const localizedCustomCodeRequiredMessage = ftlMsgResolver.getMsg(
    'signin-passwordless-code-required-error',
    'Confirmation code required'
  );
  const localizedInvalidCode = getLocalizedErrorMessage(
    ftlMsgResolver,
    AuthUiErrors.INVALID_VERIFICATION_CODE
  );

  const formAttributes: FormAttributes = {
    inputFtlId: 'signin-passwordless-code-input-label',
    inputLabelText: 'Enter 8-digit code',
    pattern: '[0-9]{8}',
    maxLength: 8,
    submitButtonFtlId: 'signin-passwordless-code-confirm-button',
    submitButtonText: 'Confirm',
  };

  // TODO: Add Glean metrics tracking post-MVP
  // GleanMetrics.loginConfirmation.view() or GleanMetrics.registration.view()

  // Countdown timer for resend code
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [resendCountdown]);

  const handleAnimationEnd = () => {
    setAnimateBanner(false);
  };

  const handleResendCode = async () => {
    setResendCodeLoading(true);
    try {
      await authClient.passwordlessResendCode(email);

      if (showResendSuccessBanner) {
        setAnimateBanner(true);
      } else {
        setShowResendSuccessBanner(true);
      }
    } catch (error: any) {
      setShowResendSuccessBanner(false);
      setLocalizedErrorBannerMessage(
        error.errno === AuthUiErrors.THROTTLED.errno
          ? getLocalizedErrorMessage(ftlMsgResolver, error)
          : ftlMsgResolver.getMsg(
              'signin-passwordless-code-resend-error',
              'Something went wrong. A new code could not be sent.'
            )
      );
    } finally {
      setResendCodeLoading(false);
      setResendCountdown(RESEND_CODE_COUNTDOWN);
    }
  };

  const clearErrorMessages = () => {
    setLocalizedErrorBannerMessage('');
    setCodeErrorMessage('');
  };

  const onSubmit = useCallback(
    async (code: string) => {
      clearErrorMessages();
      if (!EIGHT_DIGIT_NUMBER_REGEX.test(code)) {
        setCodeErrorMessage(localizedInvalidCode);
        return;
      }

      // TODO: Add Glean metrics tracking post-MVP
      try {
        const result = await authClient.passwordlessConfirmCode(email, code);

        // For Sync flows that need encryption keys, redirect to set password page
        // The password is required to derive encryption keys (unwrapBKey)
        if (integration.wantsKeys()) {
          // Store the session data so SetPassword page can use it
          const accountData = {
            uid: result.uid,
            sessionToken: result.sessionToken,
            email,
            verified: result.verified,
            lastLogin: Date.now(),
          };
          currentAccount(accountData);
          setCurrentAccount(result.uid);

          // Navigate to set password page to complete Sync flow
          navigateWithQuery('/post_verify/third_party_auth/set_password', {
            replace: true,
            state: {
              isPasswordlessFlow: true,
            },
          });
          return;
        }

        // For non-Sync flows, complete OAuth flow with the session token
        const { redirect } = await finishOAuthFlowHandler(
          result.uid,
          result.sessionToken,
          undefined, // keyFetchToken - not needed for passwordless
          undefined  // unwrapBKey - not needed for passwordless
        );

        if (redirect) {
          window.location.href = redirect;
        }
      } catch (error: any) {
        // If account has 2FA enabled, redirect to password signin flow
        // User must use password + TOTP for security
        if (error.errno === AuthUiErrors.TOTP_REQUIRED.errno) {
          const signinRoute = location.pathname.startsWith('/oauth')
            ? '/oauth/signin'
            : '/signin';
          navigateWithQuery(signinRoute, {
            replace: true,
            state: {
              email,
              // Show message explaining why they need to use password
              // Note: key is localizedErrorMessage (aliased to localizedErrorFromLocationState in container)
              localizedErrorMessage: ftlMsgResolver.getMsg(
                'signin-passwordless-totp-required',
                'Two-step authentication is enabled on your account. Please sign in with your password.'
              ),
              // Prevent signin container from redirecting back to passwordless
              // even though account is passwordless-eligible (no password + TOTP)
              skipPasswordlessRedirect: true,
            },
          });
          return;
        }

        const localizedErrorMessage = getLocalizedErrorMessage(
          ftlMsgResolver,
          error
        );
        if (error.errno === AuthUiErrors.THROTTLED.errno) {
          setShowResendSuccessBanner(false);
          setLocalizedErrorBannerMessage(localizedErrorMessage);
        } else {
          setCodeErrorMessage(localizedErrorMessage);
        }
      }
    },
    [
      email,
      authClient,
      finishOAuthFlowHandler,
      ftlMsgResolver,
      localizedInvalidCode,
      integration,
      navigateWithQuery,
    ]
  );

  const cmsInfo = integration?.getCmsInfo();
  // Use SigninTokenCodePage as fallback since SigninPasswordlessCodePage doesn't exist in CMS yet
  const title = (cmsInfo as any)?.SigninPasswordlessCodePage?.pageTitle ||
    cmsInfo?.SigninTokenCodePage?.pageTitle;
  const splitLayout = (cmsInfo as any)?.SigninPasswordlessCodePage?.splitLayout ||
    cmsInfo?.SigninTokenCodePage?.splitLayout;

  // Heading and instruction text vary based on signup vs signin
  const headingText = isSignup ? 'Create your account' : 'Enter confirmation code';
  const headingFtlId = isSignup
    ? 'signup-passwordless-code-heading'
    : 'signin-passwordless-code-heading';
  const instructionFtlId = isSignup
    ? 'signup-passwordless-code-instruction'
    : 'signin-passwordless-code-instruction';

  return (
    <AppLayout {...{ cmsInfo, title, splitLayout, setCurrentSplitLayout }}>
      <CardHeader
        headingText={headingText}
        headingAndSubheadingFtlId={headingFtlId}
        {...{
          cmsLogoUrl: cmsInfo?.shared?.logoUrl,
          cmsLogoAltText: cmsInfo?.shared?.logoAltText,
          cmsHeadline: (cmsInfo as any)?.SigninPasswordlessCodePage?.headline ||
            cmsInfo?.SigninTokenCodePage?.headline,
          cmsDescription: (cmsInfo as any)?.SigninPasswordlessCodePage?.description ||
            cmsInfo?.SigninTokenCodePage?.description,
        }}
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

      <FtlMsg
        id={instructionFtlId}
        vars={{ email }}
        elems={{ email: <span className="break-all" /> }}
      >
        <p id="verification-email-message" className="my-4 text-sm">
          {isSignup ? (
            <>
              Enter the 8-digit code that was sent to{' '}
              <span className="break-all">{email}</span> to create your account.
            </>
          ) : (
            <>
              Enter the 8-digit code that was sent to{' '}
              <span className="break-all">{email}</span> within 10 minutes.
            </>
          )}
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
          cmsButton: {
            color: cmsInfo?.shared?.buttonColor,
          },
        }}
      />

      <div className="animate-delayed-fade-in opacity-0 mt-5 text-grey-500 text-xs inline-flex gap-1">
        <FtlMsg id="signin-passwordless-code-expired">
          <p>Code expired?</p>
        </FtlMsg>
        {resendCountdown > 0 ? (
          <FtlMsg
            id="signin-passwordless-code-resend-countdown"
            vars={{ seconds: resendCountdown }}
          >
            <button
              className="link-blue cursor-not-allowed opacity-50"
              disabled
            >
              Email new code in {resendCountdown} seconds
            </button>
          </FtlMsg>
        ) : (
          <FtlMsg id="signin-passwordless-code-resend-link">
            <button
              className="link-blue"
              onClick={handleResendCode}
              disabled={resendCodeLoading}
            >
              Email new code.
            </button>
          </FtlMsg>
        )}
      </div>
    </AppLayout>
  );
};

export default SigninPasswordlessCode;
