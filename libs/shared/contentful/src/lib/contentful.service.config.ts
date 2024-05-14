/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';
import { IsString } from 'class-validator';

export class ContentfulServiceConfig {
  @IsString()
  public readonly supportedPlanIds!: string;
}

export const MockContentfulServiceConfig = {
  supportedPlanIds:
    'plan_GqM9N6qyhvxaVk,price_1KbomlBVqmGyQTMaa0Tq7UaW,price_1Ivq4gBVqmGyQTMaplHcFEGO',
} satisfies ContentfulServiceConfig;

export const MockContentfulServiceConfigProvider = {
  provide: ContentfulServiceConfig,
  useValue: MockContentfulServiceConfig,
} satisfies Provider<ContentfulServiceConfig>;
