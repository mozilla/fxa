/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsEmail, IsHexadecimal, IsOptional, Length } from 'class-validator';
import { ModelDataProvider, bind } from '../../lib/model-data';

export * from './verification-info';

export type VerificationInfoLinkStatus = 'expired' | 'damaged' | 'valid';

export class VerificationInfo extends ModelDataProvider {
  @IsEmail()
  @bind()
  email: string = '';

  @IsOptional()
  @IsEmail()
  @bind()
  emailToHashWith: string | undefined = '';

  @IsHexadecimal()
  @Length(32)
  @bind()
  code: string = '';

  @IsHexadecimal()
  @bind()
  token: string = '';

  @IsHexadecimal()
  @Length(32)
  @bind()
  uid: string = '';
}
