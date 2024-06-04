/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Transform } from 'class-transformer';
import { IsObject } from 'class-validator';
import { Provider } from '@nestjs/common';

export class CurrencyConfig {
  @Transform(
    ({ value }) => (value instanceof Object ? value : JSON.parse(value)),
    { toClassOnly: true }
  )
  @IsObject()
  public readonly taxIds!: { [key: string]: string };
}

export const MockCurrencyConfig = {
  taxIds: { EUR: 'EU1234' },
} satisfies CurrencyConfig;

export const MockCurrencyConfigProvider = {
  provide: CurrencyConfig,
  useValue: MockCurrencyConfig,
} satisfies Provider<CurrencyConfig>;
