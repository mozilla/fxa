/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsEmail, IsIn, IsOptional, Validate } from 'class-validator';
import {
  bind,
  KeyTransforms,
  ModelDataProvider,
} from '../../../lib/model-data';
import { IsEmailOrEmpty } from '../../../lib/validation';

export class IndexQueryParams extends ModelDataProvider {
  @IsOptional()
  @IsEmail()
  @bind()
  email: string | undefined;

  @IsOptional()
  @Validate(IsEmailOrEmpty, {})
  @bind(KeyTransforms.snakeCase)
  loginHint: string | undefined;

  @IsOptional()
  @IsIn(['googleLogin', 'appleLogin'])
  @bind()
  deeplink: string | undefined;
}
