/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

interface SessionUser {
  id: string;
  email: string;
  metricsEnabled?: boolean;
}

interface Session {
  user: SessionUser;
}

export const SessionFactory = (
  override?: Partial<SessionUser>
): Session => ({
  user: {
    id: faker.string.hexadecimal({ length: 32, prefix: '' }),
    email: faker.internet.email(),
    metricsEnabled: true,
    ...override,
  },
});
