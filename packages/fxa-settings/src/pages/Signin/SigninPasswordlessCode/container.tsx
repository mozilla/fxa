/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import SigninPasswordlessCode from '.';
import AppLayout from '../../../components/AppLayout';
import { useAuthClient } from '../../../models';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import {
  PasswordlessLocationState,
  SigninPasswordlessCodeContainerProps,
} from './interfaces';
import OAuthDataError from '../../../components/OAuthDataError';
import { useEffect, useState } from 'react';

const SigninPasswordlessCodeContainer = ({
  integration,
  setCurrentSplitLayout,
}: SigninPasswordlessCodeContainerProps & RouteComponentProps) => {
  const navigateWithQuery = useNavigateWithQuery();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state?: PasswordlessLocationState;
  };

  const authClient = useAuthClient();
  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );

  const email = location.state?.email;
  const service = location.state?.service;
  const isSignup = location.state?.isSignup;

  const [codeSent, setCodeSent] = useState(
    // If location state already has codeSent (persisted across page refresh
    // via the History API), skip sending again.
    () => location.state?.codeSent === true
  );
  const [sendError, setSendError] = useState<string | null>(null);

  const cmsInfo = integration.getCmsInfo();
  // Use SigninTokenCodePage layout as fallback since SigninPasswordlessCodePage doesn't exist yet
  const splitLayout = (cmsInfo as any)?.SigninPasswordlessCodePage?.splitLayout ||
    cmsInfo?.SigninTokenCodePage?.splitLayout;

  // If no email in state, redirect to signin
  useEffect(() => {
    if (!email) {
      navigateWithQuery('/');
    }
  }, [email, navigateWithQuery]);

  // Send the initial code when component mounts, but skip if already sent
  // (e.g. after a page refresh). On success, replace the current history
  // entry with codeSent: true so the browser-persisted location state
  // prevents re-sending on refresh.
  useEffect(() => {
    if (email && !codeSent) {
      const sendCode = async () => {
        try {
          await authClient.passwordlessSendCode(email, { clientId: integration.getClientId() });
          setCodeSent(true);
          // Persist codeSent in location state so it survives page refresh
          navigateWithQuery(location.pathname + location.search, {
            replace: true,
            state: { ...location.state, codeSent: true },
          });
        } catch (error: any) {
          setSendError(error.message || 'Failed to send code');
        }
      };
      sendCode();
    }
  }, [email, service, codeSent, authClient, integration]);

  if (!email) {
    return (
      <AppLayout
        {...{ cmsInfo, loading: true, splitLayout, setCurrentSplitLayout }}
      />
    );
  }

  if (oAuthDataError) {
    return <OAuthDataError error={oAuthDataError} />;
  }

  if (sendError) {
    // TODO: Better error handling - for now show in AppLayout
    return (
      <AppLayout
        {...{ cmsInfo, splitLayout, setCurrentSplitLayout }}
      >
        <div className="text-red-600">Error: {sendError}</div>
      </AppLayout>
    );
  }

  if (!codeSent) {
    return (
      <AppLayout
        {...{ cmsInfo, loading: true, splitLayout, setCurrentSplitLayout }}
      />
    );
  }

  return (
    <SigninPasswordlessCode
      {...{
        email,
        expirationMinutes: 10,
        integration,
        finishOAuthFlowHandler,
        setCurrentSplitLayout,
        isSignup,
        resendCountdownSeconds: 5,
      }}
    />
  );
};

export default SigninPasswordlessCodeContainer;
