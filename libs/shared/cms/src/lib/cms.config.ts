/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';
import { IsString } from 'class-validator';

export class CMSConfig {
  @IsString()
  public readonly supportedPriceIds!: string;
}

export const MockCMSConfig = {
  supportedPriceIds:
    'plan_GqM9N6qyhvxaVk,price_1KbomlBVqmGyQTMaa0Tq7UaW,price_1Ivq4gBVqmGyQTMaplHcFEGO',
} satisfies CMSConfig;

export const MockCMSConfigProvider = {
  provide: CMSConfig,
  useValue: MockCMSConfig,
} satisfies Provider<CMSConfig>;
