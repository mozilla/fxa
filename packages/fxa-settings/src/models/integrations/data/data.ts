/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  IsBoolean,
  IsEmail,
  IsHexadecimal,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import {
  bind,
  KeyTransforms as T,
  ModelDataProvider,
} from '../../../lib/model-data';
import { IsFxaRedirectToUrl, IsFxaRedirectUri } from '../../../lib/validation';

/**
 * Base integration class. Fields in this class represents data commonly accessed across many pages and is useful for various flows.
 */
export class IntegrationData extends ModelDataProvider {
  // TODO: Should this only exist on OAuthIntegrationData
  @IsOptional()
  @IsString()
  @bind()
  public clientId: string | undefined;

  @IsOptional()
  @IsString()
  @bind()
  public service: string | undefined;

  // TODO - Validation - This should be a URL, but it is encoded and must be decoded in order to validate.
  @IsOptional()
  @Validate(IsFxaRedirectToUrl, {})
  @bind(T.snakeCase)
  redirectTo: string | undefined;

  // TODO: Double check context. This might be sync data!
  @IsOptional()
  @IsString()
  @bind()
  context: string | undefined;

  @IsOptional()
  @IsString()
  @bind()
  email: string | undefined;

  @IsOptional()
  @IsString()
  @bind()
  loginHint: string | undefined;

  @IsOptional()
  @IsString()
  @bind()
  action: string | undefined;

  @IsOptional()
  @IsString()
  @bind()
  entrypoint: string | undefined;

  @IsOptional()
  @IsString()
  @bind(T.snakeCase)
  entrypointVariation: string | undefined;

  @IsOptional()
  @IsString()
  @bind(T.snakeCase)
  entrypointExperiment: string | undefined;

  @IsOptional()
  @IsString()
  @bind(T.snakeCase)
  utmCampaign: string | undefined;

  @IsOptional()
  @IsString()
  @bind(T.snakeCase)
  utmContent: string | undefined;

  @IsOptional()
  @IsString()
  @bind(T.snakeCase)
  utmMedium: string | undefined;

  @IsOptional()
  @IsString()
  @bind(T.snakeCase)
  utmSource: string | undefined;

  @IsOptional()
  @IsString()
  @bind(T.snakeCase)
  utmTerm: string | undefined;

  @IsOptional()
  @IsString()
  @bind(T.snakeCase)
  flowId: string | undefined;

  @IsOptional()
  @IsString()
  @bind(T.snakeCase)
  flowBeginTime: string | undefined;
}

/**
 * Represents data specific to integrations that support syncing.
 */
export class SyncBasicIntegrationData extends IntegrationData {
  // TODO - Validation - Will @IsISO31661Alpha2() work?
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(7)
  @bind()
  country: string | undefined;

  @IsOptional()
  @Matches(/^[A-Za-z0-9-_]+$/)
  @Length(8)
  @bind()
  signinCode: string | undefined;

  // TODO - Validation - Double check actions
  @IsOptional()
  @IsIn(['signin', 'signup', 'email', 'force_auth', 'pairing'])
  @bind()
  action: string | undefined;

  @IsOptional()
  @IsString()
  @bind()
  syncPreference: string | undefined;

  @IsOptional()
  @IsString()
  @bind()
  multiService: boolean | undefined;

  @IsOptional()
  @IsString()
  @bind()
  tokenCode: string | undefined;
}

/**s
 * Represents data specific general 'web' integrations, which are typically login processes where a user
 * is trying to authenticating in oder to access their account settings page.
 */
export class WebIntegrationData extends IntegrationData {
  @IsOptional()
  // TODO:Validation: Should this be 'IsEmail'. Currently we are relying on query-param models to validate
  //        the value is actually an email.
  //
  @IsString()
  @bind()
  email: string | undefined;

  @IsOptional()
  @IsEmail()
  @bind()
  emailToHashWith: string | undefined;

  @IsOptional()
  @IsIn(['true', 'false', true, false])
  @bind(T.snakeCase)
  resetPasswordConfirm: boolean | undefined;

  @IsOptional()
  @IsString()
  @bind()
  setting: string | undefined;

  @IsOptional()
  @IsString()
  @bind()
  style: string | undefined;

  @IsOptional()
  @IsHexadecimal()
  @Length(32)
  @bind()
  uid: string | undefined;
}

/**
 * Represents data required for logging with OAuth. This is typical when a user directed to FxA from an relying party
 * and the relying party is attempting to FxA us to validate the user.
 */
export class OAuthIntegrationData extends WebIntegrationData {
  // TODO - Validation - Can we get a set of known client ids from config or api call?
  //        See https://github.com/mozilla/fxa/pull/15677#discussion_r1291534277
  @IsOptional()
  @IsHexadecimal()
  @bind(T.snakeCase)
  clientId!: string;

  @IsOptional()
  @IsString()
  @bind()
  imageUri: string | undefined;

  @IsOptional()
  @IsBoolean()
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

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9-_]+$/)
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
  @Validate(IsFxaRedirectToUrl, {})
  @bind(T.snakeCase)
  redirectUrl: string | undefined;

  // TODO - Validation - Needs custom validation, see IsRedirectUriValid in content server.
  // We fall back to clientInfo.redirectUri if this is not provided so only validate if it's present
  @IsOptional()
  @Validate(IsFxaRedirectUri)
  @bind(T.snakeCase)
  redirectUri: string | undefined;

  @IsOptional()
  @IsBoolean()
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
  state!: string;

  @IsOptional()
  @IsString()
  @bind(T.snakeCase)
  deviceId: string | undefined;
}

/**
 * Represents fields required to finalize a pairing flow.
 */
export class PairingAuthorityIntegrationData extends OAuthIntegrationData {
  // #IsRequired
  @Matches(/^[A-Za-z0-9-_]+$/)
  @IsNotEmpty()
  @bind(T.snakeCase)
  channelId: string = '';
}

/**
 * Represents fields required to finalize a paring flow.
 */
export class PairingSupplicantIntegrationData extends OAuthIntegrationData {
  // TODO - Validation - Should scope be required?
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @bind()
  scope: string | undefined = '';
}

/**
 * Represents fields required to validate a third party authorization.
 */
export class ThirdPartyAuthCallbackIntegrationData extends WebIntegrationData {
  // #IsRequired
  @IsString()
  @bind()
  state: string | undefined;

  @IsOptional()
  @IsString()
  @bind()
  code: string | undefined;

  @IsOptional()
  @IsString()
  @bind()
  provider: string | undefined;

  @IsOptional()
  @IsString()
  @bind()
  error: string | undefined;
}
