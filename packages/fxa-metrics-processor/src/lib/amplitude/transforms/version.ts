/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const VERSION_REGEX_PATTERN = /([0-9]+)\.([0-9])$/;

export function getVersion(v: string): string | undefined {
  const match = VERSION_REGEX_PATTERN.exec(v);
  return match ? match[0] : undefined;
}
