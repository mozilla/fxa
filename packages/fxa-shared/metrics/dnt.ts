/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const denyPrefixes = ['entrypoint', 'utm'];
const denyNames = ['product_id', 'plan_id', 'productId', 'planId'];

const startsWithPrefix = (key: string) =>
  denyPrefixes.some((prefix) => key.startsWith(prefix));

export const filterDntValues = (metricsData: { [keys: string]: unknown }) =>
  Object.entries(metricsData).reduce((acc, [k, v]) => {
    if (startsWithPrefix(k) || denyNames.includes(k)) {
      return acc;
    }

    acc[k] = v;
    return acc;
  }, {} as { [keys: string]: unknown });
