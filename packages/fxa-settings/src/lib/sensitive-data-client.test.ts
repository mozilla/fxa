/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SensitiveData, SensitiveDataClient } from './sensitive-data-client';

const UID = 'a'.repeat(32);
const OTHER_UID = 'b'.repeat(32);
const KB_HEX = '0b'.repeat(32);
const KB_BUFFER = new Uint8Array(32).fill(0x0b);
const ZEROED = new Uint8Array(32);

const withPendingWrap = (uid = UID) => {
  const client = new SensitiveDataClient();
  const wrap: SensitiveData.PasskeyWrapData = {
    uid,
    credentialId: 'cred',
    mfaToken: 'jwt',
    prfOut: new Uint8Array(32).fill(9),
  };
  client.PasskeyWrapData = wrap;
  return { client, wrap };
};

describe('SensitiveDataClient captureKbForPendingWrap', () => {
  it('stores kB as bytes for the account the wrap is for', () => {
    const { client } = withPendingWrap();

    client.captureKbForPendingWrap(UID, KB_HEX);

    expect(client.PasskeyWrapData?.kB).toEqual(KB_BUFFER);
  });

  it('leaves a wrap for another account untouched', () => {
    const { client } = withPendingWrap(OTHER_UID);

    client.captureKbForPendingWrap(UID, KB_HEX);

    expect(client.PasskeyWrapData?.kB).toBeUndefined();
  });

  it('stores nothing when no ceremony asked for kB', () => {
    const client = new SensitiveDataClient();

    client.captureKbForPendingWrap(UID, KB_HEX);

    expect(client.PasskeyWrapData).toBeUndefined();
  });

  it('zeroes a kB already held before replacing it', () => {
    const { client, wrap } = withPendingWrap();
    const superseded = new Uint8Array(32).fill(7);
    wrap.kB = superseded;

    client.captureKbForPendingWrap(UID, KB_HEX);

    expect(superseded).toEqual(ZEROED);
    expect(client.PasskeyWrapData?.kB).toEqual(KB_BUFFER);
  });

  it('drops kB rather than throwing on a value it cannot decode', () => {
    const { client } = withPendingWrap();

    expect(() => client.captureKbForPendingWrap(UID, 'zz')).not.toThrow();
    expect(client.PasskeyWrapData?.kB).toBeUndefined();
  });
});
