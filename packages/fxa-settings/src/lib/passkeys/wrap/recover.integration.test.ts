/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type AuthClient from 'fxa-auth-client/browser';
import { SensitiveDataClient } from '../../sensitive-data-client';
import { bytesToBase64url } from '../../base64url';
import { createWrapEnvelope } from '../../passkey-crypto';
import { recoverPasswordlessKb } from './recover';

// No module mocks: these run the on-demand import of the wrap module and the
// real crypto behind it, which `recover.test.ts` replaces.

const UID = 'a'.repeat(32);
const CREDENTIAL_ID = 'cred';
const KB = new Uint8Array(32).fill(0x0b);
const MFA_TOKEN = [
  'header',
  bytesToBase64url(new TextEncoder().encode(JSON.stringify({ sub: UID }))),
  'signature',
].join('.');
const prf = (fill: number) => new Uint8Array(32).fill(fill);

const clientReturning = async (sealedWith: Uint8Array) => {
  const envelope = await createWrapEnvelope({
    kB: new Uint8Array(KB),
    prfOut: sealedWith,
    uid: UID,
    credentialId: CREDENTIAL_ID,
  });
  return {
    getPasskeyWrap: jest.fn().mockResolvedValue({ createdAt: 1, ...envelope }),
  } satisfies Pick<AuthClient, 'getPasskeyWrap'>;
};

const args = (authClient: Pick<AuthClient, 'getPasskeyWrap'>) => ({
  authClient,
  uid: UID,
  mfaToken: MFA_TOKEN,
  credentialId: CREDENTIAL_ID,
  prfOut: prf(7),
  mounted: { current: true },
  offerOptIn: true,
  sensitiveDataClient: new SensitiveDataClient(),
});

describe('recoverPasswordlessKb through the real wrap module', () => {
  it('recovers the kB a stored wrap was sealed over', async () => {
    const client = await clientReturning(prf(7));

    await expect(recoverPasswordlessKb(args(client))).resolves.toEqual({
      outcome: 'recovered',
      kB: '0b'.repeat(32),
    });
  });
});
