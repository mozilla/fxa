/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useMemo } from 'react';
import {
  ModelDataProvider,
  ModelDataStore,
  ModelValidationErrors,
  UrlQueryData,
} from '../../model-data';
import { ReachRouterWindow } from '../../window';

export function useValidatedQueryParams<T extends ModelDataProvider>(
  QueryParamModel: new (modelData: ModelDataStore) => T,
  throwOnError: boolean = false,
  skipValidation: boolean = false
) {
  const urlQueryData = useMemo(
    () => new UrlQueryData(new ReachRouterWindow()),
    []
  );
  const model = new QueryParamModel(urlQueryData);

  // Allows us to short circuit validation. Note that hooks
  // can't be called conditionally, so this is the work around.
  if (skipValidation) {
    return {
      queryParamModel: model,
      validationError: null,
    };
  }

  return validateQueryParamModel(model, throwOnError);
}

export function validateQueryParamModel<T extends ModelDataProvider>(
  model: T,
  throwOnError: boolean
) {
  const { error } = model.tryValidate();

  // Sometimes we just call this gate entry into into flows. In this case
  // we can simply throw the validations errors to stop rendering from
  // proceeding further.
  if (throwOnError && error) {
    // Flag this as query parameter validation. This will influence
    // how our error boundary handles displaying the issue.
    if (error instanceof ModelValidationErrors) {
      error.condition = 'QueryParameterValidation';
    }

    throw error;
  }

  return {
    queryParamModel: model,
    validationError: error,
  };
}
