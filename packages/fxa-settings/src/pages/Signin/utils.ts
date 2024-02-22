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
import { NavigateFn } from '@reach/router';
import { hardNavigate } from 'fxa-react/lib/utils';
import { FinishOAuthFlowHandler } from '../../lib/oauth/hooks';
import { currentAccount } from '../../lib/cache';

// TODO in FXA-9059:
// function getSyncNavigate() {
// const searchParams = new URLSearchParams(location.search);
// searchParams.set('showSuccessMessage', 'true');
// const to = `/connect_another_device?${searchParams}`
// }

export async function handleNavigation(
  navigationOptions: NavigationOptions,
  navigate: NavigateFn
) {
  const { to, state, shouldHardNavigate } = await getNavigationTarget(
    navigationOptions
  );
  if (shouldHardNavigate) {
    // Hard navigate to RP, or (temp until CAD is Reactified) CAD
    hardNavigate(to);
    return;
  }
  if (state) {
    navigate(to, { state });
  } else {
    navigate(to);
  }
}

export async function getOAuthRedirectAndHandleSync(
  finishOAuthFlowHandler: FinishOAuthFlowHandler,
  {
    uid,
    sessionToken,
    keyFetchToken,
    unwrapBKey,
  }: {
    uid: hexstring;
    sessionToken: hexstring;
    keyFetchToken?: string;
    unwrapBKey?: string;
  }
) {
  const { redirect } =
    keyFetchToken && unwrapBKey
      ? await finishOAuthFlowHandler(
          uid,
          sessionToken,
          keyFetchToken,
          unwrapBKey
        )
      : await finishOAuthFlowHandler(uid, sessionToken);

  // TODO in FXA-9059 Sync signin ticket. Do we want to do firefox.fxAOAuthLogin here
  // if the session isn't verified?
  //
  // if (integration.isSync()) {
  //   firefox.fxaOAuthLogin({
  //     action: 'signin',
  //     code,
  //     redirect,
  //     state,
  //   })
  // TODO: don't hard navigate once ConnectAnotherDevice is converted to React
  //   return { to: getSyncNavigate(), shouldHardNavigate: true }
  // }
  return { to: redirect, shouldHardNavigate: true };
}

const getNavigationTarget = async ({
  email,
  signinData,
  unwrapBKey,
  integration,
  finishOAuthFlowHandler,
  redirectTo,
  queryParams = '',
}: NavigationOptions) => {
  const isOAuth = isOAuthIntegration(integration);
  const {
    verified,
    verificationReason,
    verificationMethod,
    keyFetchToken,
    uid,
    sessionToken,
  } = signinData;

  // oAuthResult result will need to be obtained at the next step, once session is verified
  if (!verified) {
    const state = {
      email,
      uid,
      sessionToken,
      verified,
      ...(verificationMethod && { verificationMethod }),
      ...(verificationReason && { verificationReason }),
      ...(keyFetchToken && { keyFetchToken }),
      ...(unwrapBKey && { unwrapBKey }),
    };

    // TODO in FXA-9177 Consider storing state in Apollo cache instead of location state
    if (
      ((verificationReason === VerificationReasons.SIGN_IN ||
        verificationReason === VerificationReasons.CHANGE_PASSWORD) &&
        verificationMethod === VerificationMethods.TOTP_2FA) ||
      (isOAuth && integration.wantsTwoStepAuthentication())
    ) {
      return {
        to: `/signin_totp_code${queryParams}`,
        state,
      };
    } else if (verificationReason === VerificationReasons.SIGN_UP) {
      return {
        to: `/confirm_signup_code${queryParams}`,
        state,
      };
    } else {
      return {
        to: `/signin_token_code${queryParams}`,
        state,
      };
    }
  }

  if (verificationReason === VerificationReasons.CHANGE_PASSWORD) {
    return {
      to:
        queryParams.length > 1
          ? `/post_verify/password/force_password_change${queryParams}`
          : '/post_verify/password/force_password_change',
      // TODO in FXA-6653: remove shouldHardNavigate when this route is converted to React
      shouldHardNavigate: true,
    };
  }

  // TODO in FXA-9059 handle sync desktop v3 integration post-sign in navigation

  // oAuthResult can only be obtained when the session is verified
  // otherwise oauth/authorization endpoint throws an "unconfirmed session" error
  if (verified && isOAuth) {
    const oAuthResult = await getOAuthRedirectAndHandleSync(
      finishOAuthFlowHandler,
      {
        uid,
        sessionToken,
        keyFetchToken,
        unwrapBKey,
      }
    );

    return {
      to: oAuthResult.to,
      shouldHardNavigate: oAuthResult.shouldHardNavigate,
    };
  }

  if (redirectTo) {
    return { to: redirectTo, shouldHardNavigate: true };
  }

  return { to: '/settings' };
};

export const handleGQLError = (error: any) => {
  const graphQLError: GraphQLError = error.graphQLErrors?.[0];
  const errno = graphQLError?.extensions?.errno as number;

  if (errno && AuthUiErrorNos[errno]) {
    const uiError = {
      message: AuthUiErrorNos[errno].message,
      errno,
      verificationMethod:
        (graphQLError.extensions.verificationMethod as VerificationMethods) ||
        undefined,
      verificationReason:
        (graphQLError.extensions.verificationReason as VerificationReasons) ||
        undefined,
      retryAfter: (graphQLError?.extensions?.retryAfter as number) || undefined,
      retryAfterLocalized:
        (graphQLError?.extensions?.retryAfterLocalized as string) || undefined,
    };
    return { error: uiError as BeginSigninError };
    // if not a graphQLError or if no localizable message available for error
  }

  return { error: AuthUiErrors.UNEXPECTED_ERROR as BeginSigninError };
};

// When SigninLocationState is not available from the router state,
// this method can be used to check local storage
export function getStoredAccountInfo() {
  const { email, sessionToken, uid, verified } = currentAccount() || {};
  if (email && sessionToken && uid && verified !== undefined) {
    const currentAccountData = {
      email,
      sessionToken,
      uid,
      verified,
    } as SigninLocationState;
    return currentAccountData;
  } else return {} as SigninLocationState;
}
