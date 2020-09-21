/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/;

function unbuffer(val: string | Buffer) {
  return Buffer.isBuffer(val) ? val.toString('hex') : val;
}

function buffer(value: string | Buffer) {
  // Don't convert things with no value, but we still want
  // to bufferize falsy things like the empty string.
  if (typeof value !== 'undefined' && value !== null) {
    if (typeof value !== 'string' || !HEX_STRING.test(value)) {
      throw new Error('Invalid hex data for ' + value + '"');
    }
    return Buffer.from(value, 'hex');
  }
  return value;
}

export const uuidTransformer = {
  to: (v: any) => buffer(v),
  from: (v: any) => unbuffer(v),
};

export const intBoolTransformer = {
  to: (v: any) => (v ? 1 : 0),
  from: (v: any) => !!v,
};
