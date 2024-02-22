/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthClient from 'fxa-auth-client/browser';
import { useCallback } from 'react';
import {
  Integration,
  OAuthIntegration,
  isOAuthIntegration,
  isSyncOAuthIntegration,
} from '../../models';
import { createEncryptedBundle } from '../crypto/scoped-keys';
import { Constants } from '../constants';

type OAuthCode = {
  code: string;
  state: string;
  redirect: string; // you probably don't want this, see comment below
};

// TODO: Do we need this or can we rely on `@bind` methods? FXA-8106
const checkOAuthData = (integration: OAuthIntegration): Error | null => {
  // Ensure a redirect was provided or matched. Without this info, we can't relay the
  // oauth code and state on a redirect!
  if (!integration.data.redirectUri && !integration.clientInfo?.redirectUri) {
    return new OAuthErrorInvalidRedirectUri();
  }
  if (!integration.data.clientId) {
    return new OAuthErrorInvalidRelierClientId();
  }
  if (!integration.data.state) {
    return new OAuthErrorInvalidRelierState();
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
async function constructOAuthCode(
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

  const result: OAuthCode = await authClient.createOAuthCode(
    sessionToken,
    integration.data.clientId,
    integration.data.state,
    opts
  );

  if (!result) {
    throw new OAuthErrorInvalidOAuthCodeResult();
  }

  return result;
}

/**
 * Builds an updated redirect url for the relying party
 * @param oauthCode
 * @returns
 */
function constructOAuthRedirectUrl(oauthCode: OAuthCode, redirectUri: string) {
  // Update the state of the redirect URI
  let constructedRedirectUri = new URL(redirectUri);
  if (oauthCode.code) {
    constructedRedirectUri.searchParams.set('code', oauthCode.code);
  }
  if (oauthCode.state) {
    constructedRedirectUri.searchParams.set('state', oauthCode.state);
  }
  return constructedRedirectUri;
}

export type FinishOAuthFlowHandler = (
  accountUid: string,
  sessionToken: string,
  keyFetchToken?: string,
  unwrapKB?: string
) => Promise<{ redirect: string; code: string; state: string }>;

type FinishOAuthFlowHandlerResult = {
  finishOAuthFlowHandler: FinishOAuthFlowHandler;
  oAuthDataError: null | Error;
};

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
  integration: Integration
): FinishOAuthFlowHandlerResult {
  const isSyncOAuth = isSyncOAuthIntegration(integration);

  const finishOAuthFlowHandler: FinishOAuthFlowHandler = useCallback(
    async (accountUid, sessionToken, keyFetchToken, unwrapBKey) => {
      const oAuthIntegration = integration as OAuthIntegration;

      let keys;
      if (integration.wantsKeys() && keyFetchToken && unwrapBKey) {
        const { kB } = await authClient.accountKeys(keyFetchToken, unwrapBKey);
        keys = await constructKeysJwe(
          authClient,
          oAuthIntegration,
          accountUid,
          sessionToken,
          keyFetchToken,
          kB
        );
      }

      // oAuthCode is an object that contains 'code', 'state' and 'redirect'
      // The oauth-server would previously construct and return the full redirect URI (as redirect)
      // but we now expect to receive `code` and `state` and build it ourselves
      // using the relier's locally-validated redirectUri.
      // The previous 'redirect' is still included in the oAuthCode object, but is rejected by the relier
      // as having incorrect state if used directly unless the redirect URI is not provided by the relier
      const oAuthCode = await constructOAuthCode(
        authClient,
        oAuthIntegration,
        sessionToken,
        keys
      );

      const redirect = isSyncOAuth
        ? Constants.OAUTH_WEBCHANNEL_REDIRECT
        : constructOAuthRedirectUrl(
            oAuthCode,
            // If the RP did not pass `redirect_uri` via query param, use clientInfo's
            oAuthIntegration.data.redirectUri ||
              oAuthIntegration.clientInfo?.redirectUri
          ).href;

      // Always use the state the RP passed in for OAuth Webchannel.
      // This is necessary to complete the prompt=none
      // flow error cases where no interaction with
      // the server occurs to get the state from
      // the redirect_uri returned when creating
      // the token or code.
      const state = isSyncOAuth ? integration.data.state : oAuthCode.state;

      return {
        redirect,
        code: oAuthCode.code,
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

// TODO: FXA-8106
// 1. Is there a better way to handle these errors. I (Dan) prefer having error types that
// specific even if the error object's state is general.
// 2. Do we want to surface these errors to users or what's the expected behavior? In
// content-server we just show the user a banner with "invalid client ID" etc.
export class OAuthErrorInvalidRelierClientId extends Error {
  public readonly errno = 1001;
  constructor() {
    super('UNEXPECTED_ERROR');
  }
}

export class OAuthErrorInvalidOAuthCodeResult extends Error {
  public readonly errno = 1001;
  constructor() {
    super('UNEXPECTED_ERROR');
  }
}

export class OAuthErrorInvalidRelierState extends Error {
  public readonly errno = 1001;
  constructor() {
    super('UNEXPECTED_ERROR');
  }
}

export class OAuthErrorInvalidRedirectUri extends Error {
  public readonly errno = 1001;
  constructor() {
    super('UNEXPECTED_ERROR');
  }
}
