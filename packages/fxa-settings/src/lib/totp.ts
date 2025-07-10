/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import random from './random';

let authenticatorInstance: any = null;

// Polyfill for Playwright tests because they run in a Node context where some
// browser globals are undefined, which `@otplib/preset-browser` uses.
function setupTestPolyfills() {
  if (typeof window === 'undefined') {
    (global as any).window = {
      crypto: (global as any).crypto || {
        getRandomValues: (arr: any) => {
          const crypto = require('crypto');
          const bytes = crypto.randomBytes(arr.length);
          arr.set(bytes);
          return arr;
        },
      },
    };
    if (typeof (global as any).buffer === 'undefined') {
      (global as any).buffer = require('buffer');
    }
    if (typeof (global as any).Buffer === 'undefined') {
      (global as any).Buffer = require('buffer').Buffer;
    }
  }
}

// Lazy import and configure authenticator only when needed. This is required
// because when importing this lib top-level, Playwright will error.
async function getAuthenticator() {
  if (authenticatorInstance) {
    return authenticatorInstance;
  }
  setupTestPolyfills();

  const { authenticator } = await import('@otplib/preset-browser');

  // Configure otplib to match auth-server settings
  authenticator.options = {
    ...authenticator.options,
    step: 30,
    window: 1,
  };

  authenticatorInstance = authenticator;
  return authenticator;
}

export async function getCode(secret: string): Promise<string> {
  const authenticator = await getAuthenticator();
  return authenticator.generate(secret);
}

export async function checkCode(
  secret: string,
  code: string
): Promise<boolean> {
  const authenticator = await getAuthenticator();
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
