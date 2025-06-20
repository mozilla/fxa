/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import { RelyingPartiesQuery } from '../../../__generated__/graphql';
import { RelyingPartyResult } from '@fxa/shared/cms';

export const RelyingPartyQueryFactory = (
  override?: Partial<RelyingPartiesQuery>
): RelyingPartiesQuery => ({
  relyingParties: [RelyingPartyResultFactory()],
  ...override
});

export const RelyingPartyResultFactory = (
  override?: Partial<RelyingPartyResult>
) => ({
  clientId: faker.string.hexadecimal(),
  entrypoint: faker.string.hexadecimal(),
  EmailFirstPage: {
    headline: faker.string.sample(),
    description: faker.string.sample(),
    submitButtonColorHex: faker.string.hexadecimal({ length: 6 }),
  },
  ...override,
});