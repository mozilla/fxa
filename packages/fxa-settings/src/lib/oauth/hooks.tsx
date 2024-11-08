/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthClient from 'fxa-auth-client/browser';
import { useCallback } from 'react';
import {
  Integration,
  OAuthIntegration,
  isOAuthNativeIntegrationSync,
  isOAuthIntegration,
  isSyncDesktopV3Integration,
} from '../../models';
import { createEncryptedBundle } from '../crypto/scoped-keys';
import { Constants } from '../constants';
import { AuthError, OAUTH_ERRORS, OAuthError } from './oauth-errors';
import { AuthUiErrors } from '../auth-errors/auth-errors';

export type OAuthData = {
  code: string;
  state: string;
  redirect: string; // you probably don't want this, see comment below
};

interface FinishOAuthFlowHandlerError {
  redirect: undefined;
  code: undefined;
  state: undefined;
  error: AuthError;
}
interface FinishOAuthFlowHandlerSuccess {
  redirect: string;
  code: string;
  state: string;
  error: undefined;
}

export type FinishOAuthFlowHandlerResult =
  | FinishOAuthFlowHandlerSuccess
  | FinishOAuthFlowHandlerError;

const checkOAuthData = (integration: OAuthIntegration): AuthError | null => {
  // Ensure a redirect was provided or matched. Without this info, we can't relay the
  // oauth code and state on a redirect!
  // clientInfo?.redirectUri has already validated the redirect_uri query param
  if (!integration.clientInfo?.redirectUri) {
    return OAUTH_ERRORS.INCORRECT_REDIRECT;
  }
  if (!integration.data.clientId) {
    return OAUTH_ERRORS.UNKNOWN_CLIENT;
  }
  if (!integration.data.state) {
    return {
      errno: OAUTH_ERRORS.INVALID_PARAMETER.errno,
      message: new OAuthError(OAUTH_ERRORS.INVALID_PARAMETER.errno, {
        param: 'state',
      }).error as string,
    };
  }
  return null;
};

/**
 * Constructs JSON web encrypted keys
 * @param accountUid - Current account UID
 * @param sessionToken - Current Session Token
 * @param keyFetchToken - Current Key Fetch Token
 * @param kB -The encryption key for class-b data. See eco system docs for more info.
 * @returns JSON Web Ecrypted Kyes
 */
async function constructKeysJwe(
  authClient: AuthClient,
  integration: OAuthIntegration,
  accountUid: string,
  sessionToken: string,
  keyFetchToken: string,
  kB: string
) {
  if (
    integration.data.scope &&
    integration.data.keysJwk &&
    integration.data.clientId &&
    sessionToken &&
    kB &&
    keyFetchToken
  ) {
    const clientKeyData = await authClient.getOAuthScopedKeyData(
      sessionToken,
      integration.data.clientId,
      integration.getNormalizedScope()
    );

    if (clientKeyData && Object.keys(clientKeyData).length > 0) {
      const keys = await createEncryptedBundle(
        kB,
        accountUid,
        clientKeyData,
        integration.data.keysJwk
      );
      return keys;
    }
  }
}

/**
 * Creates a new OAuth Code
 * @param sessionToken - The Current session token
 * @param keysJwe - An encrypted JWE bundle of key material, to be returned to the client when it redeems the authorization code
 * @returns An OAuth code
 */
async function getOAuthData(
  authClient: AuthClient,
  integration: OAuthIntegration,
  sessionToken: string,
  keysJwe?: string
) {
  const opts: any = {
    acr_values: integration.data.acrValues,
    code_challenge: integration.data.codeChallenge,
    code_challenge_method: integration.data.codeChallengeMethod,
    scope: integration.getNormalizedScope(),
  };
  if (keysJwe) {
    opts.keys_jwe = keysJwe;
  }
  if (integration.data.accessType === 'offline') {
    opts.access_type = integration.data.accessType;
  }

  const result: OAuthData | null = await authClient.createOAuthCode(
    sessionToken,
    integration.data.clientId,
    integration.data.state,
    opts
  );

  return result;
}

/**
 * Builds an updated redirect url for the relying party
 * @param oauthCode
 * @returns
 */
function constructOAuthRedirectUrl(oauthData: OAuthData, redirectUri: string) {
  // Update the state of the redirect URI
  let constructedRedirectUri = new URL(redirectUri);
  if (oauthData.code) {
    constructedRedirectUri.searchParams.set('code', oauthData.code);
  }
  if (oauthData.state) {
    constructedRedirectUri.searchParams.set('state', oauthData.state);
  }
  return constructedRedirectUri;
}

export type FinishOAuthFlowHandler = (
  accountUid: string,
  sessionToken: string,
  keyFetchToken?: string,
  unwrapKB?: string
) => Promise<FinishOAuthFlowHandlerResult>;

type UseFinishOAuthFlowHandlerResult = {
  finishOAuthFlowHandler: FinishOAuthFlowHandler;
  oAuthDataError: null | AuthError;
};

export function tryAgainError() {
  return { error: new OAuthError('TRY_AGAIN') };
}

/**
 * Generates a redirect link which relays the new oauth token to the relying party.
 * @param accountUid - Current account uid
 * @param sessionToken - Current session token
 * @param keyFetchToken - Current key fetch token
 * @param unwrapBKey - Used to unwrap the account keys
 * @returns An object containing the redirect URL, that can relay the new OAuthCode.
 */
