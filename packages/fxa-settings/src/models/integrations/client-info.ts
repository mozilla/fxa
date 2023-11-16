/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  IsOptional,
  IsString,
  IsBoolean,
  IsHexadecimal,
} from 'class-validator';
import {
  bind,
  KeyTransforms as T,
  ModelDataProvider,
} from '../../lib/model-data';

export class ClientInfo extends ModelDataProvider {
  @IsOptional()
  @IsHexadecimal()
  @bind('id')
  clientId: string | undefined;

  // TODO - Validation - Needs @IsEncodedUrl()
  @IsOptional()
  @IsString()
  @bind(T.snakeCase)
  imageUri: string | undefined;

  @IsOptional()
  @IsString()
  @bind('name')
  serviceName: string | undefined;

  // TODO - Validation - Needs @IsEncodedUrl()
  @IsOptional()
  @IsString()
  @bind(T.snakeCase)
  redirectUri: string | undefined;

  @IsOptional()
  @IsBoolean()
  @bind()
  trusted: boolean | undefined;
}
