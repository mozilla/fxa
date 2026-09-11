/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, renderHook } from '@testing-library/react';
import { ERRNO } from '@fxa/accounts/errors';
import type AuthClient from 'fxa-auth-client/browser';
import { usePasskeyWrapCreation } from './use-passkey-wrap-creation';
import type {
  CreatePasskeyWrapResult,
  PasskeyWrapAuthClient,
} from './creation';
import { useAuthClient } from '../../../models';
import { bytesToBase64url } from '../../base64url';

jest.mock('../../../models', () => ({
  ...jest.requireActual('../../../models'),
  useAuthClient: jest.fn(),
}));

const MOCK_JWT = [
  'header',
  bytesToBase64url(
    new TextEncoder().encode(
      JSON.stringify({ sub: '11111111222222223333333344444444' })
    )
  ),
  'signature',
].join('.');

const args = () => ({
  credentialId: 'Y3JlZGVudGlhbA',
  mfaToken: MOCK_JWT,
  prfOut: new Uint8Array(32).fill(9),
  kB: new Uint8Array(32).fill(7),
});

let createPasskeyWrap: jest.MockedFunction<AuthClient['createPasskeyWrap']>;

/**
 * Leaves the request hanging; answer it with `release` or `refuse` once
 * `called` settles, which is when sealing has finished and the store is hit.
 */
const deferWrap = () => {
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

beforeEach(() => {
  jest.clearAllMocks();
  createPasskeyWrap = jest.fn().mockResolvedValue({ created: true });
  // `satisfies` checks the shape the flow consumes; the cast only widens it to
  // what `useAuthClient` is declared to return.
  jest.mocked(useAuthClient).mockReturnValue({
    createPasskeyWrap,
  } satisfies PasskeyWrapAuthClient as unknown as AuthClient);
});

describe('usePasskeyWrapCreation', () => {
  it('starts idle', () => {
    const { result } = renderHook(() => usePasskeyWrapCreation());

    expect(result.current.isLoading).toBe(false);
  });

  it('returns the outcome of the call', async () => {
    const { result } = renderHook(() => usePasskeyWrapCreation());

    let outcome!: CreatePasskeyWrapResult;
    await act(async () => {
      outcome = await result.current.createWrap(args());
    });

    expect(outcome).toEqual({ ok: true, created: true });
  });

  it('raises isLoading for the duration of the call', async () => {
    const { called, release } = deferWrap();
    const { result } = renderHook(() => usePasskeyWrapCreation());

    let pending!: Promise<CreatePasskeyWrapResult>;
    act(() => {
      pending = result.current.createWrap(args());
    });
    expect(result.current.isLoading).toBe(true);

    await called;
    release();
    await act(() => pending);
    expect(result.current.isLoading).toBe(false);
  });

  it('lowers isLoading after the server rejects the wrap', async () => {
    const { called, refuse } = deferWrap();
    const { result } = renderHook(() => usePasskeyWrapCreation());

    let pending!: Promise<CreatePasskeyWrapResult>;
    act(() => {
      pending = result.current.createWrap(args());
    });
    await called;
    refuse(
      Object.assign(new Error('nope'), { errno: ERRNO.PASSKEY_NOT_FOUND })
    );
    await act(() => pending);

    expect(result.current.isLoading).toBe(false);
  });
});