export function useFinishOAuthFlowHandler(
  authClient: AuthClient,
  integration: Pick<Integration, 'clientInfo' | 'type' | 'wantsKeys' | 'data'>
): UseFinishOAuthFlowHandlerResult {
  const isSyncOAuth = isOAuthNativeIntegrationSync(integration);

  const finishOAuthFlowHandler: FinishOAuthFlowHandler = useCallback(
    async (accountUid, sessionToken, keyFetchToken, unwrapBKey) => {
      const oAuthIntegration = integration as OAuthIntegration;

      let keys;
      if (integration.wantsKeys() && keyFetchToken && unwrapBKey) {
        try {
          const { kB } = await authClient.accountKeys(
            keyFetchToken,
            unwrapBKey
          );
          keys = await constructKeysJwe(
            authClient,
            oAuthIntegration,
            accountUid,
            sessionToken,
            keyFetchToken,
            kB
          );
        } catch (e) {
          return tryAgainError();
        }
      }

      // oAuthCode is an object that contains 'code', 'state' and 'redirect'
      // The oauth-server would previously construct and return the full redirect URI (as redirect)
      // but we now expect to receive `code` and `state` and build it ourselves
      // using the relier's locally-validated redirectUri (clientInfo.redirectUri).
      // The previous 'redirect' is still included in the oAuthCode object, but is rejected by the relier
      // as having incorrect state if used directly unless the redirect URI is not provided by the relier
      let oAuthData;
      try {
        oAuthData = await getOAuthData(
          authClient,
          oAuthIntegration,
          sessionToken,
          keys
        );
        if (!oAuthData) throw new OAuthError('INVALID_RESULT');
      } catch (error) {
        // We only care about these errors, else just tell the user to try again.
        if (
          error.errno === AuthUiErrors.TOTP_REQUIRED.errno ||
          error.errno === AuthUiErrors.INSUFFICIENT_ACR_VALUES.errno
        ) {
          return { error };
        }
        return tryAgainError();
      }

      const redirect = isSyncOAuth
        ? Constants.OAUTH_WEBCHANNEL_REDIRECT
        : constructOAuthRedirectUrl(
            oAuthData,
            // We know this is not falsey because this value will have already been checked
            oAuthIntegration.clientInfo?.redirectUri!
          ).href;

      // Always use the state the RP passed in for Sync OAuth.
      // This is necessary to complete the prompt=none
      // flow error cases where no interaction with
      // the server occurs to get the state from
      // the redirect_uri returned when creating
      // the token or code.
      const state = isSyncOAuth ? integration.data.state : oAuthData.state;

      return {
        redirect,
        code: oAuthData.code,
        state,
      };
    },
    [authClient, integration, isSyncOAuth]
  );

  /* TODO: Probably remove 'isOAuthVerificationDifferentBrowser' and
   * 'isOAuthVerificationSameBrowser' checks when reset PW no longer uses links.
   *
   * `service=sync` is passed when `context` is `fx_desktop_v3` (old Sync desktop) or
   * when context is `fx_ios_v1` (which we don't support, iOS 1.0 ... < 2.0). See:
   * https://mozilla.github.io/ecosystem-platform/relying-parties/reference/query-parameters#service
   *
   * However¹, mobile Sync reset PW can pass a 'service' param without a 'clientId' that
   * acts as a clientId, and we currently consider this an OAuth flow (in Backbone as well)
   * that does not want to redirect. For this case, ensure `integration.data.service`
   * does not exist, because we otherwise do not want to check other OAuth data
   * are present and do not want to provide back `finishOAuthFlowHandler`.
   *
   * ¹This was the case when reset password had an OAuth redirect - we only called
   * `checkOAuthData` if `integration.data.service` was _not_ present in the URL. We can
   * revisit this with the reset PW redesign.
   *
   * P.S. we can't return early regardless because `useCallback` can't be set conditionally.
   */
  if (isOAuthIntegration(integration)) {
    const oAuthDataError = checkOAuthData(integration);
    return { oAuthDataError, finishOAuthFlowHandler };
  }
  return { oAuthDataError: null, finishOAuthFlowHandler };
}

/**
 * If we don't have `keyFetchToken` or `unwrapBKey` and it's required, the user needs to
 * restart the flow. We only store these values in memory, so they don't persist across page
 * refreshes or browser session restarts. We can't redirect to /signin and reprompt for
 * password in a browser session restart/crash because the browser stores the flow state in
 * memory and the query params won't match after a browser session is restored.
 *
 * TODO: Can we check session storage for if the user just refreshed so we can redirect them
 * to /signin instead of showing an error component? FXA-10707
 */
export function useOAuthKeysCheck(
  integration: Pick<Integration, 'type' | 'wantsKeys'>,
  keyFetchToken?: hexstring,
  unwrapBKey?: hexstring
) {
  if (
    (isOAuthIntegration(integration) ||
      isSyncDesktopV3Integration(integration)) &&
    integration.wantsKeys() &&
    (!keyFetchToken || !unwrapBKey)
  ) {
    return {
      oAuthKeysCheckError: OAUTH_ERRORS.TRY_AGAIN,
    };
  }
  return { oAuthKeysCheckError: null };
}
