/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsEmail, IsOptional, IsString } from 'class-validator';

export class GoogleIapClientConfig {
  @IsEmail()
  @IsOptional()
  public readonly email?: string;

  @IsString()
  @IsOptional()
  public readonly keyFilename?: string;

  @IsString()
  @IsOptional()
  public readonly privateKey?: string;

  @IsString()
  public readonly collectionName!: string;
}
