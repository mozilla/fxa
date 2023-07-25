/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  BaseIntegration,
  IntegrationFeatures,
  IntegrationType,
  RelierAccount,
  RelierClientInfo,
} from './base-integration';
import {
  ModelDataStore,
  bind,
  KeyTransforms as T,
  ModelValidation as V,
} from '../../lib/model-data';
import { Constants } from '../../lib/constants';
import { ERRORS, OAuthError } from '../../lib/oauth';
import { IntegrationFlags } from '../../lib/integrations';
import { BaseIntegrationData } from './web-integration';

interface OAuthIntegrationFeatures extends IntegrationFeatures {
  webChannelSupport: boolean;
}

export enum OAuthPrompt {
  CONSENT = 'consent',
  NONE = 'none',
  LOGIN = 'login',
}

type OAuthIntegrationTypes =
  | IntegrationType.OAuth
  | IntegrationType.PairingSupplicant
  | IntegrationType.PairingAuthority;

export type SearchParam = IntegrationFlags['searchParam'];

export function isOAuthIntegration(integration: {
  type: IntegrationType;
}): integration is OAuthIntegration {
  return (integration as OAuthIntegration).type === IntegrationType.OAuth;
}

// TODO: probably move this somewhere else
export class OAuthIntegrationData extends BaseIntegrationData {
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
  permissions: string | undefined;

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
}

export type OAuthIntegrationOptions = {
  scopedKeysEnabled: boolean;
  scopedKeysValidation: Record<string, any>;
  isPromptNoneEnabled: boolean;
  isPromptNoneEnabledClientIds: Array<string>;
};

export class OAuthIntegration extends BaseIntegration<OAuthIntegrationFeatures> {
  constructor(
    data: ModelDataStore,
    protected readonly storageData: ModelDataStore,
    public readonly opts: OAuthIntegrationOptions,
    type: OAuthIntegrationTypes = IntegrationType.OAuth
  ) {
    super(type, new OAuthIntegrationData(data));
    this.setFeatures({
      handleSignedInNotification: false,
      reuseExistingSession: true,
      webChannelSupport:
        this.data.context === Constants.OAUTH_WEBCHANNEL_CONTEXT,
    });
  }

  getRedirectUri() {
    return this.data.redirectUri;
  }

  getService() {
    return this.data.service || this.data.clientId;
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
    this.storageData.set('oauth', {
      client_id: this.data.clientId,
      scope: this.data.scope,
      state: this.data.state,
    });
    this.storageData.persist();
  }

  async getServiceName() {
    const permissions = await this.getPermissions();
    if (permissions.includes(Constants.OAUTH_OLDSYNC_SCOPE)) {
      return Constants.RELIER_SYNC_SERVICE_NAME;
    }

    // If the clientId and the service are the same, prefer the clientInfo
    if (this.data.service && this.data.clientId === this.data.service) {
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
    return this.data.prompt === OAuthPrompt.CONSENT;
  }

  wantsLogin() {
    return this.data.prompt === OAuthPrompt.LOGIN || this.data.maxAge === 0;
  }

  wantsTwoStepAuthentication() {
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
        if (validation[scope].redirectUris.includes(this.data.redirectUri)) {
          wantsScopeThatHasKeys = true;
        } else {
          // Requesting keys, but trying to deliver them to an unexpected uri? Nope.
          throw new Error('Invalid redirect parameter');
        }
      }
    });

    return wantsScopeThatHasKeys;
  }

  async getPermissions() {
    // Ported from content server, search for _normalizeScopesAndPermissions
    let permissions = Array.from(scopeStrToArray(this.data.scope || ''));
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
      throw new OAuthError(ERRORS.INVALID_PARAMETER.errno, { params: 'scope' });
    }

    return permissions;
  }

  async getNormalizedScope() {
    const permissions = await this.getPermissions();
    return permissions.join(' ');
  }

  protected isPromptNoneEnabledForClient() {
    return (
      this.data.clientId != null &&
      this.data.opts.isPromptNoneEnabledClientIds.includes(this.data.lientId)
    );
  }

  async validatePromptNoneRequest(account: RelierAccount): Promise<void> {
    const requestedEmail = this.data.email;

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
