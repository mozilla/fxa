/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import random from './random';

let authenticator: any;

// Use the appropriate otplib version based on environment
if (typeof window !== 'undefined') {
  // Browser environment - use the browser-optimized version
  const { authenticator: auth } = require('@otplib/preset-browser');
  authenticator = auth;
} else {
  // Node.js environment (tests) - use the regular version
  const { authenticator: auth } = require('otplib');
  authenticator = auth;
}

// Configure otplib to match auth-server settings
authenticator.options = {
  ...authenticator.options,
  step: 30,
  window: 1,
};

export async function getCode(secret: string): Promise<string> {
  return authenticator.generate(secret);
}

export async function checkCode(
  secret: string,
  code: string
): Promise<boolean> {
  return authenticator.verify({ token: code, secret });
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

export async function generateRecoveryCodes(count: number, length: number) {
  const recoveryCodes: string[] = [];
  const gen = random.base32(length);
  while (recoveryCodes.length < count) {
    const rc = (await gen()).toLowerCase();
    if (recoveryCodes.indexOf(rc) === -1) {
      recoveryCodes.push(rc);
    }
  }
  return recoveryCodes;
}
