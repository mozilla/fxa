/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { OperationVariables, TypedDocumentNode } from '@apollo/client';
import { createHash } from 'crypto';

export const CMS_QUERY_CACHE_KEY = 'cmsQueryCache';

export const cacheKeyForQuery = function <
  Result,
  Variables extends OperationVariables
>(query: TypedDocumentNode<Result, Variables>, variables: Variables): string {
  // Sort variables prior to stringifying to not be caller order dependent
  const variablesString = JSON.stringify(
    variables,
    Object.keys(variables as Record<string, unknown>).sort()
  );
  const queryHash = createHash('sha256')
    .update(JSON.stringify(query))
    .digest('hex');
  const variableHash = createHash('sha256')
    .update(variablesString)
    .digest('hex');
  return `${CMS_QUERY_CACHE_KEY}:${queryHash}:${variableHash}`;
};
