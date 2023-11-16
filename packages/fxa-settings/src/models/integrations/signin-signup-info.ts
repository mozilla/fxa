/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  IsBase64,
  IsBoolean,
  IsEmail,
  IsHexadecimal,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import {
  bind,
  KeyTransforms as T,
  ModelDataProvider,
} from '../../lib/model-data';

// Sign inflow
// params listed in:
// https://mozilla.github.io/ecosystem-platform/api#tag/OAuth-Server-API-Overview

export class SignInSignUpInfo extends ModelDataProvider {
  @IsOptional()
  @IsIn(['offline', 'online'])
  @bind(T.snakeCase)
  accessType: string | undefined;

  @IsString()
  @IsOptional()
  @bind(T.snakeCase)
  acrValues: string | undefined;

  // TODO - Validation - Double check actions
  @IsOptional()
  @IsIn(['signin', 'signup', 'email', 'force_auth', 'pairing'])
  @bind(T.snakeCase)
  action: string | undefined;

  @IsOptional()
  @IsHexadecimal()
  @bind(T.snakeCase)
  clientId: string | undefined;

  @IsOptional()
  @IsString()
  @bind(T.snakeCase)
  codeChallenge: string | undefined;

  @IsOptional()
  @IsIn(['S256'])
  @bind(T.snakeCase)
  codeChallengeMethod: string | undefined;

  @IsOptional()
  @IsBase64()
  @bind(T.snakeCase)
  keysJwk: string | undefined;

  @IsOptional()
  @IsString()
  @bind(T.snakeCase)
  idTokenHint: string | undefined;

  @IsOptional()
  @IsEmail()
  @bind(T.snakeCase)
  loginHint: string | undefined;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @bind(T.snakeCase)
  maxAge: number | undefined;

  @IsOptional()
  @IsIn(['consent', 'none', 'login'])
  @bind()
  prompt: string | undefined;

  // TODO - Validation - Needs @IsEncodedUrl()
  @IsOptional()
  @IsString()
  @bind(T.snakeCase)
  redirectUri: string | undefined;

  // TODO - Validation - Needs @IsEncodedUrl()
  @IsOptional()
  @IsString()
  @bind(T.snakeCase)
  redirectTo: string | undefined;

  @IsOptional()
  @IsBoolean()
  @bind(T.snakeCase)
  returnOnError: boolean | undefined;

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
  @bind()
  email: string | undefined;
}
