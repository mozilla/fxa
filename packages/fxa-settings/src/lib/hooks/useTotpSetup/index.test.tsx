/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { renderHook, waitFor } from '@testing-library/react';
import { useTotpSetup } from '.';
import { useAccount } from '../../../models';
import { useMfaErrorHandler } from '../useMfaErrorHandler';
import { TotpInfo } from '../../types';

jest.mock('../../../models', () => ({
  ...jest.requireActual('../../../models'),
  useAccount: jest.fn(),
}));

jest.mock('../useMfaErrorHandler', () => ({
  useMfaErrorHandler: jest.fn(),
}));

const MOCK_TOTP_INFO: TotpInfo = {
  qrCodeUrl: 'otpauth://totp/Firefox:user@example.com?secret=ABCD1234',
  secret: 'ABCD1234',
};

let createTotpWithJwt: jest.Mock;
let handleMfaError: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  createTotpWithJwt = jest.fn().mockResolvedValue(MOCK_TOTP_INFO);
  handleMfaError = jest.fn().mockReturnValue(false);
  (useAccount as jest.Mock).mockReturnValue({ createTotpWithJwt });
  (useMfaErrorHandler as jest.Mock).mockReturnValue(handleMfaError);
});

describe('useTotpSetup', () => {
  it('returns the totp info once the request resolves', async () => {
    const { result } = renderHook(() => useTotpSetup());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.totpInfo).toEqual(MOCK_TOTP_INFO);
    expect(result.current.error).toBeNull();
  });

  // createTotpWithJwt is a server-side mutation: a second call mints a new
  // token and silently invalidates the first, leaving the user scanning a QR
  // code the server no longer accepts. Both effect deps come from context, so
  // a re-run on changed identity is the reachable form of that double-fire —
  // StrictMode's dev double-invoke is the other, but React suppresses it
  // inside Jest's act environment so it cannot be asserted here.
  it('mints only one token when the effect re-runs', async () => {
    (useMfaErrorHandler as jest.Mock).mockImplementation(() =>
      jest.fn().mockReturnValue(false)
    );

    const { result, rerender } = renderHook(() => useTotpSetup());
    await waitFor(() => expect(result.current.loading).toBe(false));

    rerender();
    await waitFor(() =>
      expect(result.current.totpInfo).toEqual(MOCK_TOTP_INFO)
    );

    expect(createTotpWithJwt).toHaveBeenCalledTimes(1);
  });

  it('surfaces the error when the MFA handler does not consume it', async () => {
    const err = new Error('totp boom');
    createTotpWithJwt.mockRejectedValue(err);

    const { result } = renderHook(() => useTotpSetup());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(err);
    expect(result.current.totpInfo).toBeUndefined();
  });

  it('leaves error unset when the MFA handler consumes the error', async () => {
    createTotpWithJwt.mockRejectedValue(new Error('jwt expired'));
    handleMfaError.mockReturnValue(true);

    const { result } = renderHook(() => useTotpSetup());

    await waitFor(() => expect(handleMfaError).toHaveBeenCalled());

    expect(result.current.error).toBeNull();
    expect(result.current.totpInfo).toBeUndefined();
  });
});
