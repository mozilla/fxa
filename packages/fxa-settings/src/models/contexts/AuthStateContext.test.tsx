/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import {
  AuthStateProvider,
  useAuthState,
} from './AuthStateContext';

jest.mock('../../lib/cache', () => ({ sessionToken: jest.fn(() => null) }));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthStateProvider>{children}</AuthStateProvider>
);

const signedInWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthStateProvider initialState={{ isSignedIn: true, sessionToken: 'tok', sessionVerified: true }}>
    {children}
  </AuthStateProvider>
);

describe('AuthStateContext', () => {
  it('throws outside provider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuthState())).toThrow(
      'useAuthState must be used within an AuthStateProvider'
    );
  });

  it('provides default state', () => {
    const { result } = renderHook(() => useAuthState(), { wrapper });
    expect(result.current).toMatchObject({ isSignedIn: false, sessionToken: null, sessionVerified: false });
  });

  it('accepts initial state', () => {
    const { result } = renderHook(() => useAuthState(), { wrapper: signedInWrapper });
    expect(result.current).toMatchObject({ isSignedIn: true, sessionToken: 'tok', sessionVerified: true });
  });

  it('setSessionToken updates token and sets signed in', () => {
    const { result } = renderHook(() => useAuthState(), { wrapper });
    act(() => result.current.setSessionToken('new'));
    expect(result.current.sessionToken).toBe('new');
    expect(result.current.isSignedIn).toBe(true);
  });

  it('signOut resets all state', () => {
    const { result } = renderHook(() => useAuthState(), { wrapper: signedInWrapper });
    act(() => result.current.signOut());
    expect(result.current).toMatchObject({ isSignedIn: false, sessionToken: null, sessionVerified: false });
  });

});
