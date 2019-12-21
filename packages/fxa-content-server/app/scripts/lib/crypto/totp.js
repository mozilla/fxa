/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import base32Decode from 'base32-decode';

function trimOrPad(num, digits) {
  const str = num.toString().substr(-digits);
  if (str.length === digits) {
    return str;
  }
  return new Array(digits - str.length + 1).join('0') + str;
}

export function getCode(secret, digits = 6, now = Date.now()) {
  const secretKey = base32Decode(secret.split(' ').join(''), 'RFC4648');
  const counter = new ArrayBuffer(8);
  const cv = new DataView(counter);
  cv.setUint32(4, Math.floor(now / 30000), false);
  return crypto.subtle
    .importKey(
      'raw',
      secretKey,
      {
        name: 'HMAC',
        hash: { name: 'SHA-1' },
      },
      false,
      ['sign']
    )
    .then(key => {
      return crypto.subtle.sign('HMAC', key, counter);
    })
    .then(data => {
      const hmac = new DataView(data);
      const offset = hmac.getUint8(hmac.byteLength - 1) & 0x0f;
      return trimOrPad(hmac.getInt32(offset, false) & 0x7fffffff, digits);
    });
}

export function check(secret, code, now = Date.now(), tries = 2) {
  if (tries === 0) {
    return false;
  }
  return getCode(secret, 6, now).then(current => {
    if (current !== code) {
      return check(secret, code, now - 30000, --tries);
    }
    return true;
  });
}
