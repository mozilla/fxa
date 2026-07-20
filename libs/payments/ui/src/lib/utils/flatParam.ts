/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * @param params NextJS URL path or query parameters
 * @returns A flattened Record<string, string> object, with array values of
 * the original param object marged into a comma-separated value string
 */
export const flattenRouteParams = (
  params: Record<string, string | string[] | undefined>
): Record<string, string> => {
  const flatParams: Record<string, string> = {};
  for (const key in params) {
    const value = params[key];
    if (value == null) continue;
    if (Array.isArray(value)) {
      flatParams[key] = value.join(',');
    } else {
      flatParams[key] = value;
    }
  }
  return flatParams;
};
