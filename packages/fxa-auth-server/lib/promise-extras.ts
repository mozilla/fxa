/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export async function props(promises: Record<string, Promise<any>>) {
  // resolve promises in parallel
  await Promise.all(Object.values(promises));
  // create the resolved object
  const m = new Map<string, any>();
  for (const [key, promise] of Object.entries(promises)) {
    m.set(key, await promise);
  }
  return Object.fromEntries(m);
}
