/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps, useLocation } from '@reach/router';
import { currentAccount } from '../../../lib/cache';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import {
  Integration,
  isOAuthIntegration,
  useAuthClient,
} from '../../../models';
import AppLayout from '../../../components/AppLayout';
import CardHeader from '../../../components/CardHeader';
import ConfirmSignupCode from '.';
import { hardNavigateToContentServer } from 'fxa-react/lib/utils';
import { LoadingSpinner } from 'fxa-react/components/LoadingSpinner';
import { LocationState } from './interfaces';
import sentryMetrics from 'fxa-shared/lib/sentry';

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
    selectedNewsletterSlugs: newsletterSlugs,
    keyFetchToken,
    unwrapBKey,
  } = location.state || {};

  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );

  if (!integration) {
    return (
      <LoadingSpinner className="bg-grey-20 flex items-center flex-col justify-center h-screen select-none" />
    );
  }

  // TODO: UX for this, FXA-8106
  if (oAuthDataError) {
    return (
      <AppLayout>
        <CardHeader
          headingText="Unexpected error"
          headingTextFtlId="auth-error-999"
        />
      </AppLayout>
    );
  }

  /* Users who reach this page should have account data set in localStorage.
   * Account data is persisted local storage after creating an (unverified) account
   * and after sign in. Users may also have localStorage set by the browser if
   * they are logged in.

   * The session token from local storage is required to verify the signup code.
   * If this page is reached without an account in localStorage (e.g., directly from
   * URL), redirect to `/`.

   * TOOD: when we pull the account.verifySession call into the container component,
   * ensure we're only reading from localStorage once. `sessionToken()` also reads from
   * localStorage. */
  const storedLocalAccount = currentAccount();
  const { email, sessionToken, uid } = storedLocalAccount;

  // Users in this state should never reach this as they should see the Backbone version
  // of this page until we convert signin to React, but guard against anyway. See
  // comment in `router.js` for this route for more info.
  if (isOAuthIntegration(integration) && (!keyFetchToken || !unwrapBKey)) {
    // Report an error to Sentry on the off-chance that this React page is reached without required state
    sentryMetrics.captureException(
      new Error(
        'WARNING: User should not have reached ConfirmSignupCode in React without required state for OAuth integration. Redirecting to Backbone signin page.'
      )
    );
    const params = new URLSearchParams(location.search);
    // Remove `emailFromContent` since we pass that when coming
    // from content-server to Backbone, see Signup container component
    // for more info.
    params.delete('emailFromContent');
    hardNavigateToContentServer(`/signin?${params.toString()}`);
    return (
      <LoadingSpinner className="bg-grey-20 flex items-center flex-col justify-center h-screen select-none" />
    );
  }

  if (!storedLocalAccount || !email || !sessionToken || !uid) {
    const params = new URLSearchParams(location.search);
    // Passing back the 'email' param causes various behaviors in
    // content-server since it marks the email as "coming from a RP".
    // Also remove `emailFromContent` since we pass that when coming
    // from content-server to Backbone, see Signup container component
    // for more info.
    params.delete('emailFromContent');
    params.delete('email');
    hardNavigateToContentServer(`/?${params.toString()}`);
    return (
      <LoadingSpinner className="bg-grey-20 flex items-center flex-col justify-center h-screen select-none" />
    );
  }

  return (
    <ConfirmSignupCode
      {...{
        email,
        uid,
        sessionToken,
        integration,
        finishOAuthFlowHandler,
        newsletterSlugs,
        keyFetchToken,
        unwrapBKey,
      }}
    />
  );
};

export default SignupConfirmCodeContainer;
