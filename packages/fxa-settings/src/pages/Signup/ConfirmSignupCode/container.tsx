/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect } from 'react';
import { RouteComponentProps, useLocation } from '@reach/router';
import { useNavigateWithQuery as useNavigate } from '../../../lib/hooks/useNavigateWithQuery';
import { currentAccount } from '../../../lib/cache';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { Integration, useAuthClient } from '../../../models';
import ConfirmSignupCode from '.';
import { hardNavigate } from 'fxa-react/lib/utils';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { GetEmailBounceStatusResponse, LocationState } from './interfaces';
import { useQuery } from '@apollo/client';
import { EMAIL_BOUNCE_STATUS_QUERY } from './gql';
import OAuthDataError from '../../../components/OAuthDataError';

export const POLL_INTERVAL = 5000;

function getAccountInfo(
  emailFromLocationState?: string,
  sessionTokenFromLocationState?: string,
  uidFromLocationState?: string
) {
  let email = emailFromLocationState;
  let sessionToken = sessionTokenFromLocationState;
  let uid = uidFromLocationState;
  // only read from local storage if email isn't provided via router state
  if (!email || !sessionToken || !uid) {
    const storedLocalAccount = currentAccount();
    email = storedLocalAccount?.email;
    sessionToken = storedLocalAccount?.sessionToken;
    uid = storedLocalAccount?.uid;
  }
  return { email, sessionToken, uid };
}

const SignupConfirmCodeContainer = ({
  integration,
}: {
  integration: Integration;
} & RouteComponentProps) => {
  const authClient = useAuthClient();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: LocationState;
  };
  const {
    origin,
    selectedNewsletterSlugs: newsletterSlugs,
    offeredSyncEngines,
    declinedSyncEngines,
    keyFetchToken,
    unwrapBKey,
    sessionToken: sessionTokenFromLocationState,
    email: emailFromLocationState,
    uid: uidFromLocationState,
  } = location.state || {};
  const navigate = useNavigate();

  // If a user tries to signin and they haven't verified their account yet, we pass
  // this state through router state and redirect here. Otherwise, we read from localStorage.
  const { email, sessionToken, uid } = getAccountInfo(
    emailFromLocationState,
    sessionTokenFromLocationState,
    uidFromLocationState
  );

  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );

  const navigateToContentServer = useCallback(
    (path: string, hasBounced?: boolean) => {
      const params = new URLSearchParams(location.search);

      // If the user reached this page from React signup,
      // 'email' and 'emailStatusChecked' will be set as params
      // when the user was navigated from Backbone to React.
      // This is temporary until index is converted to React.
      // Passing back the 'email' param causes various behaviors in
      // content-server since it marks the email as "coming from a RP".
      params.delete('emailStatusChecked');
      params.delete('email');
      // passing the 'bouncedEmail' param will display an error tooltip
      // on the email-first signin/signup page and allow to check
      // if the entered email matches the bounced email
      hasBounced && email && params.set('bouncedEmail', email);
      if (Array.from(params).length > 0) {
        path += `?${params.toString()}`;
      }
      hardNavigate(path);
    },
    [email, location.search]
  );

  // Poll for hard bounces registered in database for the entered email.
  // Previously, we checked if the account was deleted, and assumed
  // that implied the email bounced/was invalid.
  const { data } = useQuery<GetEmailBounceStatusResponse>(
    EMAIL_BOUNCE_STATUS_QUERY,
    {
      variables: { input: email },
      pollInterval: POLL_INTERVAL,
    }
  );

  // Handle email bounces
  useEffect(() => {
    if (data?.emailBounceStatus.hasHardBounce) {
      const hasBounced = true;
      // if arriving from signup, return to '/' and allow user to signup with another email
      if (origin === 'signup') {
        navigateToContentServer('/', hasBounced);
      } else {
        // if not arriving from signup, redirect to signin_bounced for support info
        navigateToContentServer('/signin_bounced', hasBounced);
      }
    }
  }, [data, origin, navigate, navigateToContentServer]);

  // TODO: This check and related test can be moved up the tree to the App component,
  // where a missing integration should be caught and handled.
  if (!integration) {
    return <LoadingSpinner fullScreen />;
  }

  if (!uid || !sessionToken || !email) {
    navigateToContentServer('/');
    return <LoadingSpinner fullScreen />;
  }

  if (oAuthDataError) {
    return <OAuthDataError error={oAuthDataError} />;
  }

  return (
    <ConfirmSignupCode
      {...{
        uid,
        email,
        sessionToken,
        integration,
        finishOAuthFlowHandler,
        newsletterSlugs,
        offeredSyncEngines,
        declinedSyncEngines,
        keyFetchToken,
        unwrapBKey,
      }}
    />
  );
};
export default SignupConfirmCodeContainer;
