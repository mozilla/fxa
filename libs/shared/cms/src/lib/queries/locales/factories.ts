/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import { Locale, LocalesResult } from '.';

export const LocalesResultFactory = (
  override?: Partial<LocalesResult>
): LocalesResult => ({
  i18NLocales: [LocaleFactory()],
  ...override,
});

export const LocaleFactory = (override?: Partial<Locale>): Locale => ({
  code: faker.string.sample(),
  ...override,
});
