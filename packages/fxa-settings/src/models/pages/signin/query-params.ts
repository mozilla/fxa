/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import {
  bind,
  ModelDataProvider,
  KeyTransforms as T,
} from '../../../lib/model-data';
import { IsFxaRedirectToUrl } from '../../../lib/validation';

/**
 *  Note: class-validator logic was ported from Vat rules in content-server.
 */
export class SigninQueryParams extends ModelDataProvider {
  @IsOptional()
  @IsEmail()
  @bind()
  email: string = '';

  @IsOptional()
  @IsBoolean()
  @bind()
  hasLinkedAccount: boolean | undefined = undefined;

  @IsOptional()
  @IsBoolean()
  @bind()
  hasPassword: boolean | undefined = undefined;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9-]*$/)
  @MinLength(1)
  @MaxLength(16)
  @bind()
  service: string | undefined = undefined;

  @IsOptional()
  @Validate(IsFxaRedirectToUrl, {})
  @bind(T.snakeCase)
  redirectTo: string | undefined = undefined;

  @IsOptional()
  @IsIn(['googleLogin', 'appleLogin'])
  @bind(T.snakeCase)
  deeplink!: string;
}
