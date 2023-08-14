/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthClient from 'fxa-auth-client/browser';
import { useCallback } from 'react';
import {
  Integration,
  OAuthIntegration,
  isOAuthIntegration,
} from '../../models';
import { createEncryptedBundle } from '../crypto/scoped-keys';

// Do we need this or can we rely on `@bind` methods? FXA-8106
const checkOAuthData = (integration: OAuthIntegration): Error | null => {
  // Ensure a redirect was provided. Without this info, we can't relay the oauth code
  // and state!
  if (!integration.data.redirectTo && !integration.data.redirectUri) {
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
    integration.wantsKeys() &&
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
      await integration.getNormalizedScope()
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
  keysJwe: any
) {
  const opts: any = {
    acr_values: integration.data.acrValues,
    code_challenge: integration.data.codeChallenge,
    code_challenge_method: integration.data.codeChallengeMethod,
    scope: await integration.getNormalizedScope(),
  };
  if (keysJwe) {
    opts.keys_jwe = keysJwe;
  }
  if (integration.data.accessType === 'offline') {
    opts.access_type = integration.data.accessType;
  }

  const result = await authClient.createOAuthCode(
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
function constructOAuthRedirectUrl(
  oauthCode: {
    code: string;
    state: string;
  },
  redirectTo: string
) {
  // Update the state of the redirect URI
  const redirectUri = new URL(redirectTo);
  if (oauthCode.code) {
    redirectUri.searchParams.set('code', oauthCode.code);
  }
  if (oauthCode.state) {
    redirectUri.searchParams.set('state', oauthCode.state);
  }
  return redirectUri;
}

export type FinishOAuthFlowHandler = (
  accountUid: string,
  sessionToken: string,
  keyFetchToken: string,
  unwrapKB: string
) => Promise<{ redirect: string }>;

type FinishOAuthFlowHandlerResult = {
  finishOAuthFlowHandler: FinishOAuthFlowHandler;
  oAuthDataError: null | Error;
};

/**
 * Generates a redirect link which relays the new oauth token to the relying party.
 * @param accountUid - Current account uid
 * @param sessionToken - Current session token
 * @param keyFetchToken - Current key fetch token
 * @param unwrapKB - Used to unwrap the account keys
 * @returns An object containing the redirect URL, that can relay the new OAuthCode.
 */
export function useFinishOAuthFlowHandler(
  authClient: AuthClient,
  integration: Integration
): FinishOAuthFlowHandlerResult {
  const finishOAuthFlowHandler: FinishOAuthFlowHandler = useCallback(
    async (accountUid, sessionToken, keyFetchToken, unwrapKB) => {
      const oAuthIntegration = integration as OAuthIntegration;
      const { kB } = await authClient.accountKeys(keyFetchToken, unwrapKB);
      const keys = await constructKeysJwe(
        authClient,
        oAuthIntegration,
        accountUid,
        sessionToken,
        keyFetchToken,
        kB
      );
      const code = await constructOAuthCode(
        authClient,
        oAuthIntegration,
        sessionToken,
        keys
      );
      const redirectUrl = constructOAuthRedirectUrl(
        code,
        oAuthIntegration.data.redirectTo
      );
      return {
        redirect: redirectUrl.href,
      };
    },
    [authClient, integration]
  );

  // We can't return early because `useCallback` can't be set conditionally
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
