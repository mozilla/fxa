/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Provider } from '@nestjs/common';
import { IsBoolean, IsString } from 'class-validator';

export class NimbusManagerConfig {
  @IsBoolean()
  public readonly enabled!: boolean;

  @IsString()
  public readonly namespace!: string;
}

export const MockNimbusManagerConfig = {
  enabled: faker.datatype.boolean(),
  namespace: faker.string.uuid(),
} satisfies NimbusManagerConfig;

export const MockNimbusManagerConfigProvider = {
  provide: NimbusManagerConfig,
  useValue: MockNimbusManagerConfig,
} satisfies Provider<NimbusManagerConfig>;
