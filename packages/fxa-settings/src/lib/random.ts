/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Adapted from from /fxa-authserver/lib/crypto

// COMMON BASES
// Note, uses Crockford Base32 for better UX
const BASE36 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const BASE16 = BASE32.substring(0, 16);
const BASE10 = BASE32.substring(0, 10);

export const bases: Record<string, string> = {
  base10: BASE10,
  base16: BASE16,
  base32: BASE32,
  base36: BASE36,
};

export const regexs: Record<string, RegExp> = {
  base10: new RegExp(`^[${BASE10}]*$`),
  base16: new RegExp(`^[${BASE32}]*$`, 'i'),
  base32: new RegExp(`^[${BASE32}]*$`, 'i'),
  base36: new RegExp(`^[${BASE36}]*$`, 'i'),
};

export class Random {
  get regexs() {
    return regexs;
  }

  get bases() {
    return bases;
  }

  getRandomBytes(len: number) {
    return window.crypto.getRandomValues(new Uint32Array(len));
  }

  randomValue(base: string, len: number) {
    // To minimize bias in element selection, we generate a
    // 32-bit unsigned int for each element and map it to a float in [0,1).
    // This requires 4 bytes of randomness per element.
    const bytes = this.getRandomBytes(len);
    const out: string[] = [];

    for (let i = 0; i < len; i++) {
      const r = bytes[i] / 2 ** 32;
      out.push(base[Math.floor(r * base.length)]);
    }

    return out.join('');
  }

  base10(len: number) {
    return () => this.randomValue(BASE10, len);
  }
  base16(len: number) {
    return () => this.randomValue(BASE16, len);
  }
  base32(len: number) {
    return () => this.randomValue(BASE32, len);
  }
  base36(len: number) {
    return () => this.randomValue(BASE36, len);
  }
}

const randomInstance = new Random();
export default randomInstance;
