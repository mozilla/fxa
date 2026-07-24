/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Creates an instance of type T lazily. This can be useful for mocking.
 * @param factory Produces instance of T
 * @returns Single instance of type T
 */
const UNINITIALIZED = Symbol('lazy.UNINITIALIZED');

export function lazy<T>(factory: () => T): () => T {
  let value: T | typeof UNINITIALIZED = UNINITIALIZED;
  return () => {
    if (value === UNINITIALIZED) {
      value = factory();
    }
    return value;
  };
}
