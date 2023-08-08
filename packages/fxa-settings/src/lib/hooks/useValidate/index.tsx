/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// import { useEffect, useState } from 'react';
import { ModelDataStore, UrlQueryData } from '../../model-data';
import { ReachRouterWindow } from '../../window';

let urlQueryDataInstance: UrlQueryData;

// TODO: this hook properly, once class-validator is merged. This should return
// queryParams and queryParamErrors. Rough example:
// https://github.com/mozilla/fxa/pull/15493/files#diff-dbcbd68ffe01cbbb9cb63dfc95cc1c6a103f7d33c7ff481c49f45b2f6a9cf85fR1
export function useValidatedQueryParams<T extends Record<string, any>>(
  QueryParamModel: new (modelData: ModelDataStore) => T
) {
  if (!urlQueryDataInstance) {
    urlQueryDataInstance = new UrlQueryData(new ReachRouterWindow());
  }

  const params = new QueryParamModel(urlQueryDataInstance);
  return { queryParams: params };
}
