/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';
import { REACT_ENTRYPOINT } from '../../../constants';
import {
  AuthUiErrors,
  getErrorFtlId,
  getLocalizedErrorMessage,
} from '../../../lib/auth-errors/auth-errors';
import { logViewEvent, usePageViewEvent } from '../../../lib/metrics';
import {
  FtlMsg,
  hardNavigate,
  hardNavigateToContentServer,
} from 'fxa-react/lib/utils';
import {
  useAlertBar,
  useFtlMsgResolver,
  useSession,
} from '../../../models/hooks';
import AppLayout from '../../../components/AppLayout';
import Banner, {
  BannerProps,
  BannerType,
  ResendEmailSuccessBanner,
} from '../../../components/Banner';
import CardHeader from '../../../components/CardHeader';
import FormVerifyCode, {
  FormAttributes,
} from '../../../components/FormVerifyCode';
import { MailImage } from '../../../components/images';
import { ResendStatus } from 'fxa-settings/src/lib/types';
import {
  isOAuthIntegration,
  isSyncDesktopV3Integration,
  isWebIntegration,
} from '../../../models';
import { ConfirmSignupCodeProps } from './interfaces';
import firefox from '../../../lib/channels/firefox';
import GleanMetrics from '../../../lib/glean';
import { useWebRedirect } from '../../../lib/hooks/useWebRedirect';
import { storeAccountData } from '../../../lib/storage-utils';
import { getSyncNavigate } from '../../Signin/utils';

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
}: ConfirmSignupCodeProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const ftlMsgResolver = useFtlMsgResolver();
  const location = useLocation();
  const alertBar = useAlertBar();
  const session = useSession();
  const [codeErrorMessage, setCodeErrorMessage] = useState<string>('');
  const [resendStatus, setResendStatus] = useState<ResendStatus>(
    ResendStatus['not sent']
  );

  const navigate = useNavigate();
  const webRedirectCheck = useWebRedirect(integration.data.redirectTo);

  useEffect(() => {
    GleanMetrics.signupConfirmation.view();
  }, []);

  const [banner, setBanner] = useState<Partial<BannerProps>>({
    type: undefined,
    children: undefined,
  });

  const formAttributes: FormAttributes = {
    inputFtlId: 'confirm-signup-code-input-label',
    inputLabelText: 'Enter 6-digit code',
    pattern: '[0-9]{6}',
    maxLength: 6,
    submitButtonFtlId: 'confirm-signup-code-confirm-button',
    submitButtonText: 'Confirm',
  };

  const localizedCustomCodeRequiredMessage = ftlMsgResolver.getMsg(
    'confirm-signup-code-is-required-error',
    'Confirmation code is required'
  );

  async function handleResendCode() {
    try {
      await session.sendVerificationCode();
      // if resending a code is successful, clear any banner already present on screen
      if (resendStatus !== ResendStatus['sent']) {
        setBanner({
          type: undefined,
          children: undefined,
        });
        setResendStatus(ResendStatus['sent']);
      }
    } catch (error) {
      setResendStatus(ResendStatus['not sent']);
      const localizedErrorMessage = getLocalizedErrorMessage(
        ftlMsgResolver,
        error
      );
      setBanner({
        type: BannerType.error,
        children: <p>{localizedErrorMessage}</p>,
      });
    }
  }

  async function verifySession(code: string) {
    logViewEvent(`flow.${viewName}`, 'submit', REACT_ENTRYPOINT);
    GleanMetrics.signupConfirmation.submit();
    try {
      const hasSelectedNewsletters = newsletters && newsletters.length > 0;

      const options = {
        ...(hasSelectedNewsletters && { ...{ newsletters } }),
        ...(isOAuthIntegration(integration) && {
          scopes: integration.getPermissions(),
          service: integration.getService(),
        }),
      };

      await session.verifySession(code, options);

      logViewEvent(
        `flow.${viewName}`,
        'verification.success',
        REACT_ENTRYPOINT
      );

      GleanMetrics.registration.complete();
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
        const { to } = getSyncNavigate(location.search);
        hardNavigateToContentServer(to);
      } else if (isOAuthIntegration(integration)) {
        // Check to see if the relier wants TOTP.
        // Newly created accounts wouldn't have this so lets redirect them to signin.
        // Certain reliers may require users to set up 2FA / TOTP
        // before they can be redirected back to the RP.
        // Notes in content-server indicate that a message should be displayed on the signin page
        // to explain why totp setup is required, but this does not currently
        // appear to be implemented.

        // Params are included to eventually allow for redirect to RP after 2FA setup
        if (integration.wantsTwoStepAuthentication()) {
          hardNavigateToContentServer(`oauth/signin${location.search}`);
          return;
        } else {
          const { redirect, code, state, error } = await finishOAuthFlowHandler(
            uid,
            sessionToken,
            // yes, non-null operator is gross, but it's temporary.
            // see note in container component / router.js for this page, once
            // we've converted the index page we can remove
            keyFetchToken!,
            unwrapBKey!
          );
          if (error) {
            setBanner({
              type: BannerType.error,
              children: (
                <p>{getLocalizedErrorMessage(ftlMsgResolver, error)}</p>
              ),
            });
            return;
          }

          if (integration.isSync()) {
            firefox.fxaOAuthLogin({
              declinedSyncEngines,
              offeredSyncEngines,
              action: 'signup',
              code,
              redirect,
              state,
            });
            // Mobile sync will close the web view, OAuth Desktop mimics DesktopV3 behavior
            const { to } = getSyncNavigate(location.search);
            hardNavigateToContentServer(to);
            return;
          } else {
            // Navigate to relying party
            hardNavigate(redirect);
            return;
          }
        }
      } else if (isWebIntegration(integration)) {
        // SubPlat redirect
        if (integration.data.redirectTo) {
          if (webRedirectCheck.isValid()) {
            hardNavigate(integration.data.redirectTo);
          } else {
            // Even if the code submission is successful, show the user this error
            // message if the redirect is invalid to match parity with content-server.
            // This may but may be revisited when we look at our signup flows as a whole.
            setBanner({
              type: BannerType.error,
              children: <p>{webRedirectCheck.getLocalizedErrorMessage()}</p>,
            });
          }
        } else {
          alertBar.success(
            ftlMsgResolver.getMsg(
              'confirm-signup-code-success-alert',
              'Account confirmed successfully'
            )
          );
          navigate(`/settings${location.search}`, { replace: true });
        }
      }
    } catch (error) {
      let localizedErrorMessage: string;
      // Intercept invalid parameter error and set the error message to INVALID_EXPIRED_SIGNUP_CODE
      // This error occurs when the submitted code does not pass validation for the code param
      // e.g., if the submitted code contains spaces or characters other than numbers
      if (error.errno === 107) {
        localizedErrorMessage = ftlMsgResolver.getMsg(
          getErrorFtlId(AuthUiErrors.INVALID_EXPIRED_SIGNUP_CODE),
          AuthUiErrors.INVALID_EXPIRED_SIGNUP_CODE.message
        );
      } else {
        localizedErrorMessage = getLocalizedErrorMessage(ftlMsgResolver, error);
      }

      // In any case where the submitted code is invalid/expired, show the error message in a tooltip
      if (
        error.errno === AuthUiErrors.INVALID_EXPIRED_SIGNUP_CODE.errno ||
        error.errno === AuthUiErrors.OTP_CODE_REQUIRED.errno ||
        error.errno === AuthUiErrors.INVALID_OTP_CODE.errno ||
        error.errno === 107
      ) {
        setCodeErrorMessage(localizedErrorMessage);
      } else {
        // Clear resend link success banner (if displayed) before rendering an error banner
        setResendStatus(ResendStatus['not sent']);
        // Any other error messages should be displayed in an error banner
        setBanner({
          type: BannerType.error,
          children: <p>{localizedErrorMessage}</p>,
        });
      }
    }
  }

  const localizedPageTitle = ftlMsgResolver.getMsg(
    'confirm-signup-code-page-title',
    'Enter confirmation code'
  );

  return (
    <AppLayout title={localizedPageTitle}>
      <CardHeader
        headingText="Enter confirmation code"
        headingAndSubheadingFtlId="confirm-signup-code-heading-2"
      />

      {banner.type && banner.children && (
        <Banner type={banner.type}>{banner.children}</Banner>
      )}

      {resendStatus === ResendStatus['sent'] && <ResendEmailSuccessBanner />}

      <div className="flex justify-center mx-auto">
        <MailImage className="w-3/5" />
      </div>

      <FtlMsg id="confirm-signup-code-instruction" vars={{ email: email! }}>
        <p className="m-5 text-sm">
          Enter the code that was sent to {email} within 5 minutes.
        </p>
      </FtlMsg>

      <FormVerifyCode
        {...{
          formAttributes,
          viewName,
          verifyCode: verifySession,
          localizedCustomCodeRequiredMessage,
          codeErrorMessage,
          setCodeErrorMessage,
        }}
      />

      <div className="animate-delayed-fade-in opacity-0 text-grey-500 text-xs inline-flex gap-1">
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
