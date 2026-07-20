/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export function parseMatcherValue(
  value: unknown
): { dateStr: string; description?: string } | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const dateStr = value[0];
  if (typeof dateStr !== 'string' || dateStr.length === 0) return undefined;
  const description = value[1];
  return {
    dateStr,
    description: typeof description === 'string' ? description : undefined,
  };
}
