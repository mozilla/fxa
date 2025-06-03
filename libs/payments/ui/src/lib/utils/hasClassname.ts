/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** Assess whether an object is an instance of another class by matching the name field of the prototype chain.
 * This is less safe than TypeScript's `instanceof` check as it only checks the prototype's `name` attribute, but it allows for deep type checking across the server/client interface.
 */
type Constructor<T> = new (...args: any[]) => T;
export function hasClassname(
  object: object,
  className: Constructor<any> | string
) {
  if (typeof className !== 'string') {
    className = className.name;
  }
  let prototype = Object.getPrototypeOf(object);
  while (prototype) {
    if (prototype.name === className) return true;
    prototype = prototype.prototype;
  }
  return false;
}
