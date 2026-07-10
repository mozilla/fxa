/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { FxaAccessTokenClaims } from '../fxa-access-token.schemas';

export const FxaAccessTokenClaimsFactory = (
  override?: Partial<FxaAccessTokenClaims>
): FxaAccessTokenClaims => ({
  sub: faker.string.hexadecimal({ length: 32, prefix: '' }),
  client_id: faker.string.hexadecimal({ length: 16, prefix: '' }),
  scope: 'profile',
  ...override,
});
