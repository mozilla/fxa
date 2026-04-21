/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { z } from 'zod';

// Known query params that payments code reads off of the incoming URL.
// `.passthrough()` keeps unknown keys on the parsed object — searchParams
// are user-controlled and we never want to drop or reject unexpected values.
export const paymentsSearchParamsSchema = z
  .object({
    experimentationPreview: z.string().optional(),
  })
  .passthrough();

export type PaymentsSearchParams = z.infer<typeof paymentsSearchParamsSchema>;
