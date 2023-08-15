/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  IsEmail,
  IsHexadecimal,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { bind, ModelDataProvider } from '../../../lib/model-data';

export class CompleteResetPasswordLink extends ModelDataProvider {
  @IsOptional()
  @IsEmail()
  @bind()
  email: string = '';

  @IsOptional()
  @IsEmail()
  @bind()
  emailToHashWith: string | undefined = '';

  @IsString()
  @IsNotEmpty()
  @bind()
  code: string = '';

  @IsHexadecimal()
  @bind()
  token: string = '';

  @IsHexadecimal()
  @bind()
  uid: string = '';
}
