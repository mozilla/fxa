/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { IsInt, IsOptional, IsString } from 'class-validator';

export class StatsDConfig {
  @IsInt()
  @IsOptional()
  sampleRate?: number;

  @IsInt()
  @IsOptional()
  maxBufferSize?: number;

  @IsString()
  @IsOptional()
  host?: string;

  @IsInt()
  @IsOptional()
  port?: number;

  @IsString()
  @IsOptional()
  prefix?: string;
}
