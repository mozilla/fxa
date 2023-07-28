/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Constants } from '../../lib/constants';
import {
  ModelDataStore,
  bind,
  KeyTransforms as T,
  ModelValidation as V,
} from '../../lib/model-data';
import { ERRORS, OAuthError } from '../../lib/oauth';
import {
  BaseRelier,
  Relier,
  RelierAccount,
  RelierClientInfo,
  RelierData,
} from './base-relier';

export enum OAuthPrompt {
  CONSENT = 'consent',
  NONE = 'none',
  LOGIN = 'login',
}

/**
 * Interface for accessing oauth client info state
 *
 * note - This was ported from CLIENT_INFO_SCHEMA in content-server
 */
export interface OAuthClientInfoData {
  clientId: string | undefined;
  imageUri: string | undefined;
  name: string;
  redirectUri: string | undefined;
  trusted: boolean | undefined;
}

/**
 * Interface for access to sign in / sign up state
 * ref: https://mozilla.github.io/ecosystem-platform/api#tag/OAuth-Server-API-Overview
 *
 * note - This was ported from SIGNIN_SIGNUP_QUERY_PARAM_SCHEMA in content server
 */
export interface OAuthSignUpSignInData {
  accessType: string | undefined;
  acrValues: string | undefined;
  action: string | undefined;
  clientId: string | undefined;
  codeChallenge: string | undefined;
  codeChallengeMethod: string | undefined;
  keysJwk: string | undefined;
  idTokenHint: string | undefined;
  loginHint: string | undefined;
  maxAge: number | undefined;
  prompt: string | undefined;
  redirectUrl: string | undefined;
  redirectTo: string | undefined;
  returnOnError: boolean | undefined;
  scope: string | undefined;
  state: string | undefined;
}

/**
 * Interface for accessing oauth verification info state
 *
 * note - This was ported from VERIFICATION_INFO_SCHEMA in content server
 */
export interface OAuthVerificationInfoData {
  accessType: string | undefined;
  acrValues: string | undefined;
  action: string | undefined;
  clientId: string | undefined;
  codeChallenge: string | undefined;
  codeChallengeMethod: string | undefined;
  prompt: string | undefined;
  redirectUri: string | undefined;
  scope: string | undefined;
  service: string | undefined;
  state: string | undefined;
}

/**
 * A convenience interface for easy mocking / testing. Use this type in components.
 */
export interface OAuthRelierData
  extends OAuthVerificationInfoData,
    OAuthSignUpSignInData,
    OAuthClientInfoData,
    RelierData {}

export type OAuthRelierOptions = {
  scopedKeysEnabled: boolean;
  scopedKeysValidation: Record<string, any>;
  isPromptNoneEnabled: boolean;
  isPromptNoneEnabledClientIds: Array<string>;
};

/**
 * State held in local/session storage between requests
 */
export type OAuthState = {
  clientId: string;
  scope: string;
  state: string;
};

export function isOAuthRelier(
  relier: Relier | OAuthRelier
): relier is OAuthRelier {
  return (relier as OAuthRelier).restoreOAuthState !== undefined;
}

/**
 * Default implementation of the OAuth Relier
 */
export class OAuthRelier extends BaseRelier implements OAuthRelierData, Relier {
  get name() {
    return 'oauth';
  }

  @bind([V.isString], T.snakeCase)
  clientId: string | undefined;

  @bind([V.isString])
  imageUri: string | undefined;

  @bind([V.isBoolean])
  trusted: boolean | undefined;

  @bind([V.isAccessType], T.snakeCase)
  accessType: string | undefined;

  @bind([V.isString])
  acrValues: string | undefined;

  @bind([V.isAction])
  action: string | undefined;

  @bind([V.isCodeChallenge], T.snakeCase)
  codeChallenge: string | undefined;

  @bind([V.isCodeChallengeMethod])
  codeChallengeMethod: string | undefined;

  @bind([V.isString], T.snakeCase)
  keysJwk: string | undefined;

