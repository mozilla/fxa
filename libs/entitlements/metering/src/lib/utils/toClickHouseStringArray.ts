/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export function toClickHouseStringArray(values: string[]): string {
  const quoted = values.map(
    (value) => `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
  );
  return `[${quoted.join(',')}]`;
}
