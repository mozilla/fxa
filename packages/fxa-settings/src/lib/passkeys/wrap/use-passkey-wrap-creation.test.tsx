/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, renderHook } from '@testing-library/react';
import { ERRNO } from '@fxa/accounts/errors';
import type AuthClient from 'fxa-auth-client/browser';
import { usePasskeyWrapCreation } from './use-passkey-wrap-creation';
import { passkeyWrapStore } from './creation';
import type {
  CreatePasskeyWrapResult,
  PasskeyWrapAuthClient,
} from './interfaces';
import { args, deferWrap, serverError } from './mocks';
import { useAuthClient } from '../../../models';

jest.mock('../../../models', () => ({
  ...jest.requireActual('../../../models'),
  useAuthClient: jest.fn(),
}));

let createPasskeyWrap: jest.MockedFunction<AuthClient['createPasskeyWrap']>;

const renderWrapCreation = () => renderHook(() => usePasskeyWrapCreation());

/** Runs a call to completion inside `act`, so state settles before asserting. */
const createWrap = async (
  result: ReturnType<typeof renderWrapCreation>['result']
) => {
  let outcome!: CreatePasskeyWrapResult;
  await act(async () => {
    outcome = await result.current.createWrap(args());
  });
  return outcome;
};

/** Starts a call and returns before it settles; the request stays open. */
const startWrap = (
  result: ReturnType<typeof renderWrapCreation>['result'],
  input = args()
) => {
  let pending!: Promise<CreatePasskeyWrapResult>;
  act(() => {
    pending = result.current.createWrap(input);
  });
  return pending;
};

beforeEach(() => {
  jest.clearAllMocks();
  // The hook uses the page-wide store, so an envelope one test holds would
  // otherwise be re-sent by the next.
  passkeyWrapStore.held.clear();
  passkeyWrapStore.inFlight.clear();
  createPasskeyWrap = jest.fn().mockResolvedValue({ created: true });
  // `satisfies` checks the shape the flow consumes; the cast only widens it to
  // what `useAuthClient` is declared to return.
  jest.mocked(useAuthClient).mockReturnValue({
    createPasskeyWrap,
  } satisfies PasskeyWrapAuthClient as unknown as AuthClient);
});

describe('usePasskeyWrapCreation', () => {
  it('starts idle with no failure', () => {
    const { result } = renderWrapCreation();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.failure).toBeUndefined();
  });

  it('returns the outcome of the call', async () => {
    const { result } = renderWrapCreation();

    const outcome = await createWrap(result);

    expect(outcome).toEqual({ ok: true, created: true });
  });

  it('raises isLoading for the duration of the call', async () => {
    const { called, release } = deferWrap(createPasskeyWrap);
    const { result } = renderWrapCreation();

    const pending = startWrap(result);
    expect(result.current.isLoading).toBe(true);

    await called;
    release();
    await act(() => pending);
    expect(result.current.isLoading).toBe(false);
  });

  it('lowers isLoading after a rejection', async () => {
    const { called, refuse } = deferWrap(createPasskeyWrap);
    const { result } = renderWrapCreation();

    const pending = startWrap(result);
    await called;
    refuse(serverError(ERRNO.PASSKEY_NOT_FOUND));
    await act(() => pending);

    expect(result.current.isLoading).toBe(false);
  });

  it('exposes the failure reason as state', async () => {
    createPasskeyWrap.mockRejectedValue(serverError(ERRNO.PASSKEY_NOT_FOUND));
    const { result } = renderWrapCreation();

    await createWrap(result);

    expect(result.current.failure).toBe('passkey_not_found');
  });

  it('clears a previous failure when a later call succeeds', async () => {
    createPasskeyWrap.mockRejectedValueOnce(
      serverError(ERRNO.PASSKEY_NOT_FOUND)
    );
    const { result } = renderWrapCreation();

    await createWrap(result);
    expect(result.current.failure).toBe('passkey_not_found');

    await createWrap(result);
    expect(result.current.failure).toBeUndefined();
  });

  it('leaves state to the running call when a second one is refused', async () => {
    const { called, release } = deferWrap(createPasskeyWrap);
    const { result } = renderWrapCreation();

    const first = startWrap(result);
    const second = await createWrap(result);

    expect(second).toEqual({ ok: false, failure: 'in_flight' });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.failure).toBeUndefined();

    await called;
    release();
    await act(() => first);
  });

  it('refuses a same-tick second call while a proof rejection is settling', async () => {
    const { result } = renderWrapCreation();

    const first = startWrap(result, { ...args(), mfaToken: 'not-a-jwt' });
    const second = await createWrap(result);

    // Otherwise the first call's continuation would lower isLoading and set
    // failure while the second was still running.
    expect(second).toEqual({ ok: false, failure: 'in_flight' });
    await act(() => first);
    expect(result.current.failure).toBe('proof_invalid');
    expect(createPasskeyWrap).not.toHaveBeenCalled();
  });

  it('keeps the held envelope across re-renders', async () => {
    createPasskeyWrap.mockRejectedValueOnce(new Error('network down'));
    const { result, rerender } = renderWrapCreation();

    await createWrap(result);
    rerender();
    const outcome = await createWrap(result);

    expect(outcome).toEqual({ ok: true, created: true });
    expect(createPasskeyWrap.mock.calls[1][2]).toEqual(
      createPasskeyWrap.mock.calls[0][2]
    );
  });

  it('keeps the held envelope across a remount', async () => {
    createPasskeyWrap.mockRejectedValueOnce(new Error('network down'));
    const first = renderWrapCreation();

    await createWrap(first.result);
    first.unmount();
    const outcome = await createWrap(renderWrapCreation().result);

    expect(outcome).toEqual({ ok: true, created: true });
    expect(createPasskeyWrap.mock.calls[1][2]).toEqual(
      createPasskeyWrap.mock.calls[0][2]
    );
  });
});
