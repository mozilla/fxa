/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  IsHexadecimal,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  bind,
  KeyTransforms as T,
  ModelDataProvider,
} from '../../lib/model-data';

export class SupplicantInfo extends ModelDataProvider {
  @IsOptional()
  @IsIn(['offline', 'online'])
  @bind(T.snakeCase)
  accessType: string | undefined;

  @IsOptional()
  @IsHexadecimal()
  @bind(T.snakeCase)
  clientId: string | undefined;

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
  @IsNotEmpty()
  @bind()
  scope: string | undefined;

  @IsOptional()
  @IsString()
  @bind()
  state: string | undefined;
}
