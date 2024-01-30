/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useState } from 'react';
import {
  logErrorEvent,
  logViewEvent,
  usePageViewEvent,
} from '../../../lib/metrics';
import { RouteComponentProps, useNavigate } from '@reach/router';
import ConfirmWithLink, {
  ConfirmWithLinkPageStrings,
} from '../../../components/ConfirmWithLink';
import {
  NAVIGATION_TIMEOUT_MS,
  POLLING_INTERVAL_MS,
  REACT_ENTRYPOINT,
} from '../../../constants';
import { ResendStatus } from '../../../lib/types';
import AppLayout from 'fxa-settings/src/components/AppLayout';
import {
  useAccount,
  useFtlMsgResolver,
  useInterval,
  useSession,
} from 'fxa-settings/src/models';
import {
  AuthUiErrors,
  getLocalizedErrorMessage,
} from 'fxa-settings/src/lib/auth-errors/auth-errors';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { hardNavigateToContentServer } from 'fxa-react/lib/utils';

// This page is no longer part of the typical/expected signup flow, but has been preserverd during
// the conversion from backbone to react as we were still seeing some traffic to this route.
// TODO in FXA-7185: Check metrics once this React page is rolled out to determine if this page can be entirely replaced by ConfirmSignupCode.

export const viewName = 'confirm';

export type ConfirmProps = {
  sessionTokenId: string | null;
};

export const Confirm = ({
  sessionTokenId,
}: ConfirmProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const ftlMsgResolver = useFtlMsgResolver();

  // Show a loading spinner until all checks complete. Without this,
  // users without a session will experience some jank due to an
  // immediate redirect or rerender of this page.
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(true);
  const [resendStatus, setResendStatus] = useState<ResendStatus>(
    ResendStatus['not sent']
  );
  const [errorMessage, setErrorMessage] = useState<string>();
  const [email, setEmail] = useState('');

  const account = useAccount();
  const session = useSession();
  const navigate = useNavigate();
  const [isPolling, setIsPolling] = useState<number | null>(
    POLLING_INTERVAL_MS
  );

  const getEmail = useCallback(async () => {
    const response = await account.getProfileInfo();
    setEmail(response.primaryEmail.email);
  }, [account]);

  const redirectToSignup = useCallback(() => {
    hardNavigateToContentServer('/signup');
  }, []);

  const confirmSignupPageText: ConfirmWithLinkPageStrings = {
    headingFtlId: 'confirm-signup-heading',
    headingText: 'Confirm your account',
    instructionFtlId: 'confirm-signup-instruction',
    instructionText: `Check your email for the confirmation link sent to ${email}`,
  };

  // Verifies if we have access to profile info and session token.
  // If we do, set the email and render the page. If not, we don't know
  // who the user is and can't confirm if we've sent a confirmation
  // link, and we can't send a new one without an email address => redirect
  // the user to retry signup.
  useEffect(() => {
    try {
      if (sessionTokenId) {
        getEmail();
      } else {
        redirectToSignup();
      }
    } catch (e) {
      redirectToSignup();
    }
  }, [getEmail, redirectToSignup, sessionTokenId]);

  useEffect(() => {
    if (email) {
      setShowLoadingSpinner(false);
    }
  }, [email, setShowLoadingSpinner]);

  const navigateToConfirmCode = useCallback(
    () =>
      navigate('/confirm_signup_code?showReactApp=true', {
        state: { email },
        replace: true,
      }),
    [email, navigate]
  );

  // TODO implement broker to determine the the next screen
  const navigateToNextScreen = () => {
    logViewEvent(viewName, 'verification.success');
    // TODO check if isForcePasswordChange
    // navigate('/post_verify/password/force_password_change', {account})

    // default behaviour: '/signup_confirmed'
    // if Sync: '/connect_another_device'
    // if Web: '/settings'
    navigate('/settings', { replace: true });
  };

  // Adds a timeout before navigating to the /confirm_signup_code page
  // when the user clicks on the resend email link.
  useEffect(() => {
    function onTimeout() {
      navigateToConfirmCode();
    }
    let navigateTimeoutId: NodeJS.Timeout;
    if (resendStatus === ResendStatus.sent) {
      navigateTimeoutId = setTimeout(onTimeout, NAVIGATION_TIMEOUT_MS);
    }

    return () => {
      clearTimeout(navigateTimeoutId);
    };
  }, [navigateToConfirmCode, resendStatus]);

  // Subscribe to account updates to find out if the session becomes verified.
  // Stay on this page until the session is verified, then automatically
  // navigate to the next screen.
  useInterval(async () => {
    try {
      const sessionVerified = await session.isSessionVerified();
      if (sessionVerified) {
        navigateToNextScreen();
        setIsPolling(null);
      }
    } catch (e) {
      setIsPolling(null);
    }
  }, isPolling);

  const resendEmailHandler = async () => {
    try {
      // The logic here differs from content-server. Since we are moving away
      // from confirmation link, this resend function sends a verification code
      // instead of a verification link and navigates to /signup_confirm_code.
      // This avoids adding a (to be discontinued) method to the React Account model.
      await session.sendVerificationCode();
      setResendStatus(ResendStatus.sent);
    } catch (err) {
      const localizedErrorMessage = getLocalizedErrorMessage(
        ftlMsgResolver,
        err
      );
      setResendStatus(ResendStatus['error']);
      setErrorMessage(localizedErrorMessage);
      if (AuthUiErrors['INVALID_TOKEN'].errno === err.errno) {
        logErrorEvent({ viewName, ...err });
        // TODO: When redirectToSignup is changed to use navigate,
        // pass in the error so it can be displayed in an banner
        // on the /signup page
        redirectToSignup();
      }
      return;
    }
    setResendStatus(ResendStatus['sent']);
  };

  if (showLoadingSpinner) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <AppLayout>
      <ConfirmWithLink
        confirmWithLinkPageStrings={confirmSignupPageText}
        {...{
          email,
          resendEmailHandler,
          resendStatus,
          errorMessage,
        }}
      />
    </AppLayout>
  );
};

export default Confirm;
