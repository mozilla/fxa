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
  serviceName,
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

  const [codeSent, setCodeSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const email = location.state?.email;
  const service = location.state?.service;
  const isSignup = location.state?.isSignup;

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

  // Send the initial code when component mounts
  useEffect(() => {
    if (email && !codeSent) {
      const sendCode = async () => {
        try {
          await authClient.passwordlessSendCode(email, { service });
          setCodeSent(true);
        } catch (error: any) {
          setSendError(error.message || 'Failed to send code');
        }
      };
      sendCode();
    }
  }, [email, service, codeSent, authClient]);

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
        integration,
        finishOAuthFlowHandler,
        setCurrentSplitLayout,
        isSignup,
      }}
    />
  );
};

export default SigninPasswordlessCodeContainer;
