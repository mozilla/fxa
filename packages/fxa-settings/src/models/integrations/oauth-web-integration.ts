/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  BaseIntegration,
  IntegrationType,
  RelierAccount,
  RelierClientInfo,
} from './base-integration';
import { ModelDataStore, bind, KeyTransforms as T } from '../../lib/model-data';
import { Constants } from '../../lib/constants';
import { OAUTH_ERRORS, OAuthError } from '../../lib/oauth';
import { IntegrationFlags } from '../../lib/integrations';
import { BaseIntegrationData } from './web-integration';
import {
  IsBoolean,
  IsEmail,
  IsHexadecimal,
  IsIn,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AuthUiError } from '../../lib/auth-errors/auth-errors';

export enum OAuthPrompt {
  CONSENT = 'consent',
  NONE = 'none',
  LOGIN = 'login',
}

type OAuthIntegrationTypes =
  | IntegrationType.OAuthWeb
  | IntegrationType.OAuthNative
  | IntegrationType.PairingSupplicant
  | IntegrationType.PairingAuthority;

export type SearchParam = IntegrationFlags['searchParam'];

// TODO: probably move this somewhere else
export class OAuthIntegrationData extends BaseIntegrationData {
  // TODO - Validation - Can we get a set of known client ids from config or api call? See https://github.com/mozilla/fxa/pull/15677#discussion_r1291534277
  @IsOptional()
  @IsHexadecimal()
  @bind(T.snakeCase)
  clientId: string | undefined;

  @IsOptional()
  @IsString()
  @bind()
  imageUri: string | undefined;

  @IsBoolean()
  @IsOptional()
  @bind()
  trusted: boolean | undefined;

  @IsOptional()
  @IsIn(['offline', 'online'])
  @bind(T.snakeCase)
  accessType: string | undefined;

  @IsOptional()
  @IsString()
  @bind(T.snakeCase)
  acrValues: string | undefined;

  // TODO - Validation - Double check actions
  @IsOptional()
  @IsIn(['signin', 'signup', 'email', 'force_auth', 'pairing'])
  @bind()
  action: string | undefined;

  @IsOptional()
  @IsString()
  @MinLength(43)
  @MaxLength(128)
  @bind(T.snakeCase)
  codeChallenge: string | undefined;

  @IsOptional()
  @IsIn(['S256'])
  @bind(T.snakeCase)
  codeChallengeMethod: string | undefined;

  // TODO - Validation - Should this be base64?
  @IsOptional()
  @IsString()
  @bind(T.snakeCase)
  keysJwk: string | undefined;

  @IsOptional()
  @IsString()
  @bind(T.snakeCase)
  idTokenHint: string | undefined;

  @IsOptional()
  @IsInt()
  @bind(T.snakeCase)
  maxAge: number | undefined;

  @IsOptional()
  @IsString()
  @bind()
  permissions: string | undefined;

  @IsOptional()
  @IsString()
  @bind()
  prompt: string | undefined;

  // TODO - Validation - This should be a URL, but it is encoded and must be decoded in order to validate.
  @IsOptional()
  @IsString()
  @bind()
  declare redirectTo: string | undefined;

  // TODO - Validation - This should be a URL, but it is encoded and must be decoded in order to validate.
  @IsOptional()
  @IsString()
  @bind(T.snakeCase)
  redirectUrl: string | undefined;

  // TODO - Validation - Needs custom validation, see IsRedirectUriValid in content server.
  // We fall back to clientInfo.redirectUri if this is not provided so only validate if it's present
  @IsString()
  @IsOptional()
  @bind(T.snakeCase)
  redirectUri: string | undefined;

  @IsBoolean()
  @IsOptional()
  @bind(T.snakeCase)
  returnOnError: boolean | undefined;

  // TODO - Validation - Should scope be required?
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @bind()
  scope: string | undefined;

  @IsOptional()
  @IsString()
  @bind()
  state: string | undefined;

  @IsOptional()
  @IsEmail()
  @bind(T.snakeCase)
  loginHint: string | undefined;
}

export type OAuthIntegrationOptions = {
  scopedKeysEnabled: boolean;
  scopedKeysValidation: Record<string, any>;
  isPromptNoneEnabled: boolean;
  isPromptNoneEnabledClientIds: Array<string>;
};

/**
 * This integration is used for relying party OAuth implementations. FxA should
 * not send or receive web channel messages if this integration is created.
 *
 * This is a base class for OAuthNativeIntegration.
 */
export class OAuthWebIntegration extends BaseIntegration {
  constructor(
    data: ModelDataStore,
    protected readonly storageData: ModelDataStore,
    public readonly opts: OAuthIntegrationOptions,
    type: OAuthIntegrationTypes = IntegrationType.OAuthWeb
  ) {
    super(type, new OAuthIntegrationData(data));
    this.setFeatures({
      handleSignedInNotification: false,
      reuseExistingSession: true,
    });
  }

  getRedirectUri() {
    // clientInfo.redirectUri holds the validated redirect URI. We check that this
    // value exists and throw an error before a call to this function can be made.
    return this.clientInfo?.redirectUri || '';
  }

