/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { RouteComponentProps, useLocation } from '@reach/router';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { currentAccount } from '../../../lib/cache';
import {
  useFinishOAuthFlowHandler,
  useOAuthKeysCheck,
} from '../../../lib/oauth/hooks';
import {
  Integration,
  useAuthClient,
  useSensitiveDataClient,
} from '../../../models';
import ConfirmSignupCode from '.';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { GetEmailBounceStatusResponse, LocationState } from './interfaces';
import { useQuery } from '@apollo/client';
import { EMAIL_BOUNCE_STATUS_QUERY } from './gql';
import OAuthDataError from '../../../components/OAuthDataError';
import { QueryParams } from '../../..';
import { SensitiveData } from '../../../lib/sensitive-data-client';
import GleanMetrics from '../../../lib/glean';

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
  flowQueryParams,
}: {
  integration: Integration;
  flowQueryParams: QueryParams;
} & RouteComponentProps) => {
  const authClient = useAuthClient();
  const sensitiveDataClient = useSensitiveDataClient();
  const { keyFetchToken, unwrapBKey } =
    sensitiveDataClient.getDataType(SensitiveData.Key.Auth) || {};

  const { oAuthKeysCheckError } = useOAuthKeysCheck(
    integration,
    keyFetchToken,
    unwrapBKey
  );

  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: LocationState;
  };
  const {
    origin,
    selectedNewsletterSlugs: newsletterSlugs,
    offeredSyncEngines,
    declinedSyncEngines,
    sessionToken: sessionTokenFromLocationState,
    email: emailFromLocationState,
    uid: uidFromLocationState,
  } = location.state || {};
  const navigateWithQuery = useNavigateWithQuery();

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

  // Poll for hard bounces registered in database for the entered email.
  // Previously, we checked if the account was deleted, and assumed
  // that implied the email bounced/was invalid.
  const { data } = useQuery<GetEmailBounceStatusResponse>(
    EMAIL_BOUNCE_STATUS_QUERY,
    {
      variables: { input: email || '' },
      pollInterval: POLL_INTERVAL,
    }
  );

  // Handle email bounces
  useEffect(() => {
    if (data?.emailBounceStatus.hasHardBounce) {
      const hasBounced = true;
      // if arriving from signup, return to '/' and allow user to signup with another email
      if (origin === 'signup') {
        navigateWithQuery('/', {
          state: {
            hasBounced,
            prefillEmail: email,
          },
        });
      } else {
        // if not arriving from signup, redirect to signin_bounced for support info
        navigateWithQuery('/signin_bounced');
      }
    }
  }, [data, origin, navigateWithQuery, email]);

  // TODO: This check and related test can be moved up the tree to the App component,
  // where a missing integration should be caught and handled.
  if (!integration) {
    return <LoadingSpinner fullScreen />;
  }

  if (!uid || !sessionToken || !email) {
    navigateWithQuery('/');
    return <LoadingSpinner fullScreen />;
  }

  if (oAuthDataError) {
    return <OAuthDataError error={oAuthDataError} gleanMetric={GleanMetrics.signupConfirmation.error} />;
  }
  if (oAuthKeysCheckError) {
    return <OAuthDataError error={oAuthKeysCheckError} gleanMetric={GleanMetrics.signupConfirmation.error}/>;
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
        flowQueryParams,
      }}
    />
  );
};
export default SignupConfirmCodeContainer;
