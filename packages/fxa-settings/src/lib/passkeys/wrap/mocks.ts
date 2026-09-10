/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type AuthClient from 'fxa-auth-client/browser';
import type { PasskeyWrapEnvelope } from 'fxa-auth-client/browser';
import { bytesToBase64url } from '../../base64url';
import { openWrapEnvelope } from '../../passkey-crypto';
import type { CreatePasskeyWrapArgs } from './interfaces';

export const MOCK_UID = '11111111222222223333333344444444';
export const MOCK_OTHER_UID = 'aaaaaaaabbbbbbbbccccccccdddddddd';
export const MOCK_CREDENTIAL_ID = 'Y3JlZGVudGlhbA';
export const MOCK_OTHER_CREDENTIAL_ID = 'b3RoZXI';
export const MOCK_SESSION_TOKEN = 'a'.repeat(64);
export const MOCK_KB = new Uint8Array(32).fill(7);
export const MOCK_PRF_OUT = new Uint8Array(32).fill(9);
export const ZEROED = new Uint8Array(32);

/** Unsigned: the flow reads `sub` and `cid`, leaving verification to the server. */
export const mfaTokenFor = (claims: Record<string, unknown>) =>
  [
    'header',
    bytesToBase64url(new TextEncoder().encode(JSON.stringify(claims))),
    'signature',
  ].join('.');

/** A proof bound to `credentialId`, as the server mints for a wrap. */
export const proofFor = (credentialId: string, sub = MOCK_UID) =>
  mfaTokenFor({ sub, cid: credentialId, scope: ['mfa:passkey'] });

export const MOCK_JWT = proofFor(MOCK_CREDENTIAL_ID);

/** Fresh buffers per call: the flow zeroes the ones it is handed. */
export const args = () =>
  ({
    credentialId: MOCK_CREDENTIAL_ID,
    mfaToken: MOCK_JWT,
    prfOut: Uint8Array.from(MOCK_PRF_OUT),
    kB: Uint8Array.from(MOCK_KB),
  }) satisfies CreatePasskeyWrapArgs;

/** `args()` for another credential, with a proof bound to it. */
export const argsFor = (credentialId: string) =>
  ({
    ...args(),
    credentialId,
    mfaToken: proofFor(credentialId),
  }) satisfies CreatePasskeyWrapArgs;

/** Asserts `envelope` unseals to `MOCK_KB` under `context`, `args()` by default. */
export const opensTo = (
  envelope: PasskeyWrapEnvelope,
  context: { uid?: string; credentialId?: string } = {}
) =>
  expect(
    openWrapEnvelope({
      envelope,
      prfOut: Uint8Array.from(MOCK_PRF_OUT),
      uid: MOCK_UID,
      credentialId: MOCK_CREDENTIAL_ID,
      ...context,
    })
  ).resolves.toEqual(MOCK_KB);

export const serverError = (
  errno: number,
  extra: Record<string, unknown> = {}
) => Object.assign(new Error('nope'), { errno, ...extra });

/**
 * Leaves the request hanging; answer it with `release` or `refuse` once
 * `called` settles, which is when the flow has reached the store. Answering
 * earlier rejects a promise nothing awaits yet.
 */
export const deferWrap = (
  createPasskeyWrap: jest.MockedFunction<AuthClient['createPasskeyWrap']>
) => {
  // Definite assignment: the Promise executors run synchronously.
  let answer!: (value: { created: boolean }) => void;
  let reject!: (reason: unknown) => void;
  let markCalled!: () => void;
  const called = new Promise<void>((resolve) => {
    markCalled = resolve;
  });
  createPasskeyWrap.mockImplementation(() => {
    markCalled();
    return new Promise((resolve, fail) => {
      answer = resolve;
      reject = fail;
    });
  });
  return {
    called,
    release: () => answer({ created: true }),
    refuse: (reason: unknown) => reject(reason),
  };
};
