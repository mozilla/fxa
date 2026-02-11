/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class StatsDConfig {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  sampleRate?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  maxBufferSize?: number;

  @IsString()
  @IsOptional()
  host?: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  port?: number;

  @IsString()
  @IsOptional()
  prefix?: string;
}
