/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GraphQLError } from 'graphql';
import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';
import {
  BeginSigninError,
  NavigationOptions,
  SigninLocationState,
} from './interfaces';
import {
  AuthUiErrorNos,
  AuthUiErrors,
} from '../../lib/auth-errors/auth-errors';
import { isOAuthIntegration } from '../../models';
import { navigate } from '@reach/router';
import { hardNavigate } from 'fxa-react/lib/utils';
import { currentAccount } from '../../lib/cache';
import firefox from '../../lib/channels/firefox';
import { AuthError } from '../../lib/oauth';
import GleanMetrics from '../../lib/glean';

interface NavigationTarget {
  to: string;
  state?: SigninLocationState;
  shouldHardNavigate?: boolean;
  error?: undefined;
}
interface NavigationTargetError {
  to?: undefined;
  state?: undefined;
  shouldHardNavigate?: undefined;
  error: AuthError;
}

// TODO: don't hard navigate once ConnectAnotherDevice is converted to React
export function getSyncNavigate(queryParams: string) {
  const searchParams = new URLSearchParams(queryParams);
  searchParams.set('showSuccessMessage', 'true');
  return {
    to: `/connect_another_device?${searchParams}`,
    shouldHardNavigate: true,
  };
}

// In Backbone and React, 'confirm_signup_code' and 'signin_token_code' send key
// and token data up to Sync with fxa_login and then the CAD page (currently
// Backbone) completes the signin with fxa_status.
//
// In Backbone happy path signin (session is verified after signin) as well as
// Backbone 'signin_totp_code' and `signin_unblock`, we send key/token data up on
// the CAD page itself with an fxa_status message. We don't want to do this with
// React signin until CAD is converted to React because we'd need to pass this
// data back to Backbone. This means temporarily we need to send the sync data up
// _before_ we hard navigate to CAD in these flows.
export async function handleNavigation(
  navigationOptions: NavigationOptions,
  tempHandleSyncLogin = false
) {
  const { to, state, shouldHardNavigate, error } = await getNavigationTarget(
    navigationOptions
  );
  if (error) {
    return { error };
  }

  if (shouldHardNavigate) {
    if (tempHandleSyncLogin && navigationOptions.integration.isSync()) {
      firefox.fxaLogin({
        email: navigationOptions.email,
        // keyFetchToken and unwrapBKey should always exist if Sync integration
        keyFetchToken: navigationOptions.signinData.keyFetchToken!,
        unwrapBKey: navigationOptions.unwrapBKey!,
        sessionToken: navigationOptions.signinData.sessionToken,
        uid: navigationOptions.signinData.uid,
        verified: navigationOptions.signinData.verified,
      });
    }

    // Hard navigate to RP, or (temp until CAD is Reactified) CAD
    hardNavigate(to);
  }
  if (state) {
    navigate(to, { state });
  } else {
    navigate(to);
  }
  return { error: undefined };
}

