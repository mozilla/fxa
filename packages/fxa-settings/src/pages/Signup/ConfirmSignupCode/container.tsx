/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useNavigateWithQuery, useOAuthFlowRecovery } from '../../../lib/hooks';
import { currentAccount } from '../../../lib/cache';
import {
  useFinishOAuthFlowHandler,
  useOAuthKeysCheck,
} from '../../../lib/oauth/hooks';
import {
  Integration,
  isOAuthNativeIntegration,
  useAuthClient,
  useFtlMsgResolver,
  useSensitiveDataClient,
} from '../../../models';
import ConfirmSignupCode from '.';
import { LocationState } from './interfaces';
import OAuthDataError from '../../../components/OAuthDataError';
import { QueryParams } from '../../..';
import { SensitiveData } from '../../../lib/sensitive-data-client';
import GleanMetrics from '../../../lib/glean';
import AppLayout from '../../../components/AppLayout';

export const POLL_INTERVAL = 5000;
export const POLL_TIMEOUT = 10 * 60 * 1000;

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
  setCurrentSplitLayout,
}: {
  integration: Integration;
  flowQueryParams: QueryParams;
  setCurrentSplitLayout?: (value: boolean) => void;
}) => {
  const authClient = useAuthClient();
  const sensitiveDataClient = useSensitiveDataClient();
  const ftlMsg = useFtlMsgResolver();
  const { keyFetchToken, unwrapBKey } =
    sensitiveDataClient.getDataType(SensitiveData.Key.Auth) || {};

  const { oAuthKeysCheckError } = useOAuthKeysCheck(
    integration,
    keyFetchToken,
    unwrapBKey
  );

  // Hook to recover OAuth flow after page refresh or browser crash
  const { isRecovering, recoveryFailed, attemptOAuthFlowRecovery } =
    useOAuthFlowRecovery(integration);

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
  const [hasHardBounce, setHasHardBounce] = useState(false);

  useEffect(() => {
    // A deadline rather than a tick count: a backgrounded tab throttles timers,
    // so 120 ticks can span much longer than 10 minutes.
    const pollDeadline = Date.now() + POLL_TIMEOUT;
    // Local to this effect run, so a check left in flight by an earlier run
    // cannot stop the interval the current run owns.
    let intervalId: NodeJS.Timeout | undefined;

    const stopPolling = () => {
      clearInterval(intervalId);
    };

    const checkEmailBounceStatus = async () => {
      if (!email) return;
      if (Date.now() >= pollDeadline) {
        stopPolling();
        return;
      }
      try {
        // Type assertion needed until fxa-auth-client is rebuilt with new method
        const result = await (
          authClient as typeof authClient & {
            emailBounceStatus: (
              email: string
            ) => Promise<{ hasHardBounce: boolean }>;
          }
        ).emailBounceStatus(email);
        if (result.hasHardBounce) {
          setHasHardBounce(true);
          // The answer is known, so there is nothing left to poll for.
          stopPolling();
        }
      } catch (error) {
        // Stop on any 4xx or 5xx. A network failure carries no code, so
        // polling continues in that case.
        const code = (error as { code?: number })?.code;
        if (code !== undefined && code >= 400 && code < 600) {
          stopPolling();
        }
        console.error('Error checking email bounce status:', error);
      }
    };

    // Set up polling before the initial check so that check can stop it
    intervalId = setInterval(checkEmailBounceStatus, POLL_INTERVAL);

    // Initial check
    checkEmailBounceStatus();

    return stopPolling;
  }, [authClient, email]);

  const [recoveryAttempted, setRecoveryAttempted] = useState<boolean>(false);

  // Attempt OAuth flow recovery for Firefox/Sync when state is missing or keys are lost
  useEffect(() => {
    const shouldAttemptRecovery =
      !recoveryAttempted &&
      isOAuthNativeIntegration(integration) &&
      (!uid || !sessionToken || !email || oAuthKeysCheckError);

    if (shouldAttemptRecovery) {
      setRecoveryAttempted(true);
      attemptOAuthFlowRecovery();
    }
  }, [
    recoveryAttempted,
    integration,
    uid,
    sessionToken,
    email,
    oAuthKeysCheckError,
    attemptOAuthFlowRecovery,
  ]);

  // Handle recovery failure - navigate to signin with error message
  useEffect(() => {
    if (recoveryFailed) {
      const localizedErrorMessage = ftlMsg.getMsg(
        'signin-recovery-error',
        'Something went wrong. Please sign in again.'
      );
      navigateWithQuery('/signin', {
        state: { localizedErrorMessage },
      });
    }
  }, [recoveryFailed, ftlMsg, navigateWithQuery]);

  // Handle email bounces
  useEffect(() => {
    if (hasHardBounce) {
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
  }, [hasHardBounce, origin, navigateWithQuery, email]);

  const cmsInfo = integration?.getCmsInfo();
  const splitLayout = cmsInfo?.SignupConfirmCodePage?.splitLayout;

  // TODO: This check and related test can be moved up the tree to the App component,
  // where a missing integration should be caught and handled.
  if (!integration) {
    return (
      <AppLayout {...{ loading: true, splitLayout, setCurrentSplitLayout }} />
    );
  }

  // Show loading while attempting OAuth flow recovery
  if (isRecovering) {
    return (
      <AppLayout
        {...{ cmsInfo, loading: true, splitLayout, setCurrentSplitLayout }}
      />
    );
  }

  if (!uid || !sessionToken || !email) {
    // For non-OAuth Native flows, navigate to root
    // For OAuth Native flows, recovery was already attempted above
    if (!isOAuthNativeIntegration(integration)) {
      navigateWithQuery('/');
    }
    return (
      <AppLayout
        {...{ cmsInfo, loading: true, splitLayout, setCurrentSplitLayout }}
      />
    );
  }

  if (oAuthDataError) {
    return (
      <OAuthDataError
        error={oAuthDataError}
        gleanMetric={GleanMetrics.signupConfirmation.error}
      />
    );
  }
  if (oAuthKeysCheckError) {
    // For OAuth Native flows, recovery was already attempted above
    if (isOAuthNativeIntegration(integration)) {
      // Recovery should have redirected; show loading while that happens
      return (
        <AppLayout
          {...{ cmsInfo, loading: true, splitLayout, setCurrentSplitLayout }}
        />
      );
    }
    if (!keyFetchToken || !unwrapBKey) {
      const localizedErrorMessage = ftlMsg.getMsg(
        'signin-code-expired-error',
        'Code expired. Please sign in again.'
      );
      navigateWithQuery('/signin', {
        state: {
          localizedErrorMessage,
        },
      });
      return (
        <AppLayout
          {...{ cmsInfo, loading: true, splitLayout, setCurrentSplitLayout }}
        />
      );
    }
    return (
      <OAuthDataError
        error={oAuthKeysCheckError}
        gleanMetric={GleanMetrics.signupConfirmation.error}
      />
    );
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
        origin,
        setCurrentSplitLayout,
      }}
    />
  );
};
export default SignupConfirmCodeContainer;
