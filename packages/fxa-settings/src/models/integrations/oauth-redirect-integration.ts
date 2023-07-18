/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createEncryptedBundle } from '../../lib/crypto/scoped-keys';
import { OAuthRelier } from '../reliers';

export interface ResetPasswordCallbacks {
  accountKeys(keyFetchToken: string, unwrapKB: string): Promise<{ kB: string }>;

  getOAuthScopedKeyData(
    sessionToken: string,
    clientId: string,
    scope: string
  ): Promise<Record<string, any>>;

  createOAuthCode(
    sessionToken: string,
    clientId: string,
    state: string,
    opts: {
      acr_values: string | undefined;
      code_challenge: string | undefined;
      code_challengeMethod: string | undefined;
      scope: string | undefined;
      keys_jwe: string | undefined;
      access_type: string | undefined;
    }
  ): Promise<any>;
}

/**
 * Handles logic around generating a redirect for relying party after a successful password reset.
 */
export class OAuthRedirectIntegration {
  constructor(
    protected readonly relier: OAuthRelier,
    protected readonly callbacks: ResetPasswordCallbacks
  ) {}

  /**
   * After a password reset, this code can be used to generate a redirect link which relays the new oauth token to the relying party.
   * @param accountUid - Current account uid
   * @param sessionToken - Current session token
   * @param keyFetchToken - Current key fetch token
   * @param unwrapKB - Used to unwrap the account keys
   * @returns An object containing the redirect URL, that can relay the new OAuthCode.
   */
  public async handlePasswordReset(
    accountUid: string,
    sessionToken: string,
    keyFetchToken: string,
    unwrapKB: string
  ) {
    const { kB } = await this.callbacks.accountKeys(keyFetchToken, unwrapKB);
    const keys = await this.constructKeysJwe(
      accountUid,
      sessionToken,
      keyFetchToken,
      kB
    );
    const code = await this.constructOAuthCode(sessionToken, keys);
    const redirect = this.constructOAuthRedirectUrl(code);
    return {
      redirect: redirect.href,
    };
  }

  /**
   * Constructs JSON web encrypted keys
   * @param accountUid - Current account UID
   * @param sessionToken - Current Session Token
   * @param keyFetchToken - Current Key Fetch Token
   * @param kB -The encryption key for class-b data. See eco system docs for more info.
   * @returns JSON Web Ecrypted Kyes
   */
  private async constructKeysJwe(
    accountUid: string,
    sessionToken: string,
    keyFetchToken: string,
    kB: string
  ) {
    const wantsKeys = await this.relier.wantsKeys();

    if (
      wantsKeys &&
      this.relier.scope &&
      this.relier.keysJwk &&
      this.relier.clientId &&
      sessionToken &&
      kB &&
      keyFetchToken
    ) {
      const clientKeyData = await this.callbacks.getOAuthScopedKeyData(
        sessionToken,
        this.relier.clientId,
        this.relier.scope
      );

      if (clientKeyData && Object.keys(clientKeyData).length > 0) {
        const keys = await createEncryptedBundle(
          kB,
          accountUid,
          clientKeyData,
          this.relier.keysJwk
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
  private async constructOAuthCode(sessionToken: string, keysJwe: any) {
    if (!this.relier.clientId) {
      throw new OAuthErrorInvalidRelierClientId();
    }
    if (!this.relier.state) {
      throw new OAuthErrorInvalidRelierState();
    }

    const opts: any = {
      acr_values: this.relier.acrValues,
      code_challenge: this.relier.codeChallenge,
      code_challenge_method: this.relier.codeChallengeMethod,
      scope: this.relier.scope,
    };
    if (keysJwe) {
      opts.keys_jwe = keysJwe;
    }
    if (this.relier.accessType === 'offline') {
      opts.access_type = this.relier.accessType;
    }

    const result = await this.callbacks.createOAuthCode(
      sessionToken,
      this.relier.clientId,
      this.relier.state,
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
  private constructOAuthRedirectUrl(oauthCode: {
    code: string;
    state: string;
  }) {
    // Ensure a redirect was provided. With out this info, we can't relay the oauth code
    // and state!
    if (!this.relier.redirectTo) {
      throw new OAuthErrorInvalidRedirectUri();
    }

    // Update the state of the redirect URI
    const redirectUri = new URL(this.relier.redirectTo);
    if (oauthCode.code) {
      redirectUri.searchParams.set('code', oauthCode.code);
    }
    if (oauthCode.state) {
      redirectUri.searchParams.set('state', oauthCode.state);
    }
    return redirectUri;
  }
}

// TODO: Is there a better way to handle these errors. I prefer having error types that specific even
// if the error object's state is general.
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
