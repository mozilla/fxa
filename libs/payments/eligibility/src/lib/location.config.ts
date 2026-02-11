/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';
import { IsString } from 'class-validator';

export class LocationConfig {
  @IsString()
  subscriptionsUnsupportedLocations!: string;
}

export const MockLocationConfig = {
  subscriptionsUnsupportedLocations: '["CN","KP","IR"]',
} satisfies LocationConfig;

export const MockLocationConfigProvider = {
  provide: LocationConfig,
  useValue: MockLocationConfig,
} satisfies Provider<LocationConfig>;
