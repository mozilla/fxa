/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class FreeAccessProgramConfig {
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  public readonly enabled!: boolean;
}

export const MockFreeAccessProgramConfig = {
  enabled: true,
} satisfies FreeAccessProgramConfig;

export const MockFreeAccessProgramConfigProvider = {
  provide: FreeAccessProgramConfig,
  useValue: MockFreeAccessProgramConfig,
} satisfies Provider<FreeAccessProgramConfig>;
