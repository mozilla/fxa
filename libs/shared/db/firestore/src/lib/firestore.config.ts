/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';

class FirestoreCredentialsConfig {
  @IsString()
  clientEmail!: string;

  @IsString()
  privateKey!: string;
}

export class FirestoreConfig {
  @Type(() => FirestoreCredentialsConfig)
  @ValidateNested()
  @IsOptional()
  credentials?: FirestoreCredentialsConfig;

  @IsString()
  @IsOptional()
  keyFilename?: string;

  @IsString()
  @IsOptional()
  projectId?: string;
}