  @bind([V.isString], T.snakeCase)
  idTokenHint: string | undefined;

  @bind([V.isGreaterThanZero], T.snakeCase)
  maxAge: number | undefined;

  @bind([V.isString])
  prompt: string | undefined;

  @bind([V.isUrl])
  redirectTo: string | undefined;

  @bind([V.isUrl], T.snakeCase)
  redirectUrl: string | undefined;

  @bind([V.isString], T.snakeCase)
  redirectUri: string | undefined;

  @bind([V.isString], T.snakeCase)
  returnOnError: boolean | undefined;

  @bind([V.isString])
  scope: string | undefined;

  @bind([V.isString])
  state: string | undefined;

  @bind([V.isString])
  loginHint: string | undefined;

  constructor(
    protected readonly modelData: ModelDataStore,
    protected readonly storageData: ModelDataStore,
    public readonly opts: OAuthRelierOptions
  ) {
    super(modelData);
  }

  getRedirectUri() {
    return this.redirectUri;
  }

  getService() {
    return this.service || this.clientId;
  }

  async getPermissions() {
    // Ported from content server, search for _normalizeScopesAndPermissions
    let permissions = Array.from(scopeStrToArray(this.scope || ''));
    if (await this.isTrusted()) {
      // We have to normalize `profile` into is expanded sub-scopes
      // in order to show the consent screen.
      if (this.wantsConsent()) {
        permissions = replaceItemInArray(
          permissions,
          Constants.OAUTH_TRUSTED_PROFILE_SCOPE,
          Constants.OAUTH_TRUSTED_PROFILE_SCOPE_EXPANSION
        );
      }
    } else {
      permissions = sanitizeUntrustedPermissions(permissions);
    }

    if (!permissions.length) {
      console.trace('!!!!!!!!');
      throw new OAuthError(ERRORS.INVALID_PARAMETER.errno, { params: 'scope' });
    }

    return permissions;
  }

  async getNormalizedScope() {
    const permissions = await this.getPermissions();
    return permissions.join(' ');
  }

  restoreOAuthState() {
    const oauth = this.storageData.get('oauth') as any;

    if (typeof oauth === 'object') {
      if (typeof oauth.client_id === 'string') {
        this.clientId = oauth.client_id;
      }
      if (typeof oauth.scope === 'string') {
        this.scope = oauth.scope;
      }
      if (typeof oauth.state === 'string') {
        this.state = oauth.state;
      }
    }
  }

  saveOAuthState() {
    this.storageData.set('oauth', {
      client_id: this.clientId,
      scope: this.scope,
      state: this.state,
    });
    this.storageData.persist();
  }

  async getServiceName() {
    const permissions = await this.getPermissions();
    if (permissions.includes(Constants.OAUTH_OLDSYNC_SCOPE)) {
      return Constants.RELIER_SYNC_SERVICE_NAME;
    }

    // If the clientId and the service are the same, prefer the clientInfo
    if (this.service && this.clientId === this.service) {
      const clientInfo = await this.clientInfo;
      if (clientInfo?.serviceName) {
        return clientInfo.serviceName;
      }
    }

    return await super.getServiceName();
  }

  async getClientInfo(): Promise<RelierClientInfo | undefined> {
    if (this.clientInfo) {
      const info = await this.clientInfo;
      return info;
    }
    return undefined;
  }

  isOAuth() {
    return true;
  }

  async isSync() {
    if (this.clientInfo == null) {
      return false;
    }

    const clientInfo = await this.clientInfo;
    return clientInfo.serviceName === Constants.RELIER_SYNC_SERVICE_NAME;
  }

  async isTrusted() {
    return (await this.clientInfo)?.trusted === true;
  }

  wantsConsent() {
    return this.prompt === OAuthPrompt.CONSENT;
  }

  wantsLogin() {
    return this.prompt === OAuthPrompt.LOGIN || this.maxAge === 0;
  }

  wantsTwoStepAuthentication() {
    const acrValues = this.acrValues;
    if (!acrValues) {
      return false;
    }
    const tokens = acrValues.split(' ');
    return tokens.includes(Constants.TWO_STEP_AUTHENTICATION_ACR);
  }

