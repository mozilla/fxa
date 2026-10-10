/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, renderHook } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router';
import { SensitiveDataClient } from '../sensitive-data-client';
import { useClearPasskeyWrapOffRoute } from './use-clear-wrap-off-route';

const MOCK_UID = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

function stashWrapData(sensitiveDataClient: SensitiveDataClient) {
  const held = {
    uid: MOCK_UID,
    credentialId: 'cred',
    mfaToken: 'mfa-token',
    prfOut: new Uint8Array(32).fill(3),
    kB: new Uint8Array(32).fill(7),
  };
  sensitiveDataClient.PasskeyWrapData = held;
  return held;
}

const renderAt = (pathname: string, sensitiveDataClient: SensitiveDataClient) =>
  renderHook(() => useClearPasskeyWrapOffRoute(sensitiveDataClient), {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[pathname]}>{children}</MemoryRouter>
    ),
  });

describe('useClearPasskeyWrapOffRoute', () => {
  it.each([
    ['/signin_passkey_fallback', 'the password step'],
    ['/inline_passwordless_sync_setup?service=sync', 'the opt-in page'],
  ])('keeps the material on %s, which is %s', (pathname) => {
    const sensitiveDataClient = new SensitiveDataClient();
    const held = stashWrapData(sensitiveDataClient);

    renderAt(pathname, sensitiveDataClient);

    expect(sensitiveDataClient.PasskeyWrapData).toBe(held);
    expect(held.kB).toEqual(new Uint8Array(32).fill(7));
  });

  it.each([
    '/inline_passwordless_sync_setup_old',
    '/signin_passkey_fallback_error',
  ])('zeroes the material on %s, which only shares a prefix', (pathname) => {
    const sensitiveDataClient = new SensitiveDataClient();
    const held = stashWrapData(sensitiveDataClient);

    renderAt(pathname, sensitiveDataClient);

    expect(sensitiveDataClient.PasskeyWrapData).toBeUndefined();
    expect(held.kB).toEqual(new Uint8Array(32));
  });

  it('zeroes and drops the material on a route with no use for it', () => {
    const sensitiveDataClient = new SensitiveDataClient();
    const held = stashWrapData(sensitiveDataClient);

    renderAt('/settings', sensitiveDataClient);

    expect(sensitiveDataClient.PasskeyWrapData).toBeUndefined();
    expect(held.kB).toEqual(new Uint8Array(32));
    expect(held.prfOut).toEqual(new Uint8Array(32));
  });

  it('leaves material stashed after mount alone until the route changes', () => {
    const sensitiveDataClient = new SensitiveDataClient();
    let navigate!: ReturnType<typeof useNavigate>;

    renderHook(
      () => {
        navigate = useNavigate();
        useClearPasskeyWrapOffRoute(sensitiveDataClient);
      },
      {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={['/signin']}>
            <Routes>
              <Route path="*" element={<>{children}</>} />
            </Routes>
          </MemoryRouter>
        ),
      }
    );

    // The ceremony stashes while still on the signin route it started from.
    const held = stashWrapData(sensitiveDataClient);
    expect(sensitiveDataClient.PasskeyWrapData).toBe(held);

    act(() => navigate('/signin_passkey_fallback'));
    expect(sensitiveDataClient.PasskeyWrapData).toBe(held);

    act(() => navigate('/settings'));
    expect(sensitiveDataClient.PasskeyWrapData).toBeUndefined();
    expect(held.kB).toEqual(new Uint8Array(32));
  });
});
