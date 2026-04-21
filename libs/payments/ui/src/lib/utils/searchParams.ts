/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  paymentsSearchParamsSchema,
  type PaymentsSearchParams,
} from '@fxa/payments/cart';
import { flattenRouteParams } from './flatParam';

/**
 * Flattens raw Next.js searchParams (which may contain arrays or undefineds)
 * and runs them through the payments searchParams schema.
 *
 * The schema is `.passthrough()`-based and all fields are optional, so this
 * never throws — it returns a typed view of the known keys while preserving
 * any unknown keys on the returned object. Callers can trust the declared
 * shape for autocompletion; unknown keys remain readable via index access.
 */
export const parseSearchParams = (
  input: Record<string, string | string[] | undefined> | undefined
): PaymentsSearchParams | undefined => {
  if (!input) return undefined;
  const flat = flattenRouteParams(input);
  const result = paymentsSearchParamsSchema.safeParse(flat);
  return result.success ? result.data : flat;
};
