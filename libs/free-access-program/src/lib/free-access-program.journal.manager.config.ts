/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Provider } from '@nestjs/common';
import { IsString } from 'class-validator';

export class FreeAccessProgramJournalManagerConfig {
  @IsString()
  public readonly collectionName!: string;
}

export const MockFreeAccessProgramJournalManagerConfig = {
  collectionName: faker.string.uuid(),
} satisfies FreeAccessProgramJournalManagerConfig;

export const MockFreeAccessProgramJournalManagerConfigProvider = {
  provide: FreeAccessProgramJournalManagerConfig,
  useValue: MockFreeAccessProgramJournalManagerConfig,
} satisfies Provider<FreeAccessProgramJournalManagerConfig>;
