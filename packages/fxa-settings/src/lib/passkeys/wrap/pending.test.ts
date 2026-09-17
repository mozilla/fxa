/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SensitiveDataClient } from '../../sensitive-data-client';
import { captureKbForPendingWrap } from './pending';

const UID = 'a'.repeat(32);
const KB_HEX = '0b'.repeat(32);

const pending = (uid = UID) => {
  const client = new SensitiveDataClient();
  client.PasskeyWrapData = {
    uid,
    credentialId: 'cred',
    mfaToken: 'jwt',
    prfOut: new Uint8Array(32),
  };
  return client;
};

describe('captureKbForPendingWrap', () => {
  it('stores kB as bytes for the account the wrap is for', () => {
    const client = pending();
    captureKbForPendingWrap(client, UID, KB_HEX);
    expect(client.PasskeyWrapData?.kB).toEqual(new Uint8Array(32).fill(0x0b));
  });

  it('ignores another account and leaves the wrap untouched', () => {
    const client = pending('b'.repeat(32));
    captureKbForPendingWrap(client, UID, KB_HEX);
    expect(client.PasskeyWrapData?.kB).toBeUndefined();
  });

  it('does not throw on kB it cannot decode', () => {
    const client = pending();
    expect(() => captureKbForPendingWrap(client, UID, 'zz')).not.toThrow();
    expect(client.PasskeyWrapData?.kB).toBeUndefined();
  });
});
