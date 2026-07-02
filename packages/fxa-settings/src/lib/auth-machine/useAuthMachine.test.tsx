/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuthMachine } from './useAuthMachine';

const baseCtx: any = {
  hasPassword: true,
  emailVerified: true,
  sessionVerified: false,
  accountHasTotp: true,
};

it('email → password → totp drives navigation to /signin_totp_code', async () => {
  const navigate = jest.fn();
  const deps = {
    checkAccountStatus: jest.fn().mockResolvedValue({ exists: true }),
    beginSignin: jest.fn().mockResolvedValue({
      emailVerified: true,
      sessionVerified: false,
      verificationMethod: 'totp-2fa',
    }),
    cachedSignin: jest.fn(),
    sendUnblockEmail: jest.fn(),
    upgradeCredentials: jest.fn().mockResolvedValue(undefined),
  };
  const { result } = renderHook(() =>
    useAuthMachine({
      initial: 'identifying.index',
      ctx: baseCtx,
      deps,
      navigate,
      delegate: jest.fn(),
    })
  );

  await act(async () => {
    result.current.send({ type: 'SUBMIT_EMAIL', email: 'a@example.com' });
  });
  await act(async () => {
    result.current.send({ type: 'SUBMIT_PASSWORD', password: 'pw' });
  });

  await waitFor(() =>
    expect(navigate).toHaveBeenCalledWith('/signin_totp_code')
  );
});
