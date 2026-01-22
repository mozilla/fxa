/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Provider } from '@nestjs/common';
import { IsBoolean, IsString } from 'class-validator';

export class ChurnInterventionConfig {
  @IsString()
  public readonly collectionName!: string;

  @IsBoolean()
  public readonly enabled: boolean = false;
}

export const MockChurnInterventionConfig = {
  collectionName: faker.string.uuid(),
  enabled: true,
} satisfies ChurnInterventionConfig;

export const MockChurnInterventionConfigProvider = {
  provide: ChurnInterventionConfig,
  useValue: MockChurnInterventionConfig,
} satisfies Provider<ChurnInterventionConfig>;
