/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsObject, IsString } from 'class-validator';

export class RequestArgs {
  @IsString()
  ipAddress!: string;

  @IsString()
  deviceType!: string;

  @IsString()
  userAgent!: string;

  @IsString()
  experimentationId!: string;

  @IsObject()
  params!: Record<string, string>;

  @IsObject()
  searchParams!: Record<string, string>;
}