  wantsKeys(): boolean {
    if (!this.opts.scopedKeysEnabled) {
      return false;
    }
    if (this.keysJwk == null) {
      return false;
    }
    if (!this.scope) {
      return false;
    }

    const validation = this.opts.scopedKeysValidation;
    const individualScopes = scopeStrToArray(this.scope || '');

    let wantsScopeThatHasKeys = false;
    individualScopes.forEach((scope) => {
      // eslint-disable-next-line no-prototype-builtins
      if (validation.hasOwnProperty(scope)) {
        if (validation[scope].redirectUris.includes(this.redirectUri)) {
          wantsScopeThatHasKeys = true;
        } else {
          // Requesting keys, but trying to deliver them to an unexpected uri? Nope.
          throw new Error('Invalid redirect parameter');
        }
      }
    });

    return wantsScopeThatHasKeys;
  }

  protected isPromptNoneEnabledForClient() {
    return (
      this.clientId != null &&
      this.opts.isPromptNoneEnabledClientIds.includes(this.clientId)
    );
  }

  async validatePromptNoneRequest(account: RelierAccount): Promise<void> {
    const requestedEmail = this.email;

    if (!this.opts.isPromptNoneEnabled) {
      throw new OAuthError('PROMPT_NONE_NOT_ENABLED');
    }

    // If the RP uses email, check they are allowed to use prompt=none.
    // This check is not necessary if the RP uses id_token_hint.
    // See the discussion issue: https://github.com/mozilla/fxa/issues/4963
    if (requestedEmail && !this.isPromptNoneEnabledForClient()) {
      throw new OAuthError('PROMPT_NONE_NOT_ENABLED_FOR_CLIENT');
    }

    if (this.wantsKeys()) {
      throw new OAuthError('PROMPT_NONE_WITH_KEYS');
    }

    if (account.isDefault() || !account.sessionToken) {
      throw new OAuthError('PROMPT_NONE_NOT_SIGNED_IN');
    }

    // If `id_token_hint` is present, ignore `login_hint` / `email`.
    if (this.idTokenHint) {
      let claims: { sub: string };
      try {
        claims = await account.verifyIdToken(
          this.idTokenHint,
          this.clientId || '',
          Constants.ID_TOKEN_HINT_GRACE_PERIOD
        );
      } catch (err) {
        throw new OAuthError('PROMPT_NONE_INVALID_ID_TOKEN_HINT');
      }

      if (claims.sub !== account.uid) {
        throw new OAuthError('PROMPT_NONE_DIFFERENT_USER_SIGNED_IN');
      }
    } else {
      if (!requestedEmail) {
        // yeah yeah, it's a bit strange to look at `email`
        // and then say `login_hint` is missing. `login_hint`
        // is the OIDC spec compliant name, we supported `email` first
        // and don't want to break backwards compatibility.
        // `login_hint` is copied to the `email` field if no `email`
        // is specified. If neither is available, throw an error
        // about `login_hint` since it's spec compliant.
        throw new OAuthError('login_hint');
      }

      if (requestedEmail !== account.email) {
        throw new OAuthError('PROMPT_NONE_DIFFERENT_USER_SIGNED_IN');
      }
    }
  }
}

function scopeStrToArray(scopes: string) {
  const arrScopes = scopes
    .trim()
    .split(/\s+|\++/g)
    .filter((x) => x.length > 0);
  return new Set(arrScopes);
}

export function replaceItemInArray(
  array: Array<string>,
  itemToReplace: string,
  replaceWith: Array<string>
) {
  return Array.from(
    new Set(
      array.map((item) => (item === itemToReplace ? replaceWith : item)).flat()
    )
  );
}

function sanitizeUntrustedPermissions(permissions: Array<string>) {
  return permissions.filter((x) =>
    Constants.OAUTH_UNTRUSTED_ALLOWED_PERMISSIONS.includes(x)
  );
}
