/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { renderHook, waitFor } from '@testing-library/react';
import { useTotpReplace } from '.';
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

let startReplaceTotpWithJwt: jest.Mock;
let handleMfaError: jest.Mock;

function mockAccount(verified = true) {
  (useAccount as jest.Mock).mockReturnValue({
    startReplaceTotpWithJwt,
    totp: { verified },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  startReplaceTotpWithJwt = jest.fn().mockResolvedValue(MOCK_TOTP_INFO);
  handleMfaError = jest.fn().mockReturnValue(false);
  mockAccount();
  (useMfaErrorHandler as jest.Mock).mockReturnValue(handleMfaError);
});

describe('useTotpReplace', () => {
  it('returns the totp info once the request resolves', async () => {
    const { result } = renderHook(() => useTotpReplace());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.totpInfo).toEqual(MOCK_TOTP_INFO);
    expect(result.current.error).toBeNull();
  });

  it('mints only one secret when the effect re-runs', async () => {
    (useMfaErrorHandler as jest.Mock).mockImplementation(() =>
      jest.fn().mockReturnValue(false)
    );

    const { result, rerender } = renderHook(() => useTotpReplace());
    await waitFor(() => expect(result.current.loading).toBe(false));

    rerender();
    await waitFor(() =>
      expect(result.current.totpInfo).toEqual(MOCK_TOTP_INFO)
    );

    expect(startReplaceTotpWithJwt).toHaveBeenCalledTimes(1);
  });

  it('does not start a replacement when the account has no verified totp', async () => {
    mockAccount(false);

    const { result } = renderHook(() => useTotpReplace());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(startReplaceTotpWithJwt).not.toHaveBeenCalled();
    expect(result.current.totpInfo).toBeUndefined();
  });

  it('surfaces the error when the MFA handler does not consume it', async () => {
    const err = new Error('totp boom');
    startReplaceTotpWithJwt.mockRejectedValue(err);

    const { result } = renderHook(() => useTotpReplace());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(err);
    expect(result.current.totpInfo).toBeUndefined();
  });

  it('leaves error unset when the MFA handler consumes the error', async () => {
    startReplaceTotpWithJwt.mockRejectedValue(new Error('jwt expired'));
    handleMfaError.mockReturnValue(true);

    const { result } = renderHook(() => useTotpReplace());

    await waitFor(() => expect(handleMfaError).toHaveBeenCalled());

    expect(result.current.error).toBeNull();
    expect(result.current.totpInfo).toBeUndefined();
  });
});
