/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsBoolean, IsEmail, IsOptional } from 'class-validator';
import { bind, ModelDataProvider } from '../../../lib/model-data';

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
}
