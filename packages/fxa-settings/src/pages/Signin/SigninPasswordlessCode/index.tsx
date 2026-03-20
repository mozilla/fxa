/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef, useState } from 'react';
import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';
import { FtlMsg, hardNavigate } from 'fxa-react/lib/utils';
import { useAlertBar, useAuthClient, useFtlMsgResolver } from '../../../models';
import {
  queryParamsToMetricsContext,
  usePageViewEvent,
} from '../../../lib/metrics';
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
import {
  setCurrentAccount,
  storeAccountData,
} from '../../../lib/storage-utils';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import {
  isOAuthIntegration,
  isSyncDesktopV3Integration,
  isWebIntegration,
} from '../../../models';
import { getSyncNavigate, handleNavigation } from '../utils';
import firefox from '../../../lib/channels/firefox';
import { useWebRedirect } from '../../../lib/hooks/useWebRedirect';
import VerificationMethods from '../../../constants/verification-methods';
import VerificationReasons from '../../../constants/verification-reasons';
import GleanMetrics from '../../../lib/glean';

export const viewName = 'signin-passwordless-code';

const EIGHT_DIGIT_NUMBER_REGEX = /^\d{8}$/;
const RESEND_CODE_COUNTDOWN = 30;

const SigninPasswordlessCode = ({
  email,
  expirationMinutes,
  integration,
  finishOAuthFlowHandler,
  flowQueryParams,
  setCurrentSplitLayout,
  isSignup = false,
  resendCountdownSeconds = 0,
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
  const [resendCountdown, setResendCountdown] = useState<number>(
    resendCountdownSeconds
  );

  const gleanOtp = isSignup
    ? GleanMetrics.passwordlessReg
    : GleanMetrics.passwordlessLogin;

  const gleanViewTracked = useRef(false);

  useEffect(() => {
    if (!gleanViewTracked.current) {
      gleanOtp.view();
      gleanViewTracked.current = true;
    }
  }, [gleanOtp]);

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
    gleanOtp.resendCode();
    try {
      await authClient.passwordlessResendCode(email, {
        clientId: integration.getClientId(),
        service: integration.getService(),
        metricsContext: {
          ...queryParamsToMetricsContext(
            flowQueryParams as unknown as Record<string, string>
          ),
          clientId: integration.getClientId(),
        },
      });

      if (showResendSuccessBanner) {
        setAnimateBanner(true);
      } else {
        setShowResendSuccessBanner(true);
      }
    } catch (error: any) {
      setShowResendSuccessBanner(false);
      if (error.errno === AuthUiErrors.THROTTLED.errno) {
        gleanOtp.error({ event: { reason: 'too many times' } });
        setLocalizedErrorBannerMessage(
          getLocalizedErrorMessage(ftlMsgResolver, error)
        );
      } else {
        gleanOtp.error({ event: { reason: 'try again later' } });
        setLocalizedErrorBannerMessage(
          ftlMsgResolver.getMsg(
            'signin-passwordless-code-resend-error',
            'Something went wrong. A new code could not be sent.'
          )
        );
      }
    } finally {
      setResendCodeLoading(false);
      setResendCountdown(RESEND_CODE_COUNTDOWN);
    }
  };

  const clearErrorMessages = () => {
    setLocalizedErrorBannerMessage('');
    setCodeErrorMessage('');
  };

  const onSubmit = async (code: string) => {
    clearErrorMessages();
    if (!EIGHT_DIGIT_NUMBER_REGEX.test(code)) {
      setCodeErrorMessage(localizedInvalidCode);
      return;
    }

    gleanOtp.submit();
    try {
      const result = await authClient.passwordlessConfirmCode(email, code, {
        clientId: integration.getClientId(),
        service: integration.getService(),
        metricsContext: {
          ...queryParamsToMetricsContext(
            flowQueryParams as unknown as Record<string, string>
          ),
          clientId: integration.getClientId(),
        },
      });

      gleanOtp.submitSuccess();

      const isSessionVerified = result.verified && !result.verificationMethod;
      storeAccountData({
        sessionToken: result.sessionToken,
        email,
        uid: result.uid,
        // Update verification status of stored current account
        verified: isSessionVerified,
        sessionVerified: isSessionVerified,
      });

      // Sync flows need a password to derive encryption keys (unwrapBKey).
      // TOTP accounts must verify first since /password/create requires
      // a verifiedSessionToken.
      if (integration.isSync()) {
        const accountData = {
          uid: result.uid,
          sessionToken: result.sessionToken,
          email,
          verified: result.verified,
          lastLogin: Date.now(),
        };
        currentAccount(accountData);
        setCurrentAccount(result.uid);

        if (result.verificationMethod === 'totp-2fa') {
          navigateWithQuery('/signin_totp_code', {
            replace: true,
            state: {
              email,
              uid: result.uid,
              sessionToken: result.sessionToken,
              emailVerified: true,
              sessionVerified: false,
              verificationMethod: result.verificationMethod,
              verificationReason: result.verificationReason || 'login',
              isPasswordlessFlow: true,
            },
          });
        } else {
          navigateWithQuery('/post_verify/third_party_auth/set_password', {
            replace: true,
            state: {
              isPasswordlessFlow: true,
            },
          });
        }
        return;
      }

      if (isSignup) {
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
            const { redirect, code, state, error } =
              await finishOAuthFlowHandler(
                result.uid,
                result.sessionToken,
                undefined,
                undefined
              );
            if (error) {
              setLocalizedErrorBannerMessage(
                getLocalizedErrorMessage(ftlMsgResolver, error)
              );
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
              console.error(
                'webRedirectCheckError',
                webRedirectCheck.localizedInvalidRedirectError
              );
              setLocalizedErrorBannerMessage(
                webRedirectCheck.localizedInvalidRedirectError
              );
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
            emailVerified: true,
            sessionVerified: isSessionVerified,
            ...(result.verificationMethod && {
              verificationMethod:
                result.verificationMethod as VerificationMethods,
            }),
            ...(result.verificationReason && {
              verificationReason:
                result.verificationReason as VerificationReasons,
            }),
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
            integration.isFirefoxMobileClient() && isSessionVerified
          ),
        };
        const { error: navError } = await handleNavigation(navigationOptions);
        if (navError) {
          setLocalizedErrorBannerMessage(
            getLocalizedErrorMessage(ftlMsgResolver, navError)
          );
        }
      }
    } catch (error: any) {
      const localizedErrorMessage = getLocalizedErrorMessage(
        ftlMsgResolver,
        error
      );
      if (error.errno === AuthUiErrors.THROTTLED.errno) {
        gleanOtp.error({ event: { reason: 'too many times' } });
        setShowResendSuccessBanner(false);
        setLocalizedErrorBannerMessage(localizedErrorMessage);
      } else {
        // Note: The backend OTP manager doesn't distinguish expired vs invalid
        // codes — both return INVALID_VERIFICATION_CODE. An "expired" reason
        // would require backend changes to return a distinct errno.
        const reason =
          error.errno === AuthUiErrors.INVALID_VERIFICATION_CODE.errno
            ? 'invalid'
            : 'try again later';
        gleanOtp.error({ event: { reason } });
        setCodeErrorMessage(localizedErrorMessage);
      }
    }
  };

  const cmsInfo = integration?.getCmsInfo();
  //TODO: Signup/SigninPasswordlessCodePage to be added as part of FXA-13020
  const {
    pageTitle: title,
    splitLayout,
    headline: cmsHeadline,
    description: cmsDescription,
    primaryButtonText: cmsButtonText,
  } = (isSignup
    ? cmsInfo?.SignupPasswordlessCodePage
    : cmsInfo?.SigninPasswordlessCodePage) ?? {};

  // Heading and instruction text vary based on signup vs signin
  const subHeadingText = isSignup
    ? 'Sign-up only takes a single step when you use this code.'
    : 'Sign-in only takes a single step when you use this code.';
  const subHeadingFtlId = isSignup
    ? 'signup-passwordless-code-subheading'
    : 'signin-passwordless-code-subheading';

  const handleDifferentAccountClick = (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault();

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

      <EmailCodeImage
        illustrationsTheme={cmsInfo?.shared?.illustrationsTheme}
      />

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
            {expirationMinutes === 1
              ? '1 minute'
              : `${expirationMinutes} minutes`}
            .
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
            text: cmsButtonText,
          },
          onEngageCb: () => gleanOtp.engage(),
        }}
      />

      <div className="text-grey-500 text-sm inline-flex gap-1">
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
              Email new code in{' '}
              {resendCountdown === 1
                ? '1 second'
                : `${resendCountdown} seconds`}
              .
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
