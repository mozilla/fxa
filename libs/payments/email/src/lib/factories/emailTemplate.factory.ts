/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { RenderEmailOptions } from '../emailTemplate.types';

export const createRenderEmailOptions = (
  overrides: Partial<RenderEmailOptions> = {}
): RenderEmailOptions => ({
  acceptLanguage: faker.helpers.arrayElement(['en-US', 'fr-FR', 'es-ES']),
  template: faker.string.alphanumeric(10),
  layout: faker.string.alphanumeric(10),
  subject: faker.lorem.sentence(),
  args: {
    [faker.string.alpha(5)]: faker.string.sample(),
  },
  ...overrides,
});
