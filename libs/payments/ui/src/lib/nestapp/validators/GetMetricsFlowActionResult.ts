/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetMetricsFlowActionResult {
  @IsString()
  flowId!: string;

  @IsString()
  @IsNumber()
  flowBeginTime!: string | number;

  @IsOptional()
  @IsString()
  deviceId?: string;
}
