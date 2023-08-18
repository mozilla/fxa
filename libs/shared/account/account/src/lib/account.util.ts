/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { randomBytes } from 'crypto';
import { promisify } from 'util';

export const randomBytesAsync = promisify(randomBytes);

export async function randomHex(len: number): Promise<string> {
  return (await randomBytesAsync(len)).toString('hex');
}

export function normalizeEmail(originalEmail: string): string {
  return originalEmail.toLowerCase();
}
