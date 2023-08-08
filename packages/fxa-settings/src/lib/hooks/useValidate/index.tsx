/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useMemo } from 'react';
import {
  ModelDataProvider,
  ModelDataStore,
  UrlQueryData,
} from '../../model-data';
import { ReachRouterWindow } from '../../window';

// TODO: We should be able to access which param has errored so we can handle
// them individually if we need to.
export function useValidatedQueryParams<T extends ModelDataProvider>(
  QueryParamModel: new (modelData: ModelDataStore) => T
) {
  const urlQueryData = useMemo(
    () => new UrlQueryData(new ReachRouterWindow()),
    []
  );

  const model = new QueryParamModel(urlQueryData);
  const { error } = model.tryValidate();

  return {
    queryParamModel: model,
    validationError: error,
  };
}
