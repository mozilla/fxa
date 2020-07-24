/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Converts public key credentials to JSON
 */
const publicKeyToJSON = (obj) => {
  // Check instance of Array
  if (obj instanceof Array) {
    return obj.map(publicKeyToJSON);
  }

  // Check instance of ArrayBuffer
  // If ArrayBuffer then convert to typed array
  if (obj instanceof ArrayBuffer) {
    const x = new Uint8Array(obj);
    const y = Buffer.from(x);
    return y.toString('base64');
  }

  // Check instance of Object
  if (obj instanceof Object) {
    const it = {};
    for (const key in obj) {
      it[key] = publicKeyToJSON(obj[key]);
    }
    return it;
  }

  return obj;
};

exports.publicKeyToJSON = publicKeyToJSON;
