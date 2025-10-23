/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';
import { FtlMsg, hardNavigate } from 'fxa-react/lib/utils';
import { ResendStatus } from 'fxa-settings/src/lib/types';
import { useEffect, useRef, useState } from 'react';
import AppLayout from '../../../components/AppLayout';
import Banner, { ResendCodeSuccessBanner } from '../../../components/Banner';
import CardHeader from '../../../components/CardHeader';
import FormVerifyCode, {
  FormAttributes,
} from '../../../components/FormVerifyCode';
import { EmailCodeImage } from '../../../components/images';
import { REACT_ENTRYPOINT } from '../../../constants';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import firefox from '../../../lib/channels/firefox';
import {
  getErrorFtlId,
  getLocalizedErrorMessage,
} from '../../../lib/error-utils';
import GleanMetrics from '../../../lib/glean';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { useWebRedirect } from '../../../lib/hooks/useWebRedirect';
import { logViewEvent, usePageViewEvent } from '../../../lib/metrics';
import { storeAccountData } from '../../../lib/storage-utils';
import {
  isOAuthIntegration,
  isSyncDesktopV3Integration,
  isWebIntegration,
} from '../../../models';
import {
  useAlertBar,
  useFtlMsgResolver,
  useSession,
} from '../../../models/hooks';
import { isFirefoxService } from '../../../models/integrations/utils';
import { getSyncNavigate } from '../../Signin/utils';
import { ConfirmSignupCodeProps } from './interfaces';

export const viewName = 'confirm-signup-code';