const getNavigationTarget = async ({
  email,
  signinData,
  unwrapBKey,
  integration,
  finishOAuthFlowHandler,
  redirectTo,
  queryParams = '',
}: NavigationOptions): Promise<NavigationTarget | NavigationTargetError> => {
  const isOAuth = isOAuthIntegration(integration);
  const {
    verified,
    verificationReason,
    verificationMethod,
    keyFetchToken,
    uid,
    sessionToken,
  } = signinData;

  const createSigninLocationState = (): SigninLocationState => ({
    email,
    uid,
    sessionToken,
    verified,
    verificationMethod,
    verificationReason,
    keyFetchToken,
    unwrapBKey,
  });

  const getUnverifiedNav = () => {
    const getUnverifiedNavTo = () => {
      // TODO in FXA-9177 Consider storing state in Apollo cache instead of location state
      if (
        ((verificationReason === VerificationReasons.SIGN_IN ||
          verificationReason === VerificationReasons.CHANGE_PASSWORD) &&
          verificationMethod === VerificationMethods.TOTP_2FA) ||
        (isOAuth && integration.wantsTwoStepAuthentication())
      ) {
        return `/signin_totp_code${queryParams}`;
      } else if (verificationReason === VerificationReasons.SIGN_UP) {
        return `/confirm_signup_code${queryParams}`;
      }
      return `/signin_token_code${queryParams}`;
    };

    return { to: getUnverifiedNavTo(), state: createSigninLocationState() };
  };

  if (!verified) {
    return getUnverifiedNav();
  }

  if (verificationReason === VerificationReasons.CHANGE_PASSWORD) {
    return {
      to: `/post_verify/password/force_password_change${
        (queryParams.length > 1 && queryParams) || ''
      }`,
      // TODO in FXA-6653: remove shouldHardNavigate when this route is converted to React
      shouldHardNavigate: true,
    };
  }

  // OAuth redirect can only be obtained when the session is verified
  // otherwise oauth/authorization endpoint throws an "unconfirmed session" error
  if (isOAuth) {
    const { error, redirect, code, state } = await finishOAuthFlowHandler(
      uid,
      sessionToken,
      keyFetchToken,
      unwrapBKey
    );
    if (error) {
      if (
        error.errno === AuthUiErrors.TOTP_REQUIRED.errno ||
        error.errno === AuthUiErrors.INSUFFICIENT_ACR_VALUES.errno
      ) {
        GleanMetrics.login.error({ event: { reason: error.message } });
        return {
          to: `/inline_totp_setup${queryParams}`,
          state: createSigninLocationState(),
        };
      }
      return { error };
    }

    if (integration.isSync()) {
      firefox.fxaOAuthLogin({
        action: 'signin',
        code,
        redirect,
        state,
      });
      return getSyncNavigate(queryParams);
    }
    return { to: redirect, shouldHardNavigate: true };
  }

  if (integration.isSync()) {
    return getSyncNavigate(queryParams);
  }

  if (redirectTo) {
    return { to: redirectTo, shouldHardNavigate: true };
  }

  return { to: '/settings' };
};

const handleAuthUiError = (error: {
  errno: number;
  message: string;
}): { error: BeginSigninError } => {
  const { errno } = error as BeginSigninError;
  if (errno && AuthUiErrorNos[errno]) {
    return { error };
  }
  return { error: AuthUiErrors.UNEXPECTED_ERROR as BeginSigninError };
};

export const getHandledError = (error: {
  errno: number;
  message: string;
  graphQLErrors?: GraphQLError[];
}) => {
  const graphQLError: GraphQLError | undefined = error.graphQLErrors?.[0];
  if (graphQLError) {
    return handleGQLError(graphQLError);
  }
  return handleAuthUiError(error);
};

const handleGQLError = (graphQLError: GraphQLError) => {
  const errno = graphQLError.extensions.errno as number;

  if (errno && AuthUiErrorNos[errno]) {
    const uiError = {
      message: AuthUiErrorNos[errno].message,
      errno,
      email:
        errno === AuthUiErrors.INCORRECT_EMAIL_CASE.errno
          ? graphQLError.extensions.email
          : undefined,
      verificationMethod:
        (graphQLError.extensions.verificationMethod as VerificationMethods) ||
        undefined,
      verificationReason:
        (graphQLError.extensions.verificationReason as VerificationReasons) ||
        undefined,
      retryAfter: (graphQLError.extensions.retryAfter as number) || undefined,
      retryAfterLocalized:
        (graphQLError?.extensions.retryAfterLocalized as string) || undefined,
    };
    return { error: uiError as BeginSigninError };
  }

  // if not a graphQLError or if no localizable message available for error
  return { error: AuthUiErrors.UNEXPECTED_ERROR as BeginSigninError };
};

export function getSigninState(
  locationState?: SigninLocationState
): SigninLocationState | null {
  return locationState && Object.keys(locationState).length > 0
    ? locationState
    : getStoredAccountInfo();
}

// When SigninLocationState is not available from the router state,
// this method can be used to check local storage
function getStoredAccountInfo() {
  const { email, sessionToken, uid, verified } = currentAccount() || {};
  if (email && sessionToken && uid && verified !== undefined) {
    return {
      email,
      sessionToken,
      uid,
      verified,
    };
  }
  return null;
}