  getRedirectToRPUrl(
    extraParams: Record<string, number | string | undefined> = {}
  ) {
    const redirectUrl = new URL(this.getRedirectUri());
    const params = {
      ...extraParams,

      action: this.data.action,
      state: this.data.state,

      flowId: this.data.flowId,
      flowBeginTime: this.data.flowBeginTime,
      deviceId: this.data.deviceId,

      utmCampaign: this.data.utmCampaign,
      utmContent: this.data.utmContent,
      utmMedium: this.data.utmMedium,
      utmSource: this.data.utmSource,
      utmTerm: this.data.utmTerm,
    };

    const redirectParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined)
    );

    redirectUrl.search = new URLSearchParams(redirectParams).toString();
    return redirectUrl.toString();
  }

  getRedirectWithErrorUrl(err: AuthUiError) {
    return this.getRedirectToRPUrl({ error: err.errno });
  }

  getService() {
    return this.data.service;
  }

  getClientId(): string {
    return this.data.clientId;
  }

  restoreOAuthState() {
    const oauth = this.storageData.get('oauth') as any;

    if (typeof oauth === 'object') {
      if (typeof oauth.client_id === 'string') {
        this.data.clientId = oauth.client_id;
      }
      if (typeof oauth.scope === 'string') {
        this.data.scope = oauth.scope;
      }
      if (typeof oauth.state === 'string') {
        this.data.state = oauth.state;
      }
    }
  }

  saveOAuthState() {
    this.storageData.set(
      'oauth',
      JSON.stringify({
        client_id: this.data.clientId,
        scope: this.data.scope,
        state: this.data.state,
      })
    );
    this.storageData.persist();
  }

  getServiceName() {
    const permissions = this.getPermissions();
    // As a special case for UX purposes, any client requesting access to
    // the user's sync data must have a display name of "Firefox Sync".
    // This is also used to check against `integration.isSync()`.
    if (
      permissions.some((permission) =>
        permission.includes(Constants.OAUTH_OLDSYNC_SCOPE)
      )
    ) {
      return Constants.RELIER_SYNC_SERVICE_NAME;
    }

    // If the clientId and the service are the same, prefer the clientInfo
    if (this.data.service && this.data.clientId === this.data.service) {
      if (this.clientInfo?.serviceName) {
        return this.clientInfo.serviceName;
      }
    }

    return super.getServiceName();
  }

  getClientInfo(): RelierClientInfo | undefined {
    return this.clientInfo;
  }

  isTrusted() {
    return this.clientInfo?.trusted === true;
  }

  returnOnError() {
    return this.data.returnOnError !== false;
  }

  wantsConsent() {
    return this.data.prompt === OAuthPrompt.CONSENT;
  }

  wantsLogin() {
    return this.data.prompt === OAuthPrompt.LOGIN || this.data.maxAge === 0;
  }

  wantsPromptNone() {
    return this.data.prompt === OAuthPrompt.NONE;
  }

  wantsTwoStepAuthentication(): boolean {
    const acrValues = this.data.acrValues;
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
    if (this.data.keysJwk == null) {
      return false;
    }
    if (!this.data.scope) {
      return false;
    }

    const validation = this.opts.scopedKeysValidation;
    const individualScopes = scopeStrToArray(this.data.scope || '');

    let wantsScopeThatHasKeys = false;
    individualScopes.forEach((scope) => {
      // eslint-disable-next-line no-prototype-builtins
      if (validation.hasOwnProperty(scope)) {
        if (
          validation[scope].redirectUris.includes(this.clientInfo?.redirectUri)
        ) {
          wantsScopeThatHasKeys = true;
        } else {
          // Requesting keys, but trying to deliver them to an unexpected uri? Nope.
          throw new Error('Invalid redirect parameter');
        }
      }
    });

    return wantsScopeThatHasKeys;
  }

  getPermissions() {
    // TODO: Not 100% sure about this...
    if (!this.data.scope) {
      return [];
    }

    // Ported from content server, search for _normalizeScopesAndPermissions
    let permissions = Array.from(scopeStrToArray(this.data.scope || ''));
    if (this.isTrusted()) {
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
      throw new OAuthError(OAUTH_ERRORS.INVALID_PARAMETER.errno, {
        params: 'scope',
      });
    }

    return permissions;
  }

  getNormalizedScope() {
    const permissions = this.getPermissions();
    return permissions.join(' ');
  }

  protected isPromptNoneEnabledForClient() {
    return (
      this.data.clientId &&
      this.opts.isPromptNoneEnabledClientIds.includes(this.data.clientId)
    );
  }

  async validatePromptNoneRequest(account: RelierAccount): Promise<void> {
    const requestedEmail = this.data.email || this.data.loginHint;

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
    if (this.data.idTokenHint) {
      let claims: { sub: string };
      try {
        claims = await account.verifyIdToken(
          this.data.idTokenHint,
          this.data.clientId || '',
          Constants.ID_TOKEN_HINT_GRACE_PERIOD
        );
      } catch (err) {
        throw new OAuthError('PROMPT_NONE_INVALID_ID_TOKEN_HINT');
      }

      if (claims.sub !== account.uid) {
        throw new OAuthError('PROMPT_NONE_DIFFERENT_USER_SIGNED_IN');
      }
    }

    if (requestedEmail && requestedEmail !== account.email) {
      throw new OAuthError('PROMPT_NONE_DIFFERENT_USER_SIGNED_IN');
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

export function isOAuthWebIntegration(integration: {
  type: IntegrationType;
}): integration is OAuthWebIntegration {
  return (integration as OAuthWebIntegration).type === IntegrationType.OAuthWeb;
}
