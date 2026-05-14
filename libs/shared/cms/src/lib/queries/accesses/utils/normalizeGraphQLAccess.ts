/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { AccessesQuery } from '../../../../__generated__/graphql';
import type { NormalizedAccess } from '../types';
import { collectOfferingApiIdentifiers } from './collectOfferingApiIdentifiers';
import { flattenOfferingCapabilities } from './flattenOfferingCapabilities';

export type GraphQLAccessRow = NonNullable<AccessesQuery['accesses'][number]>;

export function normalizeGraphQLAccess(
  access: GraphQLAccessRow
): NormalizedAccess {
  const emailLists: unknown[] = [];
  for (const matcher of access.matchers ?? []) {
    if (matcher?.__typename === 'ComponentMatchersEmailList') {
      emailLists.push(matcher.emails);
    }
  }
  return {
    documentId: access.documentId,
    internalName: access.internalName,
    offeringApiIdentifiers: collectOfferingApiIdentifiers(access.offerings),
    capabilities: flattenOfferingCapabilities(access.offerings),
    emailLists,
  };
}
