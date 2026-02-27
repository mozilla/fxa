/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';
import { FtlMsg, hardNavigate } from 'fxa-react/lib/utils';
import { useAlertBar, useAuthClient, useFtlMsgResolver } from '../../../models';
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
import { setCurrentAccount, storeAccountData } from '../../../lib/storage-utils';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import {
  isOAuthIntegration,
  isSyncDesktopV3Integration,
  isWebIntegration,
} from '../../../models';
import { getSyncNavigate, handleNavigation } from '../utils';
import firefox from '../../../lib/channels/firefox';
import { useWebRedirect } from '../../../lib/hooks/useWebRedirect';

export const viewName = 'signin-passwordless-code';

const EIGHT_DIGIT_NUMBER_REGEX = /^\d{8}$/;
const RESEND_CODE_COUNTDOWN = 30;

const SigninPasswordlessCode = ({
  email,
  expirationMinutes,
  integration,
  finishOAuthFlowHandler,
  setCurrentSplitLayout,
  isSignup = false,
}: SigninPasswordlessCodeProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const authClient = useAuthClient();
  const navigateWithQuery = useNavigateWithQuery();
  const navigate = useNavigate();
  const webRedirectCheck = useWebRedirect(integration.data.redirectTo);
  const location = useLocation();
  const alertBar = useAlertBar();

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

  function goToSettingsWithAlertSuccess() {
    alertBar.success(
      ftlMsgResolver.getMsg(
        'confirm-signup-code-success-alert',
        'Account confirmed successfully'
      )
    );
    navigateWithQuery('/settings', { replace: true });
  }

  const handleAnimationEnd = () => {
    setAnimateBanner(false);
  };

  const handleResendCode = async () => {
    setResendCodeLoading(true);
    try {
      await authClient.passwordlessResendCode(email, { clientId: integration.getClientId() });

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

  const onSubmit =
    async (code: string) => {
      clearErrorMessages();
      // TODO: This can't be hardcoded
      if (!EIGHT_DIGIT_NUMBER_REGEX.test(code)) {
        setCodeErrorMessage(localizedInvalidCode);
        return;
      }

      // TODO: Add Glean metrics tracking post-MVP
      try {
        const result = await authClient.passwordlessConfirmCode(email, code, { clientId: integration.getClientId() });

        storeAccountData({
          sessionToken: result.sessionToken,
          email,
          uid: result.uid,
          // Update verification status of stored current account
          verified: true,
          sessionVerified: true,
        });

        // For flows that need encryption keys, redirect to set password page
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

          // Navigate to set password page to complete flow
          navigateWithQuery('/post_verify/third_party_auth/set_password', {
            replace: true,
            state: {
              isPasswordlessFlow: true,
            },
          });
          return;
        }

        if (isSignup) {
          // For non-Sync flows, complete OAuth flow with the session token
          //const { redirect } = await finishOAuthFlowHandler(
          //  result.uid,
          //  result.sessionToken,
          //  undefined, // keyFetchToken - not needed for passwordless
          //  undefined  // unwrapBKey - not needed for passwordless
          //);

          //if (redirect) {
          //  window.location.href = redirect;
          //}

          if (isSyncDesktopV3Integration(integration)) {
            const { to } = getSyncNavigate(location.search, {
              showSignupConfirmedSync: true,
            });
            navigate(to);
          } else if (isOAuthIntegration(integration)) {
            // Check to see if the relier wants TOTP
            // Certain reliers (currently AMO only) may require users to set up 2FA / TOTP
            // before they can be redirected back to the RP.
            // Newly created accounts wouldn't have this so let's redirect them to inline_totp_setup.

            if (integration.wantsTwoStepAuthentication()) {
              navigateWithQuery('/inline_totp_setup', {
                state: {
                  email,
                  uid: result.uid,
                  sessionToken: result.sessionToken,
                  verificationReason: 'signup',
                  verified: true,
                },
              });
              return;
            } else {
              const { redirect, code, state, error } = await finishOAuthFlowHandler(
                result.uid,
                result.sessionToken,
                undefined,
                undefined
              );
              if (error) {
                //setLocalizedErrorBannerHeading(
                //  getLocalizedErrorMessage(ftlMsgResolver, error)
                //);
                return;
              }

              if (integration.isFirefoxNonSync()) {
                firefox.fxaOAuthLogin({
                  action: 'signup',
                  code,
                  redirect,
                  state,
                });
                goToSettingsWithAlertSuccess();
              } else {
                // Navigate to relying party
                hardNavigate(redirect, {
                  newAccountVerification: 'true',
                });
                return;
              }
            }
          } else if (isWebIntegration(integration)) {
            if (integration.data.redirectTo) {
              if (webRedirectCheck.isValid) {
                hardNavigate(integration.data.redirectTo);
              } else if (webRedirectCheck?.localizedInvalidRedirectError) {
                // Even if the code submission is successful, show the user this error
                // message if the redirect is invalid to match parity with content-server.
                // This may but may be revisited when we look at our signup flows as a whole.
                console.error('webRedirectCheckError', webRedirectCheck.localizedInvalidRedirectError)
                //setLocalizedErrorBannerHeading(
                //  webRedirectCheck.localizedInvalidRedirectError
                //);
              }
            } else {
              goToSettingsWithAlertSuccess();
            }
          }
        } else {
          const navigationOptions = {
            email,
            signinData: {
              uid: result.uid,
              sessionToken: result.sessionToken,
              emailVerified: result.verified,
              sessionVerified: result.verified,
            },
            integration,
            finishOAuthFlowHandler,
            redirectTo:
              isWebIntegration(integration) && webRedirectCheck?.isValid
                ? integration.data.redirectTo
                : '',
            queryParams: location.search,
            handleFxaLogin: true,
            handleFxaOAuthLogin: true,
            performNavigation: !(
              integration.isFirefoxMobileClient() && result.verified
            ),
          }
          const { error: navError } = await handleNavigation(navigationOptions);
          if (navError) {
            //TODO: Better handling
            console.log(navError)
          }
        };
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
    }

  const cmsInfo = integration?.getCmsInfo();
  //TODO: Signup/SigninPasswordlessCodePage to be added as part of FXA-13020
  const title = isSignup
    ? cmsInfo?.SignupPasswordlessCodePage?.pageTitle
    : cmsInfo?.SigninPasswordlessCodePage?.pageTitle;
  const splitLayout = isSignup
    ? cmsInfo?.SignupPasswordlessCodePage?.splitLayout
    : cmsInfo?.SigninPasswordlessCodePage?.splitLayout;
  const cmsHeadline = isSignup
    ? cmsInfo?.SignupPasswordlessCodePage?.headline
    : cmsInfo?.SigninPasswordlessCodePage?.headline;
  const cmsDescription = isSignup
    ? cmsInfo?.SignupPasswordlessCodePage?.description
    : cmsInfo?.SigninPasswordlessCodePage?.description;

  // Heading and instruction text vary based on signup vs signin
  const subHeadingText = isSignup
    ? 'Sign up only takes a single step when you use this code.'
    : 'Sign in only takes a single step when you use this code.';
  const subHeadingFtlId = isSignup
    ? 'signup-passwordless-code-subheading'
    : 'signin-passwordless-code-subheading';

  const handleDifferentAccountClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // TODO: Add Glean metrics tracking post-MVP
    // GleanMetrics.passwordlessLogin.diffAccountLinkClick();

    // Remove email from query params if present
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete('email');
    navigateWithQuery(`/?${searchParams.toString()}`, {
      state: {
        prefillEmail: email,
      },
    });
  };

  return (
    <AppLayout {...{ cmsInfo, title, splitLayout, setCurrentSplitLayout }}>
      <CardHeader
        headingText="Enter confirmation code"
        headingAndSubheadingFtlId="signin-passwordless-code-heading"
        subheadingText={subHeadingText}
        subheadingWithDefaultServiceFtlId={subHeadingFtlId}
        {...{
          cmsLogoUrl: cmsInfo?.shared?.logoUrl,
          cmsLogoAltText: cmsInfo?.shared?.logoAltText,
          cmsHeadline,
          cmsDescription,
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

      <p id="verification-email-message" className="my-4 text-sm">
        <FtlMsg
          id="signin-passwordless-code-instruction"
          vars={{ email, expirationMinutes }}
          elems={{
            email: <span className="font-bold">{email}</span>,
          }}
        >
          <span>
            Enter the code that was sent to{' '}
            <span className="font-bold">{email}</span> within{' '}
            {expirationMinutes === 1 ? '1 minute' : `${expirationMinutes} minutes`}.
          </span>
        </FtlMsg>{' '}
        <FtlMsg id="signin-passwordless-code-other-account-link">
          <a
            href="/"
            className="link-blue"
            onClick={handleDifferentAccountClick}
          >
            Use a different account
          </a>
        </FtlMsg>
      </p>

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

      <div className="animate-delayed-fade-in opacity-0 text-grey-500 text-sm inline-flex gap-1">
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
