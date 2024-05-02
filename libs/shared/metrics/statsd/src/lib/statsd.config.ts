/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class StatsDConfig {
  @IsNumber()
  @IsOptional()
  sampleRate?: number;

  @IsNumber()
  @IsOptional()
  maxBufferSize?: number;

  @IsString()
  @IsOptional()
  host?: string;

  @IsNumber()
  @IsOptional()
  port?: number;

  @IsString()
  @IsOptional()
  prefix?: string;
}
