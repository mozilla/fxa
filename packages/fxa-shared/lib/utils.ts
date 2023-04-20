/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Swap the keys and values of an object
export function swapObjectKeysAndValues(obj: {
  [key: string]: string | number;
}) {
  var result: { [key: string | number]: string } = {};
  for (var key in obj) {
    result[obj[key]] = key;
  }
  return result;
}

// Parse a comma-separated list with allowance for varied whitespace
export function commaSeparatedListToArray(s: string) {
  return (s || '')
    .trim()
    .split(',')
    .map((c) => c.trim())
    .filter((c) => !!c);
}
