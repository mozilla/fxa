/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Provider } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class NimbusManagerConfig {
  @IsBoolean()
  public readonly enabled!: boolean;

  @IsString()
  public readonly namespace!: string;

  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }
    const deletionNamespaces = value
      .split(',')
      .map((namespace) => namespace.trim())
      .filter(Boolean);
    return deletionNamespaces.length > 0 ? deletionNamespaces : undefined;
  })
  public readonly deletionNamespaces?: string[];
}

export const MockNimbusManagerConfig = {
  enabled: faker.datatype.boolean(),
  namespace: faker.string.uuid(),
  deletionNamespaces: [faker.string.uuid(), faker.string.uuid()],
} satisfies NimbusManagerConfig;

export const MockNimbusManagerConfigProvider = {
  provide: NimbusManagerConfig,
  useValue: MockNimbusManagerConfig,
} satisfies Provider<NimbusManagerConfig>;
