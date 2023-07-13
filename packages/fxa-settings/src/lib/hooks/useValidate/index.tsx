/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect, useMemo, useState } from 'react';
import { validate, ValidationError } from 'class-validator';
import { ReachRouterWindow } from '../../window';
import { UrlQueryData } from '../../model-data';

// ❌ TODO: improve types here. We may also want to tweak the shape of what this returns.
export function useValidatedQueryParams<T extends Record<string, any>>(
  Schema: new () => T
) {
  const [state, setState] = useState<{
    queryParams: T | null;
    queryParamErrors: Record<string, string> | null;
  }>({ queryParams: null, queryParamErrors: null });

  const urlQueryData = useMemo(
    () => new UrlQueryData(new ReachRouterWindow()),
    []
  );

  useEffect(() => {
    const schema = new Schema();

    for (let key of Object.keys(schema)) {
      const value = urlQueryData.get(key);
      if (value) {
        (schema as any)[key] = value;
      }
    }

    validate(schema).then((validationErrors) => {
      const queryParamErrors: Record<string, any> = {};
      validationErrors.forEach((error: ValidationError) => {
        if (error.constraints) {
          queryParamErrors[error.property] = Object.values(
            error.constraints
          )[0];
        }
      });
      setState({
        queryParams: schema,
        queryParamErrors: Object.keys(queryParamErrors).length
          ? queryParamErrors
          : null,
      });
    });
  }, [Schema, urlQueryData]);

  return state;
}
