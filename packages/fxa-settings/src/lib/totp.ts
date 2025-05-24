/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import base32Decode from 'base32-decode';

function trimOrPad(num: number, digits: number): string {
  const str = num.toString().substr(-digits);
  if (str.length === digits) {
    return str;
  }
  return new Array(digits - str.length + 1).join('0') + str;
}

export async function getCode(
  secret: string,
  digits: number = 6,
  timestamp: number = Date.now()
): Promise<string> {
  const secretKey = base32Decode(secret, 'RFC4648');
  const counter = new ArrayBuffer(8);
  const cv = new DataView(counter);
  cv.setUint32(4, Math.floor(timestamp / 30000), false);

  const key = await crypto.subtle.importKey(
    'raw',
    secretKey,
    {
      name: 'HMAC',
      hash: { name: 'SHA-1' },
    },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, counter);
  const hmac = new DataView(signature);
  const offset = hmac.getUint8(hmac.byteLength - 1) & 0x0f;
  return trimOrPad(hmac.getInt32(offset, false) & 0x7fffffff, digits);
}

export async function checkCode(
  secret: string,
  code: string,
  timestamp: number = Date.now(),
  tries = 2
): Promise<boolean> {
  for (; tries > 0; tries--, timestamp -= 30000) {
    const x = await getCode(secret, 6, timestamp);
    if (x === code) {
      return true;
    }
  }

  return false;
}

export function copyRecoveryCodes(event: React.ClipboardEvent<HTMLElement>) {
  const selection = document.getSelection();
  if (selection) {
    event.clipboardData.setData(
      'text/plain',
      selection.toString().replace(/\s/g, '\n')
    );
    event.preventDefault();
  }
}
