/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Provider } from '@nestjs/common';
import { IsBoolean, IsNumber, IsUrl } from 'class-validator';

export class NimbusClientConfig {
  @IsUrl({ require_tld: false })
  public readonly apiUrl!: string;

  @IsBoolean()
  public readonly previewEnabled!: boolean;

  @IsNumber()
  public readonly timeoutMs!: number;
}

export const MockNimbusClientConfig = {
  apiUrl: faker.internet.url(),
  previewEnabled: faker.datatype.boolean(),
  timeoutMs: faker.number.int({ min: 100, max: 2000 }),
} satisfies NimbusClientConfig;

export const MockNimbusClientConfigProvider = {
  provide: NimbusClientConfig,
  useValue: MockNimbusClientConfig,
} satisfies Provider<NimbusClientConfig>;