const ConfirmSignupCode = ({
  email,
  sessionToken,
  uid,
  integration,
  finishOAuthFlowHandler,
  newsletterSlugs: newsletters,
  offeredSyncEngines,
  declinedSyncEngines,
  keyFetchToken,
  unwrapBKey,
  flowQueryParams,
  origin,
}: ConfirmSignupCodeProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const ftlMsgResolver = useFtlMsgResolver();
  const location = useLocation();
  const navigate = useNavigate();
  const alertBar = useAlertBar();
  const session = useSession();
  const [codeErrorMessage, setCodeErrorMessage] = useState<string>('');
  const [resendStatus, setResendStatus] = useState<ResendStatus>(
    ResendStatus.none
  );

  const navigateWithQuery = useNavigateWithQuery();
  const webRedirectCheck = useWebRedirect(integration.data.redirectTo);
  const isFirefoxClientServiceRelay = integration.isFirefoxClientServiceRelay();
  const isFirefoxClientServiceAimode =
    integration.isFirefoxClientServiceAiMode();
  const isSync = integration.isSync();
  const submitFormOnPaste = !isSync;

  // Make sure data is valid. If it isn't fail fast.
  integration.data.validate();

  const reason = origin === 'signup' ? 'signup' : 'signin';
  const hasEmittedView = useRef(false);

  useEffect(() => {
    if (!hasEmittedView.current) {
      GleanMetrics.signupConfirmation.view({ event: { reason } });
      hasEmittedView.current = true;
    }
  }, [reason]);

  const [localizedErrorBannerHeading, setLocalizedErrorBannerHeading] =
    useState('');

  const formAttributes: FormAttributes = {
    inputFtlId: 'confirm-signup-code-input-label',
    inputLabelText: 'Enter 6-digit code',
    pattern: '[0-9]{6}',
    maxLength: 6,
    submitButtonFtlId: isSync
      ? 'confirm-signup-code-sync-button'
      : 'confirm-signup-code-confirm-button',
    submitButtonText: isSync ? 'Start syncing' : 'Confirm',
  };

  const localizedCustomCodeRequiredMessage = ftlMsgResolver.getMsg(
    'confirm-signup-code-is-required-error',
    'Confirmation code is required'
  );

  function goToSettingsWithAlertSuccess() {
    alertBar.success(
      ftlMsgResolver.getMsg(
        'confirm-signup-code-success-alert',
        'Account confirmed successfully'
      )
    );
    navigateWithQuery('/settings', { replace: true });
  }

  async function handleResendCode() {
    try {
      await session.sendVerificationCode();
      // if resending a code is successful, clear any banner already present on screen
      setLocalizedErrorBannerHeading('');
      setResendStatus(ResendStatus.sent);
    } catch (error) {
      setResendStatus(ResendStatus.error);
      setLocalizedErrorBannerHeading(
        getLocalizedErrorMessage(ftlMsgResolver, error)
      );
    }
  }

  function clearErrorMessages() {
    setLocalizedErrorBannerHeading('');
    setCodeErrorMessage('');
  }

  async function verifySession(code: string) {
    clearErrorMessages();
    logViewEvent(`flow.${viewName}`, 'submit', REACT_ENTRYPOINT);
    GleanMetrics.signupConfirmation.submit({ event: { reason } });
    try {
      const hasSelectedNewsletters = newsletters && newsletters.length > 0;
      const service = integration.getService();
      const clientId = integration.getClientId();

      const options = {
        ...(hasSelectedNewsletters && { ...{ newsletters } }),
        ...(isOAuthIntegration(integration) && {
          scopes: integration.getPermissions(),
        }),
        // See oauth_client_info in the auth-server for details on service/clientId
        // Sending up the clientId when the user is not signing in to the browser
        // is used to show the correct service name in emails
        ...(isFirefoxService(service) ? { service } : { service: clientId }),
      };

      await session.verifySession(code, options);

      logViewEvent(
        `flow.${viewName}`,
        'verification.success',
        REACT_ENTRYPOINT
      );

      GleanMetrics.registration.successView({ event: { reason } });
      // since many of the branches below lead to a redirect, we'll wait for
      // the Glean requests
      await GleanMetrics.isDone();

      storeAccountData({
        sessionToken,
        email,
        uid,
        // Update verification status of stored current account
        verified: true,
      });

      if (hasSelectedNewsletters) {
        logViewEvent(`flow`, 'newsletter.subscribed', REACT_ENTRYPOINT);
      }

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
              uid,
              sessionToken,
              keyFetchToken,
              unwrapBKey,
              verificationReason: 'signup',
              verified: true,
            },
          });
          return;
        } else {
          const { redirect, code, state, error } = await finishOAuthFlowHandler(
            uid,
            sessionToken,
            keyFetchToken,
            unwrapBKey
          );
          if (error) {
            setLocalizedErrorBannerHeading(
              getLocalizedErrorMessage(ftlMsgResolver, error)
            );
            return;
          }

          if (integration.isSync()) {
            firefox.fxaOAuthLogin({
              // OAuth desktop looks at the sync engine list in fxaLogin. Oauth
              // mobile currently looks at the engines provided here, but should
              // eventually move to look at fxaLogin as well to prevent FXA-10596.
              declinedSyncEngines,
              offeredSyncEngines,
              action: 'signup',
              code,
              redirect,
              state,
            });
            // Mobile sync will close the web view, OAuth Desktop mimics DesktopV3 behavior
            if (!integration.isFirefoxMobileClient()) {
              const { to } = getSyncNavigate(location.search, {
                showSignupConfirmedSync: true,
              });
              navigate(to);
            }
            return;
          } else if (
            isFirefoxClientServiceRelay ||
            isFirefoxClientServiceAimode
          ) {
            firefox.fxaOAuthLogin({
              action: 'signup',
              code,
              redirect,
              state,
            });
            goToSettingsWithAlertSuccess();
          } else {
            // Navigate to relying party
            if (origin === 'signup') {
              hardNavigate(redirect, { newAccount: 'true' });
            } else {
              hardNavigate(redirect, {
                newAccountVerification: 'true',
              });
            }
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
            setLocalizedErrorBannerHeading(
              webRedirectCheck.localizedInvalidRedirectError
            );
          }
        } else {
          goToSettingsWithAlertSuccess();
        }
      }
    } catch (error) {
      GleanMetrics.signupConfirmation.error({
        event: { reason: error.errno?.toString() },
      });
      let localizedErrorMessage: string;
      // Intercept invalid parameter error and set the error message to INVALID_EXPIRED_OTP_CODE
      // This error occurs when the submitted code does not pass validation for the code param
      // e.g., if the submitted code contains spaces or characters other than numbers
      if (error.errno === 107) {
        localizedErrorMessage = ftlMsgResolver.getMsg(
          getErrorFtlId(AuthUiErrors.INVALID_EXPIRED_OTP_CODE),
          AuthUiErrors.INVALID_EXPIRED_OTP_CODE.message
        );
      } else {
        localizedErrorMessage = getLocalizedErrorMessage(ftlMsgResolver, error);
      }

      // In any case where the submitted code is invalid/expired, show the error message in a tooltip
      if (
        error.errno === AuthUiErrors.INVALID_EXPIRED_OTP_CODE.errno ||
        error.errno === AuthUiErrors.OTP_CODE_REQUIRED.errno ||
        error.errno === AuthUiErrors.INVALID_OTP_CODE.errno ||
        error.errno === 107
      ) {
        setCodeErrorMessage(localizedErrorMessage);
      } else {
        // Clear resend link success banner (if displayed) before rendering an error banner
        setResendStatus(ResendStatus.none);
        // Any other error messages should be displayed in an error banner
        setLocalizedErrorBannerHeading(localizedErrorMessage);
      }
    }
  }

  const cmsInfo = integration.getCmsInfo();

  const title = cmsInfo?.SignupConfirmCodePage?.pageTitle
    ? cmsInfo?.SignupConfirmCodePage?.pageTitle
    : ftlMsgResolver.getMsg(
        'confirm-signup-code-page-title',
        'Enter confirmation code'
      );

  return (
    <AppLayout {...{ cmsInfo, title }}>
      {cmsInfo ? (
        <>
          {cmsInfo.shared.logoUrl && cmsInfo.shared.logoAltText && (
            <img
              data-testid="cms-logo"
              src={cmsInfo.shared.logoUrl}
              alt={cmsInfo.shared.logoAltText}
              className="justify-start mb-4 max-h-[40px]"
            />
          )}
          <h1 className="card-header">
            {cmsInfo.SignupConfirmCodePage.headline}
          </h1>
          <p className="mt-1 text-sm">
            {cmsInfo.SignupConfirmCodePage.description}
          </p>
        </>
      ) : (
        <CardHeader
          headingText="Enter confirmation code"
          headingAndSubheadingFtlId="confirm-signup-code-heading-2"
        />
      )}

      {localizedErrorBannerHeading && (
        <Banner
          type="error"
          content={{ localizedHeading: localizedErrorBannerHeading }}
        />
      )}

      {resendStatus === ResendStatus.sent && <ResendCodeSuccessBanner />}

      <EmailCodeImage />

      <FtlMsg
        id="confirm-signup-code-instruction-v2"
        vars={{ email: email! }}
        elems={{ email: <span className="break-all" /> }}
      >
        <p className="mt-2 text-sm">
          Enter the code that was sent to{' '}
          <span className="break-all">{email}</span> within 5 minutes.
        </p>
      </FtlMsg>

      {isFirefoxClientServiceRelay && (
        <FtlMsg id="confirm-signup-code-desktop-relay">
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
          verifyCode: verifySession,
          localizedCustomCodeRequiredMessage,
          codeErrorMessage,
          setCodeErrorMessage,
          submitFormOnPaste,
          cmsButton: {
            text: cmsInfo?.SignupConfirmCodePage.primaryButtonText,
            color: cmsInfo?.shared.buttonColor,
          },
        }}
      />

      <div className="animate-delayed-fade-in opacity-0 text-grey-500 text-sm inline-flex gap-1">
        <>
          <FtlMsg id="confirm-signup-code-code-expired">
            <p>Code expired?</p>
          </FtlMsg>
          <FtlMsg id="confirm-signup-code-resend-code-link">
            <button
              id="resend"
              className="link-blue"
              onClick={handleResendCode}
            >
              Email new code.
            </button>
          </FtlMsg>
        </>
      </div>
    </AppLayout>
  );
};

export default ConfirmSignupCode;
