/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** Adds fxa.name to data.tags */
export function tagFxaName(data: any, name?: string) {
  data.tags = data.tags || {};
  data.tags['fxa.name'] = name || 'unknown';
  return data;
}
