/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Matches,
  IsBoolean,
  IsEmail,
  IsHexadecimal,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  IsNumber,
  Min,
  Validate,
} from 'class-validator';
import {
  bind,
  ModelDataProvider,
  KeyTransforms as T,
} from '../../../lib/model-data';
import { IsFxaRedirectUri } from '../../../lib/validation';

/**
 *  Note: class-validator logic was ported from Vat rules in content-server.
 */
export class OAuthQueryParams extends ModelDataProvider {
  @IsOptional()
  @IsIn(['online', 'offline'])
  @bind(T.snakeCase)
  accessType!: string;

  @IsOptional()
  @IsString()
  @bind(T.snakeCase)
  acrValues!: string;

  @IsOptional()
  @IsIn(['signin', 'signup', 'email', 'force_auth', 'pairing'])
  @bind(T.snakeCase)
  action!: string;

  // REQUIRED!
  @IsString()
  @IsHexadecimal()
  @bind(T.snakeCase)
  clientId!: string;

  @IsOptional()
  @IsString()
  @MinLength(43)
  @MaxLength(128)
  @bind(T.snakeCase)
  codeChallenge!: string;

  @IsOptional()
  @IsString()
  @IsIn(['S256'])
  @bind(T.snakeCase)
  code_challenge_method!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9-_]+$/) // specified by auth server
  @bind(T.snakeCase)
  keysJwk!: string;

  @IsOptional()
  @IsString()
  @bind(T.snakeCase)
  idTokenHint!: string;

  @IsOptional()
  @IsEmail()
  @bind(T.snakeCase)
  loginHint!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @bind(T.snakeCase)
  maxAge!: number;

  @IsOptional()
  @IsString()
  @IsIn(['consent', 'none', 'login'])
  @bind(T.snakeCase)
  prompt!: string;

  @IsOptional()
  @Validate(IsFxaRedirectUri, {})
  @bind(T.snakeCase)
  redirectUri!: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @bind()
  redirectTo!: string;

  @IsOptional()
  @IsBoolean()
  @bind(T.snakeCase)
  returnOnError!: boolean;

  // REQUIRED!
  @IsString()
  @MinLength(1)
  @bind()
  scope!: string;
}

/**
 * For sync clients the state must be provided!
 */
export class OAuthNativeSyncQueryParameters extends OAuthQueryParams {
  // REQUIRED!
  @IsString()
  @MinLength(1)
  @bind()
  state!: string;
}
